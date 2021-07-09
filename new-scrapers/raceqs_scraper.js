const moment = require('moment');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');
const { appendArray } = require('../utils/array');

const SOURCE = 'raceqs';

(async () => {
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

    const BEGIN_COUNTING_AT = 100000;
    let pageIndex = BEGIN_COUNTING_AT;

    while (pageIndex > 0) {
        const eventUrl = `https://raceqs.com/tv-beta/tv.htm#eventId=${pageIndex}`;

        if (existingUrls.includes(eventUrl)) {
            console.log(
                `Event already exist in database with url ${eventUrl}.`
            );
            pageIndex--;
            continue;
        }

        try {
            const eventId = pageIndex;
            console.log(`Scraping event with url ${eventUrl}`);
            const config = await fetchConfigData(eventId);

            if (
                config.events.length === 0 ||
                !config.events[0]?.tillDtm ||
                config.events[0]?.tillDtm > new Date().getTime()
            ) {
                console.log('No events or future event. So skipping.');
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

            const checkRegatta = getRegattaObject(config);
            newRegattas.push(checkRegatta);

            const {
                newEventStat,
                waypoints,
                divisions,
                starts,
                routes,
            } = getEventData(config, checkRegatta, eventUrl);

            newEvents.push(newEventStat);
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
            });
            console.log('Finished saving race. On to the next one.');
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, eventUrl, err.toString());
        }

        pageIndex--;
    }
    console.log('Finished scraping all events and races.');
    process.exit();
})();

async function fetchConfigData(eventId) {
    const configRequest = await axios.get(
        `https://raceqs.com/rest/meta?id=${eventId}`
    );
    return configRequest.data;
}

function getRegattaObject(config) {
    const checkRegatta = {};
    checkRegatta.id = uuidv4();
    checkRegatta.original_id = config.events[0].regattaId;
    checkRegatta.club_original_id = config.regattas[0].club;
    checkRegatta.name = config.regattas[0].name;
    checkRegatta.url = config.regattas[0].url;
    checkRegatta.content = config.regattas[0].content;
    checkRegatta.attach1 = config.regattas[0].attach1;
    checkRegatta.attach2 = config.regattas[0].attach2;
    checkRegatta.attach3 = config.regattas[0].attach3;
    checkRegatta.attach4 = config.regattas[0].attach4;
    checkRegatta.type = config.regattas[0].type;
    checkRegatta.administrator = config.regattas[0].administrator;
    checkRegatta.updated_at = config.regattas[0].updatedAt;
    checkRegatta.contactor_name = config.regattas[0].ContactorName;
    checkRegatta.contactor_email = config.regattas[0].ContactorEmail;
    return checkRegatta;
}

function getWaypoints(newEventStat, config) {
    return config.waypoints.map((w) => ({
        id: uuidv4(),
        original_id: w.id,
        event: newEventStat.id,
        event_original_id: newEventStat.original_id,
        regatta: newEventStat.regatta,
        regatta_original_id: newEventStat.regatta_original_id,
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
        event: newEventStat.id,
        event_original_id: newEventStat.original_id,
        regatta: newEventStat.regatta,
        regatta_original_id: newEventStat.regatta_original_id,
        name: d.name,
        avatar: d.avatar,
    }));
}

function getStarts(newEventStat, config, divisionsMap) {
    return config.starts.map((s) => ({
        id: uuidv4(),
        original_id: s.id,
        event: newEventStat.id,
        event_original_id: newEventStat.original_id,
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
        event: newEventStat.id,
        event_original_id: newEventStat.original_id,
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

function getEventData(config, checkRegatta, eventUrl) {
    const newEventStat = {};
    newEventStat.id = uuidv4();
    newEventStat.original_id = config.events[0].id;
    newEventStat.regatta = checkRegatta.id;
    newEventStat.regatta_original_id = checkRegatta.original_id;
    newEventStat.name = config.events[0].name;
    newEventStat.content = config.events[0].content;
    newEventStat.from = config.events[0].fromDtm;
    newEventStat.till = config.events[0].tillDtm;
    newEventStat.tz = config.events[0].tz;
    newEventStat.lat1 = config.events[0].lat1;
    newEventStat.lon1 = config.events[0].lon1;
    newEventStat.lat2 = config.events[0].lat2;
    newEventStat.lon2 = config.events[0].lon2;
    newEventStat.updated_at = config.events[0].updatedAt;
    newEventStat.url = eventUrl;

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
        event: newEventStat.id,
        event_original_id: newEventStat.original_id,
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
                event: newEventStat.id,
                event_original_id: newEventStat.original_id,
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

async function saveData({
    newEvents,
    newDivisions,
    newWaypoints,
    newRoutes,
    newStarts,
    newUsers,
    newPositions,
    newRegattas,
}) {
    const objectsToSave = {
        RaceQsRegatta: newRegattas,
        RaceQsEvent: newEvents,
        RaceQsDivision: newDivisions,
        RaceQsParticipant: newUsers,
        RaceQsPosition: newPositions,
        RaceQsStart: newStarts,
        RaceQsRoute: newRoutes,
        RaceQsWaypoint: newWaypoints,
    };
    try {
        await createAndSendTempJsonFile(objectsToSave);
    } catch (err) {
        console.log(
            `Failed creating and sending temp json file for url ${newEvents[0]?.url}`,
            err
        );
        await registerFailedUrl(SOURCE, newEvents[0]?.url, err.toString());
    }
}
