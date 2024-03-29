const axios = require('axios');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
    getUnfinishedRaceData,
    cleanUnfinishedRaces,
} = require('../utils/raw-data-server-utils');
const { ungzip } = require('node-gzip');
const parser = require('xml2json');

(async () => {
    // These are only used for limited scraping. If these are set, the urls are filtered. Example below
    // const raceIdsToScrape = ['534824773'];
    // const allRegattasHash = {
    //   '/cloud/regattas/show/1641932743': '/cloud/regattas/show/1641932743',
    // };
    // const allUsersHash = {
    //   'MMYC': 'MMYC'
    // };
    const raceIdsToScrape = [];
    const allRegattasHash = {};
    const allUsersHash = {};
    const skipWordSearch =
        Object.keys(allRegattasHash).length > 0 ||
        Object.keys(allUsersHash).length > 0;

    const SOURCE = 'tacktracker';
    const TACKTRACKER_MOMENT_FORMAT = 'YYYY-MM-DDThh:mm:ss';
    const REGATTA_URL_PREFIX = 'https://tacktracker.com/cloud/regattas/show/';
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    let existingUrls;
    try {
        existingUrls = await getExistingUrls(SOURCE);
    } catch (err) {
        console.log('Error getting existing urls', err);
        process.exit();
    }

    let unfinishedRaceIdsMap, forceScrapeRacesMap;
    try {
        ({
            unfinishedRaceIdsMap,
            forceScrapeRacesMap,
        } = await getUnfinishedRaceData(SOURCE));
    } catch (err) {
        console.log('Error getting unfinished race ids', err);
        process.exit();
    }
    const scrapedUnfinishedOrigIds = [];
    const existingRegattaIds = [];
    const existingRegattaMap = {};
    const existingUsers = [];
    const existingUserMap = {};
    const urlToUser = {};
    const urlToRegatta = {};

    if (!skipWordSearch) {
        const lowerAlphabet = Array.from(Array(26)).map((e, i) =>
            String.fromCharCode(i + 97)
        ); // a-z
        const upperAlphabet = Array.from(Array(26)).map((e, i) =>
            String.fromCharCode(i + 65)
        ); // A-Z
        const digits = Array.from(Array(10).keys()).map((i) => i.toString()); // 0-9
        const alphabet = [].concat(lowerAlphabet, upperAlphabet, digits, '_');
        console.log('Searching for all users...');
        for (const index in alphabet) {
            const search = alphabet[index];
            const searchUrl =
                'https://tacktracker.com/cloud/service/matching_usernames?term=' +
                search;

            const searchResult = await axios.get(searchUrl);
            const results = searchResult.data;
            for (const resultIndex in results) {
                const user = results[resultIndex];
                allUsersHash[user] = user;
            }
        }
        console.log(
            'Finished getting all users. Searching for all regattas...'
        );

        // All regattas: this is rough.

        const overflow = [
            'cup',
            'regatta',
            'series',
            'championship',
            'worlds',
            'race',
            'euros',
            'IRC',
            'Asia',
            'youth',
            'class',
            'national',
            'class',
            'sail',
            'race',
            'YC',
            'club',
            'yacht',
            'ys',
        ];

        const underflow = [
            'Winter',
            'Summer',
            'Fall',
            'Autumn',
            'Spring',
            'pacific',
            'champs',
            'etchell',
            '2025',
            '2024',
            '2023',
            '2022',
            '2021',
            '2020',
            '2019',
            '2018',
            '2017',
            '2016',
            '2015',
            '2014',
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008',
            '2007',
            '2006',
            '2005',
            '2004',
            '2003',
            '505',
            'dragon',
            '470',
            '49er FX',
            'RS:X',
            'Laser',
            'Nacra',
            'Laser Radial',
            '2.4mR',
            '49er',
            'Finn',
            'Skud',
            'Sonar',
            'T293',
            'open',
            'Perth',
            'Edinburgh',
            'Pacific',
            'Europa',
            'São Paulo',
            'Britain',
            'UK',
            'Shearwater',
            'Carsington',
            'Melbourne',
            'USA',
            'Brisbane',
            'Sydney',
            'Victoria',
            'Oslo',
            'Semana',
            'Italia',
            'dubai',
            'china',
            'international',
            'cowes',
            'ORR',
            'ORC',
            'bay',
            'lake',
            'harbour',
            'gulf',
            'port',
            'porti',
            'vice',
            'junior',
            'men',
            'women',
            'team',
            'solo',
            'memorial',
            'state',
            'great',
            'league',
            'round',
            'division',
            'international',
            'island',
            'round',
            'lighthouse',
            'commodore',
            'navigation',
            'fleet',
            'British',
            'Australian',
            'Danish',
            'French',
            'Italian',
            'prince',
            'distance',
            'racing',
            'st',
            'Lambay ',
            'contender',
            'holiday',
            'easter',
            'captain',
            'yacht club',
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const allWords = [].concat(underflow);
        lowerAlphabet.forEach((letter) => {
            lowerAlphabet.forEach((letter2) => {
                const combo = letter + letter2 + 'yc';
                allWords.push(combo);
            });
        });

        overflow.forEach((word) => {
            overflow.forEach((w) => {
                const newWord = word + ' ' + w;
                allWords.push(newWord);
            });
        });

        for (const index in allWords) {
            const regexp = /\/cloud\/regattas\/show\/[0-9]*/g;
            const searchWord = allWords[index];
            const search = await axios({
                method: 'post',
                url: 'https://tacktracker.com/cloud/regattas/search',
                data: 'search=' + searchWord,
                headers: {
                    Connection: 'keep-alive',
                    Accept: 'text/html, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                    'Content-Type':
                        'application/x-www-form-urlencoded; charset=UTF-8',
                    Origin: 'https://tacktracker.com',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    Referer: 'https://tacktracker.com/cloud/regattas/show',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Cookie:
                        'tt8473=a78ctrgrnt7o9ohd7ooq6mv4bg558s2v; _ga=GA1.2.1428073689.1598324711; _gid=GA1.2.921704798.1599683485',
                },
            });
            const searchResults = search.data;
            const array = searchResults.toString().match(regexp);
            if (array != null) {
                for (const resultIndex in array) {
                    const regattaUrl = array[resultIndex];
                    allRegattasHash[regattaUrl] = regattaUrl;
                }
            }
        }
        console.log('Finished getting all regattas.');
    }

    console.log('Making new user objects.');
    const allUserUrls = [];
    const allRegattaUrls = [];
    const allUsers = Object.keys(allUsersHash);
    const allRegattas = Object.keys(allRegattasHash);
    for (const userIndex in allUsers) {
        const user = allUsers[userIndex];
        allUserUrls.push(
            'https://tacktracker.com/cloud/home/' + user + '/races'
        );
        urlToUser[
            'https://tacktracker.com/cloud/home/' + user + '/races'
        ] = user;
        if (!existingUsers.includes(user)) {
            // save user, and insert id into list
            const newUserId = uuidv4();
            existingUsers.push(user);
            existingUserMap[user] = newUserId;
        }
    }
    console.log('Making new regatta objects.');
    for (const regattaIndex in allRegattas) {
        const regatta = allRegattas[regattaIndex];
        const fullRegattaUrl = 'https://tacktracker.com' + regatta;
        const regattaOriginalId = fullRegattaUrl.split(REGATTA_URL_PREFIX)[1];
        allRegattaUrls.push(fullRegattaUrl);
        urlToRegatta[fullRegattaUrl] = regattaOriginalId;
        if (!existingRegattaIds.includes(regattaOriginalId)) {
            // save regatta, and insert id into list
            const newRegattaId = uuidv4();
            existingRegattaIds.push(regattaOriginalId);
            existingRegattaMap[regattaOriginalId] = newRegattaId;
        }
    }
    console.log('Making list of all race ids...');

    // // raceIdHash stores id to url
    const raceIdHash = {};
    const usersToRaces = {};
    const regattasToRaces = {};
    for (const userUrlIndex in allUserUrls) {
        const currentUrl = allUserUrls[userUrlIndex];
        console.log(
            `Getting race connected to user ${userUrlIndex} of ${allUserUrls.length} with url ${currentUrl}.`
        );
        const result = await axios.get(currentUrl);
        const resultData = result.data;
        const regexp = /onclick="viewRace\('[0-9]*'/g;

        const matches = resultData.toString().match(regexp);
        const currentUser = urlToUser[currentUrl];

        if (usersToRaces[currentUser] === undefined) {
            usersToRaces[currentUser] = [];
        }
        if (matches !== null) {
            for (const matchIndex in matches) {
                const match = matches[matchIndex];
                const regex2 = /[0-9]+/;
                const raceId = match.match(regex2)[0];
                if (
                    raceIdsToScrape.length === 0 ||
                    (raceIdsToScrape.length > 0 &&
                        raceIdsToScrape.includes(raceId))
                ) {
                    raceIdHash[raceId] = currentUrl + '/' + raceId;
                    usersToRaces[currentUser].push(raceId);
                }
            }
        }
    }

    for (const regattaUrlIndex in allRegattaUrls) {
        const currentUrl = allRegattaUrls[regattaUrlIndex];
        console.log(
            `Getting race connected to regatta ${regattaUrlIndex} of ${allRegattaUrls.length} with url ${currentUrl}.`
        );
        const result = await axios.get(currentUrl);
        const resultData = result.data;
        const regexp = /onclick="viewRace\('\d+', '\d+'/g;

        const matches = resultData.toString().match(regexp);
        const currentRegatta = urlToRegatta[currentUrl];

        if (regattasToRaces[currentRegatta] === undefined) {
            regattasToRaces[currentRegatta] = [];
        }
        if (matches !== null) {
            for (const matchIndex in matches) {
                const match = matches[matchIndex];
                const regex2 = /\d+/g;
                const ids = match.match(regex2);
                const raceId = ids[0];
                const raceOrder = ids[1];
                if (
                    raceIdsToScrape.length === 0 ||
                    (raceIdsToScrape.length > 0 &&
                        raceIdsToScrape.includes(raceId))
                ) {
                    raceIdHash[raceId] = `${currentUrl}/${raceOrder}`;
                    regattasToRaces[currentRegatta].push(raceId);
                }
            }
        }
    }

    console.log('List of all race ids finished being populated.');

    const raceIds = Object.keys(raceIdHash);
    console.log('Finished getting list of existing race ids.');
    const todaysDateMs = Date.now();
    for (const raceIdIndex in raceIds) {
        const raceId = raceIds[raceIdIndex];
        const raceUrl = raceIdHash[raceId];
        if (existingUrls.includes(raceUrl)) {
            console.log(
                `Race already exist in database with url ${raceUrl}. Skipping`
            );
            continue;
        }
        console.log(
            `Scraping race with url ${raceUrl} with original race id ${raceId}`
        );
        try {
            const raceRequest = await axios({
                method: 'post',
                responseType: 'arraybuffer',
                url: 'https://tacktracker.com/cloud/service/race_ttz/get',
                data: 'raceid=' + raceId + '&viewer=web',
                headers: {
                    Host: 'tacktracker.com',
                    Accept: '*/*',
                    Origin: 'https://tacktracker.com',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-encoding': 'gzip',
                    Cookie:
                        'tt8473=am6o0qdv2cq5vs6iq51mqld032e01irr; _ga=GA1.2.2066055595.1588439443; _gid=GA1.2.1935310269.1588439443; _gat=1',
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
                },
            });
            console.log('Obtained race data.');
            const raceDataXml = await (
                await ungzip(raceRequest.data)
            ).toString();
            const raceDataSanitized = raceDataXml.replace(/ & /g, 'and');

            const raceDataJson = JSON.parse(parser.toJson(raceDataSanitized))
                .Ttx;
            console.log('Unzipped race data.');

            if (raceDataJson.EventData === undefined) {
                console.log('No event data. Skipping');
                continue;
            }
            const eventData = raceDataJson.EventData.TackTracker.Event;
            const trackData = raceDataJson.TrackData;

            // Race data
            // raceId

            const forceScrapeRaceData = forceScrapeRacesMap[raceId];
            const newRaceId =
                forceScrapeRaceData?.id ||
                unfinishedRaceIdsMap[raceId] ||
                uuidv4();

            let regattaOriginalId = urlToRegatta[raceUrl];
            let userOriginalId = urlToUser[raceUrl];

            // Races either belong to a regatta or a user.
            if (
                regattaOriginalId === undefined &&
                userOriginalId === undefined
            ) {
                if (raceUrl.includes('regattas')) {
                    const parts = raceUrl.split('/');
                    regattaOriginalId = parts[parts.length - 2];
                } else {
                    userOriginalId = raceUrl
                        .split('home/')[1]
                        .split('/races')[0];
                }
            }
            const regatta = existingRegattaMap[regattaOriginalId];
            const user = existingUserMap[userOriginalId];
            const state = raceDataJson.state;
            const start = eventData.Start;
            const eventNotes = eventData.EventNotes;
            const courseNotes = eventData.CourseNotes;
            const uploadParams = eventData.UploadParms;
            const eventName = raceDataJson.event;
            const type = eventData.Type;
            const finishAtStart = eventData.FinishAtStart;
            const span = eventData.Span;
            const course = eventData.Course;
            const raceToSave = {
                id: newRaceId,
                original_id: raceId,
                url: raceUrl,
                regatta: regatta,
                user: user,
                regatta_original_id: regattaOriginalId,
                user_original_id: userOriginalId,
                start: start,
                state: state,
                name: eventName,
                type: type,
                finish_at_start: finishAtStart,
                span: span,
                course: JSON.stringify(course),
                event_notes: JSON.stringify(eventNotes),
                course_notes: JSON.stringify(courseNotes),
                upload_params: JSON.stringify(uploadParams),
            };

            const defaults = eventData.Defaults;
            const defaultsToSave = [
                {
                    id: uuidv4(),
                    race: newRaceId,
                    lon: defaults.lon,
                    lat: defaults.lat,
                    color: defaults.color,
                    trim: defaults.trim,
                },
            ];

            const startMarksToSave = [];
            if (eventData.StartMark !== undefined) {
                const startMark = eventData.StartMark.Mark;
                const startPin = eventData.StartPin.Mark;
                startMarksToSave.push({
                    id: uuidv4(),
                    race: newRaceId,
                    start_mark_name: startMark.Name,
                    start_mark_lat: startMark.Lat,
                    start_mark_lon: startMark.Lon,
                    start_mark_type: startMark.Type,
                    start_pin_name: startPin.Name,
                    start_pin_lat: startPin.Lat,
                    start_pin_lon: startPin.Lon,
                    start_pin_type: startPin.Type,
                });
            }

            const finishMarksToSave = [];
            if (eventData.FinishMark !== undefined) {
                const finishMark = eventData.FinishMark.Mark;
                const finishPin = eventData.FinishPin.Mark;
                finishMarksToSave.push({
                    id: uuidv4(),
                    race: newRaceId,
                    finish_mark_name: finishMark.Name,
                    finish_mark_lat: finishMark.Lat,
                    finish_mark_lon: finishMark.Lon,
                    finish_mark_type: finishMark.Type,
                    finish_pin_name: finishPin.Name,
                    finish_pin_lat: finishPin.Lat,
                    finish_pin_lon: finishPin.Lon,
                    finish_pin_type: finishPin.Type,
                });
            }

            const marksToSave = [];
            if (
                eventData.Marks !== undefined &&
                eventData.Marks.Mark !== undefined
            ) {
                const marks = eventData.Marks.Mark;
                for (const marksIndex in marks) {
                    const m = {
                        id: uuidv4(),
                        name: JSON.stringify(marks[marksIndex].Name),
                        race: newRaceId,
                        lon: marks[marksIndex].Lon,
                        lat: marks[marksIndex].Lat,
                        type: marks[marksIndex].Type,
                    };

                    marksToSave.push(m);
                }
            }

            if (
                eventData.Marks !== undefined &&
                eventData.Marks.GateMark !== undefined
            ) {
                const marks = eventData.Marks.GateMark;
                if (marks.constructor !== Object) {
                    for (const marksIndex in marks) {
                        // always 3
                        const m0 = {
                            id: uuidv4(),
                            name: JSON.stringify(
                                marks[marksIndex].Mark[0].Name
                            ),
                            race: newRaceId,
                            lon: marks[marksIndex].Mark[0].Lon,
                            lat: marks[marksIndex].Mark[0].Lat,
                            type: marks[marksIndex].Mark[0].Type,
                        };
                        const m1 = {
                            id: uuidv4(),
                            name: JSON.stringify(
                                marks[marksIndex].Mark[1].Name
                            ),
                            race: newRaceId,
                            lon: marks[marksIndex].Mark[1].Lon,
                            lat: marks[marksIndex].Mark[1].Lat,
                            type: marks[marksIndex].Mark[1].Type,
                        };
                        const m2 = {
                            id: uuidv4(),
                            name: JSON.stringify(
                                marks[marksIndex].Mark[2].Name
                            ),
                            race: newRaceId,
                            lon: marks[marksIndex].Mark[2].Lon,
                            lat: marks[marksIndex].Mark[2].Lat,
                            type: marks[marksIndex].Mark[2].Type,
                        };

                        marksToSave.push(m0);
                        marksToSave.push(m1);
                        marksToSave.push(m2);
                    }
                } else {
                    const m0 = {
                        id: uuidv4(),
                        name: JSON.stringify(marks.Mark[0].Name),
                        race: newRaceId,
                        lon: marks.Mark[0].Lon,
                        lat: marks.Mark[0].Lat,
                        type: marks.Mark[0].Type,
                    };
                    const m1 = {
                        id: uuidv4(),
                        name: JSON.stringify(marks.Mark[1].Name),
                        race: newRaceId,
                        lon: marks.Mark[1].Lon,
                        lat: marks.Mark[1].Lat,
                        type: marks.Mark[1].Type,
                    };
                    const m2 = {
                        id: uuidv4(),
                        name: JSON.stringify(marks.Mark[2].Name),
                        race: newRaceId,
                        lon: marks.Mark[2].Lon,
                        lat: marks.Mark[2].Lat,
                        type: marks.Mark[2].Type,
                    };

                    marksToSave.push(m0);
                    marksToSave.push(m1);
                    marksToSave.push(m2);
                }
            }

            const boatsToSave = [];
            const positionsToSave = [];
            for (const dataIndex in trackData) {
                let track = trackData[dataIndex].gpx;
                if (track === undefined) {
                    track = trackData[dataIndex];
                }
                const trackeeData = track.metadata.extensions.trackee.split(
                    '-'
                );

                const boatId = uuidv4();
                boatsToSave.push({
                    id: boatId,
                    race: newRaceId,
                    details: trackeeData[1],
                    color: trackeeData[2],
                    unknown_1: trackeeData[3],
                    unknown_2: trackeeData[4],
                    unknown_3: trackeeData[5],
                    unknown_4: trackeeData[6],
                    unknown_5: trackeeData[7],
                    unknown_6: trackeeData[8],
                    name: trackeeData[0],
                });

                const data = track.trk.trkseg.trkpt;
                for (const positionIndex in data) {
                    const positionData = data[positionIndex];
                    if (
                        positionData.lat !== null &&
                        !isNaN(+positionData.lat) &&
                        positionData.lon !== null &&
                        !isNaN(+positionData.lon)
                    ) {
                        const position = {
                            id: uuidv4(),
                            boat: boatId,
                            race: newRaceId,
                            time: positionData.time,
                            lat: positionData.lat,
                            lon: positionData.lon,
                        };
                        positionsToSave.push(position);
                    }
                }
            }

            let startDateMs = Date.parse(start);
            if (forceScrapeRaceData) {
                const now = Date.now();
                if (startDateMs > now) {
                    // if start time is in the future set it today
                    startDateMs = now;
                    raceToSave.start = moment
                        .utc(now)
                        .format(TACKTRACKER_MOMENT_FORMAT);
                }
                raceToSave.state = 'COMPLETE';
            }
            if (
                startDateMs >= todaysDateMs ||
                raceToSave.state !== 'Complete'
            ) {
                console.log(`Unfinished race detected with url ${raceUrl}`);
                scrapedUnfinishedOrigIds.push(raceToSave.original_id);
            } else {
                // Only check boat and positions if race is finished
                const boatParticipants = boatsToSave.filter(
                    (b) =>
                        !['Mark', 'Marker', 'CourseMark'].includes(b.unknown_4)
                );
                if (!boatParticipants.length) {
                    throw new Error('No boats in race');
                }
                if (
                    !positionsToSave.filter((pos) =>
                        boatParticipants.map((bp) => bp.id).includes(pos.boat)
                    ).length
                ) {
                    throw new Error('No boat positions in race');
                }
            }

            const objectsToSave = {
                TackTrackerRace: [raceToSave],
                TackTrackerBoat: boatsToSave,
                TackTrackerDefault: defaultsToSave,
                TackTrackerFinish: finishMarksToSave,
                TackTrackerMark: marksToSave,
                TackTrackerPosition: positionsToSave,
                TackTrackerStart: startMarksToSave,
            };
            if (raceToSave.regatta_original_id) {
                objectsToSave.TackTrackerRegatta = [
                    {
                        id: raceToSave.regatta,
                        url:
                            REGATTA_URL_PREFIX + raceToSave.regatta_original_id,
                        original_id: raceToSave.regatta_original_id,
                    },
                ];
            }

            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${raceUrl}`
                );
                throw err;
            }
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, raceUrl, err.toString());
        }
    }
    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
    console.log('Finished scraping all races.');
    process.exit();
})();
