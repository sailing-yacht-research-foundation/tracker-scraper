const { TackTracker, connect } = require('../tracker-schema/schema.js');
const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const FormData = require('form-data');
const { ungzip } = require('node-gzip');
const parser = require('xml2json');
const { Op } = require('sequelize');

// BUG! Why are almost no regattas saved?

// https://tacktracker.com/cloud/home/OshkoshYachtClub/races/
(async () => {
    const CONNECTED_TO_DB = connect();

    if (CONNECTED_TO_DB) {
        console.log('Getting data from DB...');
        // const tacktrackerMetadata = await TackTracker.TackTrackerMetadata.findOne(
        //     {
        //         attributes: [
        //             'base_race_api_url',
        //             'base_user_race_url',
        //             'base_regatta_race_url',
        //         ],
        //     }
        // );
        const regattas = await TackTracker.TackTrackerRegatta.findAll({
            attributes: ['id', 'url', 'original_id'],
        });
        const users = await TackTracker.TackTrackerUser.findAll({
            attributes: ['id', 'name'],
        });
        console.log('Finished getting data from DB.');
        const existingRegattaIds = [];
        const existingRegattaMap = {};
        const existingUsers = [];
        const existingUserMap = {};
        const urlToUser = {};
        const urlToRegatta = {};
        for (const regattaIndex in regattas) {
            existingRegattaIds.push(regattas[regattaIndex].original_id);
            existingRegattaMap[regattas[regattaIndex].original_id] =
                regattas[regattaIndex].id;
        }

        for (const userIndex in users) {
            existingUsers.push(users[userIndex].name);
            existingUserMap[users[userIndex].name] = users[userIndex].id;
        }
        console.log('Searching for all users...');
        const allUsersHash = {};
        // TODO: make a utility method that includes this list of search characters and loops through it making requests to reuse for all scrapers.
        const alphabet = [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'q',
            'x',
            'y',
            'z',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '0',
            '_',
        ];
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

        const overflow2 = [
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
        const alphabet1 = [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'q',
            'x',
            'y',
            'z',
        ];
        const alphabet2 = [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'q',
            'x',
            'y',
            'z',
        ];
        alphabet1.forEach((letter) => {
            alphabet2.forEach((letter2) => {
                const combo = letter + letter2 + 'yc';
                allWords.push(combo);
            });
        });

        overflow.forEach((word) => {
            overflow2.forEach((w) => {
                const newWord = word + ' ' + w;
                allWords.push(newWord);
            });
        });

        const allRegattasHash = {};
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
            console.log(searchResults);
            const array = searchResults.toString().match(regexp);
            if (array != null) {
                for (const resultIndex in array) {
                    const regattaUrl = array[resultIndex];
                    allRegattasHash[regattaUrl] = regattaUrl;
                }
            }
        }
        console.log('Finished getting all regattas.');
        console.log('Making new user objects.');
        const allUserUrls = [];
        const allRegattaUrls = [];
        const allUsers = [].concat(Object.keys(allUsersHash));
        const allRegattas = [].concat(Object.keys(allRegattasHash));
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
                await TackTracker.TackTrackerUser.create(
                    {
                        id: newUserId,
                        name: user,
                    },
                    { fields: ['id', 'name'] }
                );
            }
        }
        console.log('Making new regatta objects.');
        for (const regattaIndex in allRegattas) {
            const regatta = allRegattas[regattaIndex];
            const fullRegattaUrl = 'https://tacktracker.com' + regatta;
            const regattaOriginalId = fullRegattaUrl.split(
                'https://tacktracker.com/cloud/regattas/show/'
            )[1];
            allRegattaUrls.push(fullRegattaUrl);
            console.log(regattaOriginalId);
            urlToRegatta[fullRegattaUrl] = regattaOriginalId;
            if (!existingRegattaIds.includes(regattaOriginalId)) {
                // save regatta, and insert id into list
                const newRegattaId = uuidv4();
                existingRegattaIds.push(regattaOriginalId);
                existingRegattaMap[regattaOriginalId] = newRegattaId;
                await TackTracker.TackTrackerRegatta.create(
                    {
                        id: newRegattaId,
                        url: fullRegattaUrl,
                        original_id: regattaOriginalId,
                    },
                    { fields: ['id', 'url', 'original_id'] }
                );
            }
        }
        console.log('Making list of all race ids...');

        // // raceIdHash stores id to url
        const raceIdHash = {};
        const usersToRaces = {};
        const regattasToRaces = {};
        for (const userUrlIndex in allUserUrls) {
            const currentUrl = allUserUrls[userUrlIndex];
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
                    raceIdHash[raceId] = currentUrl + '/' + raceId;
                    usersToRaces[currentUser].push(raceId);
                }
            }
        }

        for (const regattaUrlIndex in allRegattaUrls) {
            const currentUrl = allRegattaUrls[regattaUrlIndex];
            const result = await axios.get(currentUrl);
            const resultData = result.data;
            const regexp = /onclick="viewRace\('[0-9]*'/g;

            const matches = resultData.toString().match(regexp);
            const currentRegatta = urlToRegatta[currentUrl];

            if (regattasToRaces[currentRegatta] === undefined) {
                regattasToRaces[currentRegatta] = [];
            }
            if (matches !== null) {
                for (const matchIndex in matches) {
                    const match = matches[matchIndex];
                    const regex2 = /[0-9]+/;
                    const raceId = match.match(regex2)[0];
                    raceIdHash[raceId] = currentUrl;
                    regattasToRaces[currentRegatta].push(raceId);
                }
            }
        }

        console.log('List of all race ids finished being populated.');

        const raceIds = Object.keys(raceIdHash);

        console.log('Getting list of existing race ids..');
        const racesToIgnore = await TackTracker.TackTrackerRace.findAll({
            where: {
                original_id: {
                    [Op.in]: raceIds,
                },
            },
        });

        const raceIdsToIgnore = [];
        for (const ignoreIndex in racesToIgnore) {
            raceIdsToIgnore.push(racesToIgnore[ignoreIndex].original_id);
        }
        console.log('Finished getting list of existing race ids.');
        const todaysDate = new Date();
        for (const raceIdIndex in raceIds) {
            console.log('Beginning parsing new race.');
            const raceId = raceIds[raceIdIndex];
            console.log(raceId);
            if (raceIdsToIgnore.includes(raceId)) {
                console.log("This race was already scraped, so I'll skip it.");
                continue;
            }
            try {
                const raceFormData = new FormData();
                raceFormData.append('raceId', raceId);
                raceFormData.append('viewer', 'web');

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

                const raceDataJson = JSON.parse(
                    parser.toJson(raceDataSanitized)
                ).Ttx;
                console.log('Unzipped race data.');
                // const creator = raceDataJson.creator;
                // const version = raceDataJson.version;
                // const trackCount = raceDataJson.count;
                // const evtData = raceDataJson.evtdata;

                if (raceDataJson.EventData === undefined) {
                    continue;
                }
                const eventData = raceDataJson.EventData.TackTracker.Event;
                const trackData = raceDataJson.TrackData;

                // Race data
                // raceId
                const raceUrl = raceIdHash[raceId];

                const newRaceId = uuidv4();

                let regattaOriginalId = urlToRegatta[raceUrl];
                let userOriginalId = urlToUser[raceUrl];

                // Races either belong to a regatta or a user.
                if (
                    regattaOriginalId === undefined &&
                    userOriginalId === undefined
                ) {
                    if (raceUrl.includes('regattas')) {
                        regattaOriginalId = raceUrl.replace(
                            'https://tacktracker.com/cloud/regattas/show/',
                            ''
                        );
                    } else {
                        userOriginalId = raceUrl
                            .split('home/')[1]
                            .split('/races')[0];
                    }
                }
                const regatta = existingRegattaMap[regattaOriginalId];
                const user = existingUserMap[userOriginalId];

                const start = eventData.Start;
                const date = new Date(Date.parse(start));
                if (date >= todaysDate) {
                    console.log('We only want races that are over.');
                    continue;
                }
                const eventNotes = eventData.EventNotes;
                const courseNotes = eventData.CourseNotes;
                const uploadParams = eventData.UploadParms;
                const state = raceDataJson.state;
                const eventName = raceDataJson.event;
                const type = eventData.Type;
                const finishAtStart = eventData.FinishAtStart;
                const span = eventData.Span;
                const course = eventData.Course;

                await TackTracker.TackTrackerRace.create(
                    {
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
                    },
                    {
                        fields: [
                            'id',
                            'original_id',
                            'url',
                            'regatta',
                            'user',
                            'regatta_original_id',
                            'user_original_id',
                            'start',
                            'state',
                            'name',
                            'type',
                            'span',
                            'course',
                            'event_notes',
                            'course_notes',
                            'upload_params',
                        ],
                    }
                );

                console.log('Added new race to DB.');

                const defaults = eventData.Defaults;
                await TackTracker.TackTrackerDefault.create({
                    id: uuidv4(),
                    race: newRaceId,
                    lon: defaults.lon,
                    lat: defaults.lat,
                    color: defaults.color,
                    trim: defaults.trim,
                });
                if (eventData.StartMark !== undefined) {
                    const startMark = eventData.StartMark.Mark;
                    const startPin = eventData.StartPin.Mark;
                    await TackTracker.TackTrackerStart.create({
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

                if (eventData.FinishMark !== undefined) {
                    const finishMark = eventData.FinishMark.Mark;
                    const finishPin = eventData.FinishPin.Mark;
                    await TackTracker.TackTrackerFinish.create({
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

                if (
                    eventData.Marks !== undefined &&
                    eventData.Marks.Mark !== undefined
                ) {
                    const marks = eventData.Marks.Mark;
                    const marksArray = [];
                    for (const marksIndex in marks) {
                        const m = {
                            id: uuidv4(),
                            name: JSON.stringify(marks[marksIndex].Name),
                            race: newRaceId,
                            lon: marks[marksIndex].Lon,
                            lat: marks[marksIndex].Lat,
                            type: marks[marksIndex].Type,
                        };

                        marksArray.push(m);
                    }

                    await TackTracker.TackTrackerMark.bulkCreate(marksArray, {
                        fields: ['id', 'name', 'race', 'lon', 'lat', 'type'],
                    });
                }

                if (
                    eventData.Marks !== undefined &&
                    eventData.Marks.GateMark !== undefined
                ) {
                    const marks = eventData.Marks.GateMark;
                    const marksArray = [];
                    // Annoyingly, this could be an array of dicts or a dict.
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

                            marksArray.push(m0);
                            marksArray.push(m1);
                            marksArray.push(m2);
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

                        marksArray.push(m0);
                        marksArray.push(m1);
                        marksArray.push(m2);
                    }
                    await TackTracker.TackTrackerMark.bulkCreate(marksArray, {
                        fields: ['id', 'name', 'race', 'lon', 'lat', 'type'],
                    });
                }

                for (const dataIndex in trackData) {
                    let track = trackData[dataIndex].gpx;
                    if (track === undefined) {
                        track = trackData[dataIndex];
                    }
                    const trackeeData = track.metadata.extensions.trackee.split(
                        '-'
                    );

                    const boatId = uuidv4();
                    await TackTracker.TackTrackerBoat.create(
                        {
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
                        },
                        {
                            fields: [
                                'id',
                                'race',
                                'details',
                                'color',
                                'unknown_1',
                                'unknown_2',
                                'unknown_3',
                                'unknown_4',
                                'unknown_5',
                                'unknown_6',
                                'name',
                            ],
                        }
                    );

                    const data = track.trk.trkseg.trkpt;

                    const positions = [];
                    for (const positionIndex in data) {
                        const positionData = data[positionIndex];
                        const position = {
                            id: uuidv4(),
                            boat: boatId,
                            race: newRaceId,
                            time: positionData.time,
                            lat: positionData.lat,
                            lon: positionData.lon,
                        };
                        positions.push(position);
                    }
                    await TackTracker.TackTrackerPosition.bulkCreate(
                        positions,
                        {
                            fields: [
                                'id',
                                'boat',
                                'race',
                                'time',
                                'lon',
                                'lat',
                            ],
                        }
                    );
                }
            } catch (err) {
                console.log(raceId);
                console.log(err);
            }
        }
    } else {
        console.log('not connected');
    }
})();
