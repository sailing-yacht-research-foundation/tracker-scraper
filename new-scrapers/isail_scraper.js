const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const { launchBrowser } = require('../utils/puppeteerLauncher');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');

(async () => {
    const SOURCE = 'isail';
    const existingClasses = {};
    let browser, page;
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    try {
        browser = await launchBrowser();
        page = await browser.newPage();
    } catch (err) {
        console.log('Failed in launching puppeteer.', err);
        process.exit();
    }

    let existingUrls;
    try {
        existingUrls = await getExistingUrls(SOURCE);
    } catch (err) {
        console.log('Error getting existing urls', err);
        process.exit();
    }

    let counter = 1;
    const maximum = 500;
    while (counter < maximum) {
        const url = `http://app.i-sail.com/eventDetails/${counter}`;
        if (existingUrls.includes(url)) {
            console.log(`Url already exist in database ${url}. Skipping.`);
            counter++;
            continue;
        }
        console.log(`Getting new event with url ${url}`);

        try {
            let result = await page.goto(url, {
                timeout: 0,
                waitUntil: 'networkidle2',
            });

            if (result.status() === 404) {
                console.log(`Error 404 in loading page. Skipping url ${url}`);
                counter++;
                continue;
            }

            console.log(`Scraping page url ${url}`);
            const allEventData = await page.evaluate(() => {
                const raceJSON = JSON.parse(
                    document.getElementsByName('raceJSON')[0].content
                );
                let idx = 0;
                while (idx < raceJSON.length) {
                    const race = raceJSON[idx];

                    race.url =
                        'http://app.i-sail.com' +
                        window.Routing.generate('race_details', {
                            id: race.event,
                            race: race.name,
                        });
                    idx += 1;
                }

                const eventJSON = JSON.parse(
                    document.getElementsByName('eventJSON')[0].content
                );
                const participantJSON = JSON.parse(
                    document.getElementsByName('participantJSON')[0].content
                );
                const trackJSON = JSON.parse(
                    document.getElementsByName('trackJSON')[0].content
                );
                const courseMarkJSON = JSON.parse(
                    document.getElementsByName('courseMarkJSON')[0].content
                );
                const markJSON = JSON.parse(
                    document.getElementsByName('markJSON')[0].content
                );
                const startlineJSON = JSON.parse(
                    document.getElementsByName('startlineJSON')[0].content
                );
                const roundingJSON = JSON.parse(
                    document.getElementsByName('roundingJSON')[0].content
                );
                const resultJSON = JSON.parse(
                    document.getElementsByName('resultJSON')[0].content
                );

                return {
                    raceJSON,
                    eventJSON,
                    participantJSON,
                    trackJSON,
                    courseMarkJSON,
                    markJSON,
                    startlineJSON,
                    roundingJSON,
                    resultJSON,
                };
            });

            if (allEventData === null) {
                counter++;
                continue;
            }
            // Check start time and end time of event.
            const eventJSON = allEventData.eventJSON[counter.toString()];

            const startDate = new Date(eventJSON.startDate.date);
            const endDate = new Date(eventJSON.endDate.date);
            const todaysDate = new Date();

            if (
                todaysDate < startDate ||
                todaysDate < endDate ||
                allEventData.raceJSON.length === 0 ||
                typeof allEventData.trackJSON.ids === 'undefined' ||
                allEventData.trackJSON.ids.length === 0
            ) {
                console.log(
                    'Skipping this event because it is not over yet or no tracks available'
                );
                counter++;
                continue;
            }
            console.log(`Saving event url ${url}`);

            const event = {
                id: uuidv4(),
                original_id: eventJSON.id,
                name: eventJSON.name,
                start_date: eventJSON.startDate.date,
                start_timezone_type: eventJSON.startDate.timezone_type,
                start_timezone: eventJSON.startDate.timezone,
                stop_date: eventJSON.endDate.date,
                stop_timezone_type: eventJSON.endDate.timezone_type,
                stop_timezone: eventJSON.endDate.timezone,
                club: eventJSON.club,
                location: eventJSON.location,
                url: url,
            };

            const classes = Object.values(eventJSON.classes);
            const newClasses = [];
            for (const classIndex in classes) {
                const c = classes[classIndex];
                if (
                    existingClasses[c.id] === null ||
                    existingClasses[c.id] === undefined
                ) {
                    const newC = {
                        id: uuidv4(),
                        original_id: c.id,
                        name: c.name,
                    };
                    newClasses.push(newC);
                    existingClasses[newC.original_id] = newC.id;
                }
            }

            // Participants are per event not race
            const participants = [];
            // Open question: is the participant id unique to name? Or is it just an id for this name race combo?
            const participantJSON = allEventData.participantJSON;
            const participantIdMap = {};
            participantJSON.forEach((p) => {
                const participant = {
                    id: uuidv4(),
                    original_id: p.id,
                    class: existingClasses[p.classId],
                    original_class_id: p.classId,
                    class_name: p.className,
                    sail_no: p.sailNumber,
                    event: event.id,
                    original_event_id: p.eventId,
                    name: p.name,
                };
                participantIdMap[p.id] = participant.id;
                participants.push(participant);
            });

            const courseMarkJSON = allEventData.courseMarkJSON;
            const markJSON = allEventData.markJSON;
            const startlineJSON = allEventData.startlineJSON;

            const resultJSON = allEventData.resultJSON;
            const raceJSON = allEventData.raceJSON;

            const raceExtras = [];
            const courseMarkIdMap = {};
            raceJSON.forEach((race) => {
                const r = {
                    id: uuidv4(),
                    original_id: race.id,
                    event: event.id,
                    original_event_id: race.event,
                    name: race.name,
                    start: race.startTime,
                    stop: race.stopTime,
                    wind_direction: race.windDirection,
                    url: race.url,
                };

                const courseMarks = [];
                const marks = [];
                const startlines = [];
                const results = [];
                const raceExtra = {
                    raceObject: r,
                    courseMarks: courseMarks,
                    marks: marks,
                    startlines: startlines,
                    results: results,
                };

                const markIdMap = {};
                markJSON.forEach((v) => {
                    if (v.raceId === race.id) {
                        const m = {
                            id: uuidv4(),
                            original_id: v.id,
                            event: event.id,
                            original_event_id: event.original_id,
                            race: r.id,
                            original_race_id: r.original_id,
                            name: v.name,
                            lon: v.lon,
                            lat: v.lat,
                        };
                        markIdMap[m.original_id] = m.id;
                        marks.push(m);
                    }
                });

                const startlineIdMap = {};
                startlineJSON.forEach((v) => {
                    if (v.raceId === race.id) {
                        const startline = {
                            id: uuidv4(),
                            original_id: v.id,
                            event: event.id,
                            original_event_id: event.original_id,
                            race: r.id,
                            original_race_id: r.original_id,
                            name: v.name,
                            lon_1: v.lon1,
                            lat_1: v.lat1,
                            lon_2: v.lon2,
                            lat_2: v.lat2,
                        };
                        startlineIdMap[v.id] = startline.id;
                        startlines.push(startline);
                    }
                });

                courseMarkJSON.forEach((v) => {
                    if (v.raceId === race.id) {
                        const cm = {
                            id: uuidv4(),
                            original_id: v.id,
                            event: event.id,
                            original_event_id: event.original_id,
                            race: r.id,
                            original_race_id: r.original_id,
                            position: v.position,
                            mark: markIdMap[v.markId],
                            original_mark_id: v.markId,
                            startline: startlineIdMap[v.startlineId],
                            original_startline_id: v.startlineId,
                        };
                        courseMarks.push(cm);
                        courseMarkIdMap[cm.original_id] = cm.id;
                    }
                });

                resultJSON.forEach((v) => {
                    if (v.raceId === race.id) {
                        const result = {
                            id: uuidv4(),
                            original_id: v.id,
                            event: event.id,
                            original_event_id: event.original_id,
                            race: r.id,
                            original_race_id: r.original_id,
                            name: v.rName,
                            points: v.points,
                            time: v.fTime,
                            finaled: v.finaled,
                            participant: participantIdMap[v.participantId],
                            original_participant_id: v.participantId,
                        };
                        results.push(result);
                    }
                });
                raceExtras.push(raceExtra);
            });

            const trackJSON = allEventData.trackJSON;

            const trackData = {
                id: uuidv4(),
                event: event.id,
                original_event_id: event.original_id,
                min_lon: trackJSON.coords.minLon,
                max_lon: trackJSON.coords.maxLon,
                min_lat: trackJSON.coords.minLat,
                max_lat: trackJSON.coords.maxLat,
                start_time: trackJSON.startTime,
                stop_time: trackJSON.stopTime,
            };

            const tracks = [];
            const positions = [];
            const roundings = [];

            /**
             * Each track id value has the following keys:
             * id, name, user.name, user.id, participant.sailnumber, participant.name, participant.id, participant.classEntity, startTime, stopTime, points = []
             */

            const trackIds = trackJSON.ids;
            let urlSuffix = '';

            trackIds.forEach((id) => {
                urlSuffix = urlSuffix + 'trackIds%5B%5D=' + id + '&';
            });
            console.log('Getting tracks');
            result = await axios.get(
                'http://app.i-sail.com/ajax/getPoints?' + urlSuffix
            );

            const positionData = result.data;
            const trackIdMap = {};
            // Positions are keyed by track ids. ['track_id'] = [{position, time, speed, heading, distance}]
            trackIds.forEach((id) => {
                const t = trackJSON[id];
                const trackPositions = positionData[id];
                const track = {
                    id: uuidv4(),
                    original_id: t.id,
                    event: event.id,
                    original_event_id: event.original_id,
                    track_data: trackData.id,
                    participant: participantIdMap[t.participant.id],
                    original_participant_id: t.participant.id,
                    class: existingClasses[t.participant.classEntity.id],
                    original_class_id: t.participant.classEntity.id,
                    original_user_id: t.user.id,
                    user_name: t.user.name,
                    start_time: t.startTime,
                    stop_time: t.stopTime,
                };
                trackIdMap[id] = track.id;
                tracks.push(track);

                trackPositions.forEach((p) => {
                    const position = {
                        id: uuidv4(),
                        event: event.id,
                        original_event_id: event.original_id,
                        track_data: trackData.id,
                        track: track.id,
                        original_track_id: t.id,
                        participant: participantIdMap[t.participant.id],
                        original_participant_id: t.participant.id,
                        class: existingClasses[t.participant.classEntity.id],
                        original_class_id: t.participant.classEntity.id,
                        time: p.t * 1000,
                        speed: p.s,
                        heading: p.h,
                        distance: p.d,
                        lon: p.lon,
                        lat: p.lat,
                    };
                    positions.push(position);
                });
            });

            // roundingJSON is an array
            const roundingJSON = allEventData.roundingJSON;
            if (roundingJSON.length > 0) {
                roundingJSON.forEach((r) => {
                    const rounding = {
                        id: uuidv4(),
                        original_id: r.id,
                        event: event.id,
                        original_event_id: event.original_id,
                        track: trackIdMap[r.trackId],
                        original_track_id: r.trackId,
                        course_mark: courseMarkIdMap[r.courseMarkId],
                        original_course_mark_id: r.courseMarkId,
                        time: r.time,
                        time_since_last_mark: r.timeSinceLastMark,
                        distance_since_last_mark: r.distanceSinceLastMark,
                        rst: r.rst,
                        rsd: r.rsd,
                        max_speed: r.maxSpeed,
                    };
                    roundings.push(rounding);
                });
            }

            const newRaces = [];
            let newCourseMarks = [];
            let newMarks = [];
            let newStartlines = [];
            let newResults = [];

            raceExtras.forEach((raceExtra) => {
                const race = raceExtra.raceObject;
                newRaces.push(race);
                newCourseMarks = newCourseMarks.concat(raceExtra.courseMarks);
                newMarks = newMarks.concat(raceExtra.marks);
                newStartlines = newStartlines.concat(raceExtra.startlines);
                newResults = newResults.concat(raceExtra.results);
            });
            const objectsToSave = {
                iSailEvent: event,
                iSailRace: newRaces,
                iSailClass: newClasses,
                iSailEventParticipant: participants,
                iSailEventTracksData: trackData,
                iSailTrack: tracks,
                iSailPosition: positions,
                iSailMark: newMarks,
                iSailStartline: newStartlines,
                iSailCourseMark: newCourseMarks,
                iSailResult: newResults,
                iSailRounding: roundings,
            };
            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${url}`
                );
                throw err;
            }
        } catch (err) {
            console.log(`Failed scraping race url ${url}`, err);
            await registerFailedUrl(SOURCE, url, err.toString());
        }
        counter++;
    }
    await browser.close();
    console.log('Finished scraping all events.');
    process.exit();
})();