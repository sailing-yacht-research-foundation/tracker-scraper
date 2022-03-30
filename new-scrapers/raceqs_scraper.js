const moment = require('moment');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingData,
    registerFailedUrl,
    getUnfinishedRaceIds,
    cleanUnfinishedRaces,
} = require('../utils/raw-data-server-utils');
const { appendArray } = require('../utils/array');
const axiosRetry = require('axios-retry');

const SOURCE = 'raceqs';
const RACEQS = {
    START_PREFIX: 'raceqs-start-',
    DIVISION_PREFIX: 'raceqs-division-',
};

(async () => {
    axiosRetry(axios, {
        retryDelay: (retryCount) => {
            console.log(`retry attempt: ${retryCount}`);
            return retryCount * 2000; // time interval between retries
        },
        retries: 5,
    });
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    const RACE_SCRAPE_RANGE = 2000; // Added to the last race index to get a range of id to be scraped
    let existingUrls;
    let maxRaceIndex;
    try {
        const existingData = await getExistingData(SOURCE);
        const prevMaxRaceId = existingData.reduce((acc, d) => {
            const origId = +d.original_id
                ?.replace(RACEQS.START_PREFIX, '')
                .replace(RACEQS.DIVISION_PREFIX, '')
                .split('-')[0];
            if (origId > acc) {
                acc = origId;
            }
            return acc;
        }, 0);
        maxRaceIndex = prevMaxRaceId + RACE_SCRAPE_RANGE || RACE_SCRAPE_RANGE;
        existingUrls = existingData.map((u) => u.url);
    } catch (err) {
        console.log('Error getting max race id and existing urls', err);
        process.exit();
    }

    let unfinishedRaceIdsMap;
    try {
        unfinishedRaceIdsMap = await getUnfinishedRaceIds(SOURCE);
    } catch (err) {
        console.log('Error getting unfinished race ids', err);
        process.exit();
    }
    const scrapedUnfinishedOrigIds = [];

    let pageIndex = 1;
    while (pageIndex <= maxRaceIndex) {
        const eventUrl = `https://raceqs.com/tv-beta/tv.htm#eventId=${pageIndex}`;

        if (existingUrls.includes(eventUrl)) {
            console.log(
                `Event already exist in database with url ${eventUrl}.`
            );
            pageIndex++;
            continue;
        }

        try {
            const eventId = pageIndex;
            console.log(`Scraping event with url ${eventUrl}`);
            const config = await fetchConfigData(eventId);

            const now = Date.now();
            if (config.events.length === 0) {
                console.log('No events. Skipping.');
                pageIndex++;
                continue;
            }
            let isUnfinished = false;
            if (
                config.events[0]?.fromDtm > now ||
                (config.events[0]?.fromDtm && !config.events[0]?.tillDtm) ||
                config.events[0]?.tillDtm > now
            ) {
                console.log('Unfinished race detected', eventUrl);
                isUnfinished = true;
                scrapedUnfinishedOrigIds.push(config.events[0].id);
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
            } = getEventData(
                config,
                checkRegatta,
                eventUrl,
                unfinishedRaceIdsMap
            );

            if (isUnfinished) {
                newEventStat.isUnfinished = true;
            }
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

        pageIndex++;
    }
    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
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
    return (
        config.starts?.map((s) => ({
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
        })) || []
    );
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

function getEventData(config, checkRegatta, eventUrl, unfinishedRaceIdsMap) {
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

    const existingEventId = unfinishedRaceIdsMap[newEventStat.original_id];

    const divs = {};
    const divisions = getDivisions(newEventStat, config);
    divisions.forEach((d) => {
        divs[d.original_id] = d.id;
    });

    const startsMap = {};
    const starts = getStarts(newEventStat, config, divs);
    starts.forEach((s, index) => {
        // Reuse the existing id only for the first start
        if (index === 0 && existingEventId) {
            s.id = existingEventId;
        }
        startsMap[s.original_id] = s.id;
    });

    if (starts.length === 0 && existingEventId && divisions.length) {
        // if there are no starts, the division id will be used as race id
        divisions[0].id = existingEventId;
    }

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
    if (!newEvents[0].isUnfinished) {
        if (!newPositions?.length) {
            throw new Error('No positions in race');
        }
        if (!newUsers?.length) {
            throw new Error('No boats in race');
        }
        if (!newDivisions?.length) {
            throw new Error('No divisions in race');
        }
    }
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
