const {
    iSail,
    SearchSchema,
    sequelize,
    connect,
    bulkSave,
} = require('../tracker-schema/schema.js');
const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const {
    createBoatToPositionDictionary,
    positionsToFeatureCollection,
    collectFirstNPositionsFromBoatsToPositions,
    collectLastNPositionsFromBoatsToPositions,
    getCenterOfMassOfPositions,
    findAverageLength,
    createRace,
    allPositionsToFeatureCollection,
    findCenter,
} = require('../tracker-schema/gis_utils.js');
const { launchBrowser } = require('../utils/puppeteerLauncher');
const turf = require('@turf/turf');
const { uploadGeoJsonToS3 } = require('../utils/upload_racegeojson_to_s3.js');

const ISAIL_SOURCE = 'ISAIL';

(async () => {
    const CONNECTED_TO_DB = connect();
    if (!CONNECTED_TO_DB) {
        process.exit();
    }

    if (CONNECTED_TO_DB) {
        let existingEvents, existingClassObjects, failedUrls, browser, page;
        const existingEventUrls = [];
        const existingClasses = {};
        const existingFailures = [];

        try {
            existingEvents = await iSail.iSailEvent.findAll({
                attributes: ['id', 'original_id', 'name', 'url'],
            });
            existingClassObjects = await iSail.iSailClass.findAll({
                attributes: ['id', 'original_id', 'name'],
            });
            failedUrls = await iSail.iSailFailedUrl.findAll({
                attributes: ['url'],
            });
        } catch (err) {
            console.log('Failed getting database metadata and races.', err);
            process.exit();
        }

        for (const urlIndex in failedUrls) {
            const u = failedUrls[urlIndex];
            existingFailures.push(u);
        }
        for (const eventIndex in existingEvents) {
            existingEventUrls.push(existingEvents[eventIndex].url);
        }

        for (const classIndex in existingClassObjects) {
            const c = existingEventUrls[classIndex];
            existingClasses[c.original_id] = c.id;
        }

        try {
            browser = await launchBrowser();
            page = await browser.newPage();
        } catch (err) {
            console.log('Failed in launching puppeteer.', err);
            process.exit();
        }

        let counter = 1;
        const maximum = 500;
        while (counter < maximum) {
            const url = `http://app.i-sail.com/eventDetails/${counter}`;
            console.log(`Getting new event with url ${url}`);

            if (
                existingEventUrls.includes(url) ||
                existingFailures.includes(url)
            ) {
                console.log(
                    `Event already exist in database. Skipping url ${url}`
                );
                counter += 1;
                continue;
            }

            try {
                let result = await page.goto(url, {
                    timeout: 0,
                    waitUntil: 'networkidle2',
                });

                if (result.status() === 404) {
                    console.log(
                        `Error 404 in loading page. Skipping url ${url}`
                    );
                    counter += 1;
                    continue;
                }

                let didError = false;
                console.log(`Scraping page url ${url}`);
                const allEventData = await page
                    .evaluate(() => {
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
                            document.getElementsByName('participantJSON')[0]
                                .content
                        );
                        const trackJSON = JSON.parse(
                            document.getElementsByName('trackJSON')[0].content
                        );
                        const courseMarkJSON = JSON.parse(
                            document.getElementsByName('courseMarkJSON')[0]
                                .content
                        );
                        const markJSON = JSON.parse(
                            document.getElementsByName('markJSON')[0].content
                        );
                        const startlineJSON = JSON.parse(
                            document.getElementsByName('startlineJSON')[0]
                                .content
                        );
                        const roundingJSON = JSON.parse(
                            document.getElementsByName('roundingJSON')[0]
                                .content
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
                    })
                    .catch((error) => {
                        console.log(error);
                        didError = true;
                    });

                if (allEventData === null || didError) {
                    counter += 1;
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
                    counter += 1;
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
                            class:
                                existingClasses[t.participant.classEntity.id],
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
                    newCourseMarks = newCourseMarks.concat(
                        raceExtra.courseMarks
                    );
                    newMarks = newMarks.concat(raceExtra.marks);
                    newStartlines = newStartlines.concat(raceExtra.startlines);
                    newResults = newResults.concat(raceExtra.results);
                });
                const transaction = await sequelize.transaction();
                try {
                    const newObjectsToSave = [
                        {
                            objectType: iSail.iSailEvent,
                            objects: [event],
                        },
                        {
                            objectType: iSail.iSailClass,
                            objects: newClasses,
                        },
                        {
                            objectType: iSail.iSailEventParticipant,
                            objects: participants,
                        },
                        {
                            objectType: iSail.iSailRace,
                            objects: newRaces,
                        },
                        {
                            objectType: iSail.iSailEventTracksData,
                            objects: trackData,
                        },
                        {
                            objectType: iSail.iSailTrack,
                            objects: tracks,
                        },
                        {
                            objectType: iSail.iSailPosition,
                            objects: positions,
                        },
                        {
                            objectType: iSail.iSailMark,
                            objects: newMarks,
                        },
                        {
                            objectType: iSail.iSailStartline,
                            objects: newStartlines,
                        },
                        {
                            objectType: iSail.iSailCourseMark,
                            objects: newCourseMarks,
                        },
                        {
                            objectType: iSail.iSailResult,
                            objects: newResults,
                        },
                        {
                            objectType: iSail.iSailRounding,
                            objects: roundings,
                        },
                    ];
                    console.log(
                        `Bulk saving data for event original id = ${event.original_id}`
                    );
                    const saved = await bulkSave(newObjectsToSave, transaction);
                    if (!saved) {
                        throw new Error('Failed to save bulk data');
                    }
                    // Normalize each race and create geojson to s3 bucket
                    console.log('Normalizing race data');
                    await Promise.all(
                        raceJSON.map(async (race, index) => {
                            const raceTrackIds = race.trackIds;
                            const newRace = newRaces.find(
                                (r) => r.original_id === race.id
                            );
                            const racePositions = positions.filter((pos) => {
                                const isPositionInTrack = raceTrackIds.includes(
                                    pos.original_track_id
                                );
                                if (isPositionInTrack) {
                                    let isPositionInRaceTime;
                                    const isAfterStart =
                                        pos.time >= newRace.start * 1000;
                                    const isBeforeEnd =
                                        pos.time <= newRace.stop * 1000;
                                    if (index === 0) {
                                        // include positions before start if race is earliest
                                        isPositionInRaceTime = isBeforeEnd;
                                    } else if (index === raceJSON.length - 1) {
                                        // include positions after end if race is latest
                                        isPositionInRaceTime = isAfterStart;
                                    } else {
                                        isPositionInRaceTime =
                                            isAfterStart && isBeforeEnd;
                                    }
                                    return isPositionInRaceTime;
                                }
                                return false;
                            });
                            const raceTracks = tracks.filter((t) =>
                                raceTrackIds.includes(t.original_id)
                            );
                            const raceParticipantIds = raceTracks.map(
                                (t) => t.original_participant_id
                            );
                            const raceParticipants = participants.filter((p) =>
                                raceParticipantIds.includes(p.original_id)
                            );
                            const raceStartLines = newStartlines.filter(
                                (s) => s.original_race_id === race.id
                            );
                            // Add the participantId in positions object for normalization
                            racePositions.map((pos) => {
                                const participantId = tracks.find(
                                    (t) => t.id === pos.track
                                )?.participant;
                                if (participantId) {
                                    pos.participant = participantId;
                                }
                                return pos;
                            });
                            await normalizeRace(
                                newRace,
                                racePositions,
                                raceStartLines,
                                raceParticipants,
                                transaction
                            );
                        })
                    );
                    await transaction.commit();
                } catch (err) {
                    transaction.rollback();
                    throw err;
                }
            } catch (err) {
                console.log(err);
                try {
                    await iSail.iSailFailedUrl.create(
                        { id: uuidv4(), url: url, error: err.toString() },
                        { fields: ['id', 'url', 'error'] }
                    );
                } catch (err2) {
                    console.log(
                        'Failed inserting failed record in database',
                        err2
                    );
                }
            }

            counter += 1;
        }
        await browser.close();
        console.log('Finished scraping all events.');
    } else {
        console.log('Unable to connect to DB.');
    }
    process.exit();
})();

async function normalizeRace(
    race,
    allPositions,
    startLines,
    boats,
    transaction
) {
    if (allPositions.length === 0) {
        console.log('No positions so skipping.');
        return;
    }
    const id = race.id;
    const name = race.name;
    const event = race.event;
    const url = race.url;
    const startTime = new Date(race.start * 1000).getTime();
    const endTime = new Date(race.stop * 1000).getTime();
    const boundingBox = turf.bbox(
        positionsToFeatureCollection('lat', 'lon', allPositions)
    );
    allPositions.forEach((p) => {
        p.timestamp = p.time;
    });
    const boatsToSortedPositions = createBoatToPositionDictionary(
        allPositions,
        'participant',
        'time'
    );

    const startObj = startLines.find((sl) => sl.name === 'start');
    const endObj = startLines.find((sl) => sl.name === 'finish');
    let startPoint, endPoint;
    if (startObj) {
        startPoint = findCenter(
            startObj.lat_1,
            startObj.lon_1,
            startObj.lat_2,
            startObj.lon_2
        );
    } else {
        const first3Positions = collectFirstNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        startPoint = getCenterOfMassOfPositions('lat', 'lon', first3Positions);
    }
    if (endObj) {
        endPoint = findCenter(
            endObj.lat_1,
            endObj.lon_1,
            endObj.lat_2,
            endObj.lon_2
        );
    } else {
        const last3Positions = collectLastNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        endPoint = getCenterOfMassOfPositions('lat', 'lon', last3Positions);
    }

    const boatNames = [];
    const boatModels = [];
    const handicapRules = [];
    const boatIdentifiers = [];
    const unstructuredText = [];
    boats.forEach((b) => {
        boatNames.push(b.name);
        boatModels.push(b.class_name);
        boatIdentifiers.push(b.sail_no);
    });
    const roughLength = findAverageLength('lat', 'lon', boatsToSortedPositions);
    const raceMetadata = await createRace(
        id,
        name,
        event,
        ISAIL_SOURCE,
        url,
        startTime,
        endTime,
        startPoint,
        endPoint,
        boundingBox,
        roughLength,
        boatsToSortedPositions,
        boatNames,
        boatModels,
        boatIdentifiers,
        handicapRules,
        unstructuredText
    );
    const tracksGeojson = JSON.stringify(
        allPositionsToFeatureCollection(boatsToSortedPositions)
    );

    await SearchSchema.RaceMetadata.create(raceMetadata, {
        fields: Object.keys(raceMetadata),
        transaction,
    });
    console.log('Uploading to s3');
    await uploadGeoJsonToS3(race.id, tracksGeojson, ISAIL_SOURCE, transaction);
}
