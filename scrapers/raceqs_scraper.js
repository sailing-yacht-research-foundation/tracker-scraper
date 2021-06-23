const turf = require('@turf/turf');
const moment = require('moment');
const {
    RaceQs,
    connect,
    findExistingObjects,
    instantiateOrReturnExisting,
    bulkSave,
    sequelize,
    SearchSchema,
} = require('../tracker-schema/schema.js');
const {
    createBoatToPositionDictionary,
    positionsToFeatureCollection,
    collectFirstNPositionsFromBoatsToPositions,
    collectLastNPositionsFromBoatsToPositions,
    getCenterOfMassOfPositions,
    findAverageLength,
    createRace,
    createTurfPoint,
    allPositionsToFeatureCollection,
} = require('../tracker-schema/gis_utils.js');
const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const { appendArray } = require('../utils/array');
const { uploadGeoJsonToS3 } = require('../utils/upload_racegeojson_to_s3');

const RACEQS_SOURCE = 'RACEQS';

async function fetchConfigData(eventId) {
    const configRequest = await axios.get(
        `https://raceqs.com/rest/meta?id=${eventId}`
    );
    return configRequest.data;
}

function getRegattaObject(existingObjects, config) {
    const checkRegatta = instantiateOrReturnExisting(
        existingObjects,
        RaceQs.Regatta,
        config.events[0].regattaId
    );
    checkRegatta.obj.club_original_id = config.regattas[0].club;
    checkRegatta.obj.name = config.regattas[0].name;
    checkRegatta.obj.url = config.regattas[0].url;
    checkRegatta.obj.content = config.regattas[0].content;
    checkRegatta.obj.attach1 = config.regattas[0].attach1;
    checkRegatta.obj.attach2 = config.regattas[0].attach2;
    checkRegatta.obj.attach3 = config.regattas[0].attach3;
    checkRegatta.obj.attach4 = config.regattas[0].attach4;
    checkRegatta.obj.type = config.regattas[0].type;
    checkRegatta.obj.administrator = config.regattas[0].administrator;
    checkRegatta.obj.updated_at = config.regattas[0].updatedAt;
    checkRegatta.obj.contactor_name = config.regattas[0].ContactorName;
    checkRegatta.obj.contactor_email = config.regattas[0].ContactorEmail;
    return checkRegatta;
}

function getWaypoints(newEventStat, config) {
    return config.waypoints.map((w) => ({
        id: uuidv4(),
        original_id: w.id,
        event: newEventStat.obj.id,
        event_original_id: newEventStat.obj.original_id,
        regatta: newEventStat.obj.regatta,
        regatta_original_id: newEventStat.obj.regatta_original_id,
        start: w.start,
        finish: w.finish,
        lat: w.lat,
        lon: w.lon,
        lat2: w.lat2,
        lon2: w.lon2,
        port_course: w.portCourse,
        port_speed: w.portSpeed,
        starboard_course: w.starboardCourse,
        starboard_speed: w.starboardSpeed,
        wind: w.wind,
        tack: w.tack,
        type: w.type,
        v: w.v,
        start_I: w.startI,
        finish_I: w.finishI,
        start_Z: w.startZ,
        finish_Z: w.finishZ,
        name: w.name,
        race_type: w.race_type,
        boat_model: w.boat_model,
    }));
}

function getDivisions(newEventStat, config) {
    return config.divisions.map((d) => ({
        id: uuidv4(),
        original_id: d.id,
        event: newEventStat.obj.id,
        event_original_id: newEventStat.obj.original_id,
        regatta: newEventStat.obj.regatta,
        regatta_original_id: newEventStat.obj.regatta_original_id,
        name: d.name,
        avatar: d.avatar,
    }));
}

function getStarts(newEventStat, config, divisionsMap) {
    return config.starts.map((s) => ({
        id: uuidv4(),
        original_id: s.id,
        event: newEventStat.obj.id,
        event_original_id: newEventStat.obj.original_id,
        division: divisionsMap[s.divisionId],
        division_original_id: s.divisionId,
        from: s.fromDtm,
        type: s.type,
        wind: s.wind,
        min_duration: s.minDuration,
    }));
}

function getRoutes(newEventStat, config, startsMap, waypointsMap) {
    return config.routes.map((r) => ({
        id: uuidv4(),
        original_id: r.id,
        event: newEventStat.obj.id,
        event_original_id: newEventStat.obj.original_id,
        start: startsMap[r.startId],
        start_original_id: r.startId,
        waypoint: waypointsMap[r.waypointId],
        waypoint_original_id: r.waypointId,
        sqk: r.sqk,
        wind_direction: r.windDirection,
        wind_speed: r.windSpeed,
        current_direction: r.currentDirection,
        current_speed: r.currentSpeed,
    }));
}

function getEventData(existingObjects, config, checkRegatta, eventUrl) {
    const newEventStat = instantiateOrReturnExisting(
        existingObjects,
        RaceQs.Event,
        config.events[0].id
    );

    if (newEventStat.shouldSave) {
        newEventStat.obj.regatta = checkRegatta.obj.id;
        newEventStat.obj.regatta_original_id = checkRegatta.obj.original_id;
        newEventStat.obj.name = config.events[0].name;
        newEventStat.obj.content = config.events[0].content;
        newEventStat.obj.from = config.events[0].fromDtm;
        newEventStat.obj.till = config.events[0].tillDtm;
        newEventStat.obj.tz = config.events[0].tz;
        newEventStat.obj.lat1 = config.events[0].lat1;
        newEventStat.obj.lon1 = config.events[0].lon1;
        newEventStat.obj.lat2 = config.events[0].lat2;
        newEventStat.obj.lon2 = config.events[0].lon2;
        newEventStat.obj.updated_at = config.events[0].updatedAt;
        newEventStat.obj.url = eventUrl;

        const wpts = {};
        const waypoints = getWaypoints(newEventStat, config);
        waypoints.forEach((w) => {
            wpts[w.original_id] = w.id;
        });

        const divs = {};
        const divisions = getDivisions(newEventStat, config);
        divisions.forEach((d) => {
            divs[d.original_id] = d.id;
        });

        const startsMap = {};
        const starts = getStarts(newEventStat, config, divs);
        starts.forEach((s) => {
            startsMap[s.original_id] = s.id;
        });

        const routes = getRoutes(newEventStat, config, startsMap, wpts);

        return {
            newEventStat,
            waypoints,
            divisions,
            starts,
            routes,
        };
    }

    return {
        newEventStat,
    };
}

function getEventTimeString(event) {
    const s = moment(event.fromDtm)
        .utcOffset(event.tz)
        .format('YYYY-MM-DDTHH:mm:ssZ');
    const f = moment(event.tillDtm)
        .utcOffset(event.tz)
        .format('YYYY-MM-DDTHH:mm:ssZ');
    return s + '..' + f;
}

async function fetchUsers(newEventStat, event, eventTimeString) {
    const lat1 = event.lat1;
    const lat2 = event.lat2;
    const long1 = event.lon1;
    const long2 = event.lon2;
    const latString = '&lat=' + lat1 + '..' + lat2;
    const lonString = '&lon=' + long1 + '..' + long2;
    const url = `https://raceqs.com/rest/environment?dt=${eventTimeString}${latString}${lonString}`;
    const environmentRequest = await axios.get(url);
    return getUsers(environmentRequest.data, newEventStat);
}

function getUsers(environmentData, newEventStat) {
    return environmentData.map((u) => ({
        id: uuidv4(),
        original_id: u.userId,
        event: newEventStat.obj.id,
        event_original_id: newEventStat.obj.original_id,
        boat: u.boat,
        start: u.startDt,
        finish: u.finishDt,
    }));
}

async function fetchUsersPositions(newEventStat, users, eventTimeString) {
    const positions = [];
    const usersMap = {};
    users.forEach((u) => {
        usersMap[u.original_id] = u.id;
    });
    for (const i in users) {
        const user = users[i];
        const positionUrl = `https://raceqs.com/rest/data?userId=${user.original_id}&dt=${eventTimeString}`;
        console.log(`Getting positionUrl ${positionUrl}`);

        const positionsRequest = await axios.get(positionUrl);
        const uid = user.original_id;

        const lines = `${positionsRequest.data}`.split('\n');
        lines.shift();
        lines.forEach((line) => {
            const tabs = line.split('\t');
            const time = tabs[0];
            const lat = tabs[1];
            const lon = tabs[2];
            const roll = tabs[3];
            const pitch = tabs[4];
            const heading = tabs[5];
            const sow = tabs[6];
            const windAngle = tabs[7];
            const windSpeed = tabs[8];

            const position = {
                id: uuidv4(),
                event: newEventStat.obj.id,
                event_original_id: newEventStat.obj.original_id,
                participant: usersMap[uid],
                participant_original_id: uid,
                time: time,
                lat: lat,
                lon: lon,
                roll: roll,
                pitch: pitch,
                heading: heading,
                sow: sow,
                wind_angle: windAngle,
                wind_speed: windSpeed,
            };
            positions.push(position);
        });
        console.log('positions length after appending', positions.length);
    }
    return positions;
}

const normalizeRace = async ({
    event,
    regatta,
    waypoints,
    positions,
    participants,
    transaction,
}) => {
    console.log('Normalizing race');
    const allPositions = [];
    positions.forEach((p) => {
        p.timestamp = parseInt(p.time) * 100;
        if (p.lat && p.lon && p.timestamp) {
            allPositions.push(p);
        }
    });
    console.log(`Position length: ${allPositions.length}`);
    if (allPositions.length === 0) {
        console.log('No positions so skipping.');
        return;
    }

    const id = event.id;
    const name = `${regatta.name} - ${event.name}`;
    const regattaId = event.regatta;
    const url = event.url;
    const startTime = parseInt(event.from);
    const endTime = parseInt(event.till);

    const boatIdentifiers = [];
    const boatNames = [];
    const unstructuredText = [];
    const classes = [];
    const handicaps = [];
    participants.forEach((p) => {
        boatNames.push(p.boat);
    });

    let startPoint = null;
    let endPoint = null;
    waypoints.forEach((wpt) => {
        if (wpt.type === 'Start') {
            startPoint = createTurfPoint(wpt.lat, wpt.lon);
        } else if (wpt.type === 'Finish') {
            endPoint = createTurfPoint(wpt.lat, wpt.lon);
        }
    });

    const fc = positionsToFeatureCollection('lat', 'lon', allPositions);
    const boundingBox = turf.bbox(fc);
    const boatsToSortedPositions = createBoatToPositionDictionary(
        allPositions,
        'participant',
        'timestamp'
    );

    if (!startPoint) {
        const first3Positions = collectFirstNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        startPoint = getCenterOfMassOfPositions('lat', 'lon', first3Positions);
    }
    if (!endPoint) {
        const last3Positions = collectLastNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        endPoint = getCenterOfMassOfPositions('lat', 'lon', last3Positions);
    }

    const roughLength = findAverageLength('lat', 'lon', boatsToSortedPositions);
    const raceMetadata = await createRace(
        id,
        name,
        regattaId,
        RACEQS_SOURCE,
        url,
        startTime,
        endTime,
        startPoint,
        endPoint,
        boundingBox,
        roughLength,
        boatsToSortedPositions,
        boatNames,
        classes,
        boatIdentifiers,
        handicaps,
        unstructuredText
    );

    const tracksGeojson = JSON.stringify(
        allPositionsToFeatureCollection(boatsToSortedPositions)
    );
    await uploadGeoJsonToS3(id, tracksGeojson, RACEQS_SOURCE, transaction);

    await SearchSchema.RaceMetadata.create(raceMetadata, {
        fields: Object.keys(raceMetadata),
        transaction,
    });
};

async function saveData({
    newEvents,
    newDivisions,
    newWaypoints,
    newRoutes,
    newStarts,
    newUsers,
    newPositions,
    newRegattas,
    checkRegatta,
}) {
    let transaction = null;
    try {
        transaction = await sequelize.transaction();

        const newObjectsToSave = [
            { objectType: RaceQs.Event, objects: newEvents },
            { objectType: RaceQs.Division, objects: newDivisions },
            { objectType: RaceQs.Waypoint, objects: newWaypoints },
            { objectType: RaceQs.Route, objects: newRoutes },
            { objectType: RaceQs.Start, objects: newStarts },
            { objectType: RaceQs.Participant, objects: newUsers },
            { objectType: RaceQs.Position, objects: newPositions },
            { objectType: RaceQs.Regatta, objects: newRegattas },
        ];
        console.log('Bulk saving objects.');
        const saved = await bulkSave(newObjectsToSave, transaction);
        if (!saved) {
            throw new Error('Failed to save bulk data');
        }
        await normalizeRace({
            event: newEvents[0],
            regatta: checkRegatta,
            waypoints: newWaypoints,
            positions: newPositions,
            participants: newUsers,
            transaction,
        });
        await transaction.commit();
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        throw new Error('Failed to save data - ' + err.message);
    }
}

const mainScript = async () => {
    const dbConnected = await connect();
    if (!dbConnected) {
        process.exit();
    }
    let existingObjects, existingFailedUrls;
    try {
        existingObjects = await findExistingObjects(RaceQs);
        existingFailedUrls = await RaceQs.FailedUrl.findAll({
            attributes: ['url'],
            raw: true,
        });
    } catch (err) {
        console.log('Failed getting races and failed url in database.', err);
        process.exit();
    }

    const BEGIN_COUNTING_AT = 100000;
    // const BEGIN_COUNTING_AT = 62880;

    let pageIndex = BEGIN_COUNTING_AT;

    while (pageIndex > 0) {
        const eventUrl =
            'https://raceqs.com/tv-beta/tv.htm#eventId=' + pageIndex;

        if (existingFailedUrls.some((i) => i.url === eventUrl)) {
            console.log(
                `Existing failed url ${eventUrl}. Check database table for error message.`
            );
            pageIndex--;
            continue;
        }
        try {
            const eventId = pageIndex;
            console.log('Getting new race.');
            console.log(eventUrl);
            const config = await fetchConfigData(eventId);

            if (config.events.length === 0) {
                console.log('No events, so skip.');
                pageIndex--;
                continue;
            }

            // EVENTS is array of one object:

            const newRegattas = [];
            const newEvents = [];
            const newWaypoints = [];
            const newDivisions = [];
            const newRoutes = [];
            const newStarts = [];
            const newUsers = [];
            const newPositions = [];

            const checkRegatta = getRegattaObject(existingObjects, config);
            if (checkRegatta.shouldSave) {
                newRegattas.push(checkRegatta.obj);
            }

            const {
                newEventStat,
                waypoints,
                divisions,
                starts,
                routes,
            } = getEventData(existingObjects, config, checkRegatta, eventUrl);

            if (!newEventStat.shouldSave) {
                console.log('Skipping this race cause you already indexed it.');
                pageIndex--;
                continue;
            }

            newEvents.push(newEventStat.obj);
            appendArray(newWaypoints, waypoints);
            appendArray(newDivisions, divisions);
            appendArray(newStarts, starts);
            appendArray(newRoutes, routes);

            const event = config.events[0];
            console.log('Getting user positions.');
            const timestring = getEventTimeString(event);
            const users = await fetchUsers(newEventStat, event, timestring);
            appendArray(newUsers, users);

            const positions = await fetchUsersPositions(
                newEventStat,
                users,
                timestring
            );
            appendArray(newPositions, positions);

            // let startUrls = []
            // config.starts.forEach(s=>{
            //     let startUrl = 'https://raceqs.com/rest/start?id=' + s.id
            //     startUrls.push(startUrl)
            // })

            // for(startUrlIndex in startUrls){
            //     let startUrl = startUrls[startUrlIndex]
            //     let startConfigRequest = await axios.get(startUrl)
            //     console.log(startConfigRequest.data)
            // }

            await saveData({
                newEvents,
                newDivisions,
                newWaypoints,
                newRoutes,
                newStarts,
                newUsers,
                newPositions,
                newRegattas,
                checkRegatta,
            });
            console.log('Finished saving race. On to the next one.');
        } catch (err) {
            console.log(err);
            await RaceQs.FailedUrl.create({
                id: uuidv4(),
                url: eventUrl,
                error: err.toString(),
            });
        }

        pageIndex--;
    }
    console.log('Finished scraping all events and races.');
    process.exit();
};

if (require.main === module) {
    // Only run the main script if not added as a dependency module
    mainScript();
}
exports.normalizeRace = normalizeRace;
