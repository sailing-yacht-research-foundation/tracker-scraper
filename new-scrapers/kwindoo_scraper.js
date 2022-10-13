const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingData,
    registerFailedUrl,
    getUnfinishedRaceData,
    cleanUnfinishedRaces,
} = require('../utils/raw-data-server-utils');
const { appendArray } = require('../utils/array');
const SOURCE = 'kwindoo';

(async () => {
    // These are only used for limited scraping. If these are set, the urls are filtered
    const eventOriginalIdsToScrape = []; // event original id as integer. Example 31077
    const raceOriginalIdsToScrape = []; // race original id as integer. Example 36726

    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    const now = Date.now();
    let regattas;
    try {
        regattas = await fetchRegattaList();
        if (eventOriginalIdsToScrape.length) {
            regattas = regattas.filter((reg) =>
                eventOriginalIdsToScrape.includes(reg.id)
            );
        }
    } catch (err) {
        console.log('Failed getting regatta list', err);
        process.exit();
    }

    let existingData;
    try {
        existingData = await getExistingData(SOURCE);
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

    for (const regattaIndex in regattas) {
        const currentRegatta = regattas[regattaIndex];
        const regattaUrl = `https://api.kwindoo.com/api/regatta/get-details?regatta_id=${currentRegatta.id}`;
        try {
            console.log(`Getting regatta details with url ${regattaUrl}`);

            const detailsRequest = await axios({
                method: 'get',
                url: regattaUrl,
            });

            const regattaDetails = detailsRequest.data.response.regatta;

            const {
                newOrExistingRegatta,
                regattaOwner,
                homeportLocation,
                pois,
                videoStreams,
                runningGroups,
            } = await checkAndCreateRegattaData(currentRegatta, regattaDetails);

            let raceList;
            if (raceOriginalIdsToScrape.length) {
                raceList = regattaDetails.races.filter((r) =>
                    raceOriginalIdsToScrape.includes(r.id)
                );
            } else {
                raceList = regattaDetails.races;
            }
            console.log(
                `Going through all races, length ${raceList.length}... `
            );

            const objectsToSave = {
                KwindooRegatta: [newOrExistingRegatta],
                KwindooRegattaOwner: [regattaOwner],
                KwindooRace: [],
                KwindooBoat: [],
                KwindooComment: [],
                KwindooHomeportLocation: [homeportLocation],
                KwindooMarker: [],
                KwindooMIA: [],
                KwindooPOI: pois,
                KwindooPosition: [],
                KwindooRunningGroup: runningGroups,
                KwindooVideoStream: videoStreams,
                KwindooWaypoint: [],
            };
            for (const raceIndex in raceList) {
                const currentRace = raceList[raceIndex];
                const raceUrl = `https://www.kwindoo.com/tracking/${newOrExistingRegatta.original_id}-${newOrExistingRegatta.name_slug}?race_id=${currentRace.id}`;
                const isRaceExist = existingData.some(
                    (r) =>
                        r.url === raceUrl ||
                        (r.original_id?.toString() &&
                            r.original_id?.toString() ===
                                currentRace.id?.toString())
                );
                if (isRaceExist) {
                    console.log('Race exist in database. Skipping');
                    continue;
                }
                console.log(
                    `Scraping race ${+raceIndex + 1} of ${
                        raceList.length
                    } with url ${raceUrl}`
                );
                try {
                    const newRace = {};
                    const forceScrapeRaceData =
                        forceScrapeRacesMap[currentRace.id];
                    newRace.id =
                        forceScrapeRaceData?.id ||
                        unfinishedRaceIdsMap[currentRace.id] ||
                        uuidv4();
                    newRace.original_id = currentRace.id;
                    newRace.regatta = newOrExistingRegatta.id;
                    newRace.regatta_original_id =
                        newOrExistingRegatta.original_id;
                    newRace.name = currentRace.name;
                    newRace.start_time = currentRace.start_time;
                    newRace.end_time = currentRace.end_time;
                    newRace.start_timestamp = currentRace.start_timestamp;
                    newRace.end_timestamp = currentRace.end_timestamp;
                    newRace.running_group_ids = JSON.stringify(
                        currentRace.running_group_ids
                    );
                    newRace.url = raceUrl;

                    const waypoints = await fetchRaceWaypoints(
                        newRace,
                        newOrExistingRegatta
                    );

                    if (forceScrapeRaceData) {
                        if (newRace.start_timestamp * 1000 > now) {
                            // if start time is in the future set it today
                            newRace.start_timestamp = now / 1000;
                            newRace.end_timestamp = now / 1000;
                        } else {
                            newRace.end_timestamp =
                                forceScrapeRaceData.approx_end_time_ms / 1000;
                        }
                    }
                    if (
                        newRace.start_timestamp * 1000 > now ||
                        newRace.end_timestamp * 1000 > now
                    ) {
                        // also use startTime in case end time is undefined
                        console.log('Unfinished race. Only scraping race info');
                        appendArray(objectsToSave.KwindooWaypoint, waypoints);
                        objectsToSave.KwindooRace.push(newRace);
                        scrapedUnfinishedOrigIds.push(newRace.original_id);
                        continue;
                    }

                    const boats = await fetchRaceBoats(
                        newRace,
                        newOrExistingRegatta
                    );
                    if (!boats.length) {
                        throw new Error('No boats in race');
                    }

                    const markers = await fetchRaceMarkers(
                        newRace,
                        newOrExistingRegatta
                    );

                    // Are these the same as above?
                    // let poiRequest =  await axios({
                    //     method:'get',
                    //     url:'https://api.kwindoo.com/tracking/get-pois?regattaId=' + newOrExistingRegatta.original_id
                    // })
                    // let pois = poiRequest.data.response

                    const mias = await fetchRaceMIAs(
                        newRace,
                        newOrExistingRegatta
                    );

                    const comments = await fetchRaceComments(
                        newRace,
                        newOrExistingRegatta
                    );

                    const positions = await fetchRacePositions(
                        currentRace,
                        newRace,
                        boats,
                        newOrExistingRegatta
                    );
                    if (!positions.length) {
                        throw new Error('No positions in race');
                    }
                    objectsToSave.KwindooRace.push(newRace);
                    appendArray(objectsToSave.KwindooWaypoint, waypoints);
                    appendArray(objectsToSave.KwindooBoat, boats);
                    appendArray(objectsToSave.KwindooComment, comments);
                    appendArray(objectsToSave.KwindooMarker, markers);
                    appendArray(objectsToSave.KwindooMIA, mias);
                    appendArray(objectsToSave.KwindooPosition, positions);
                } catch (err) {
                    console.log('Error downloading and saving race data.', err);
                    await registerFailedUrl(SOURCE, raceUrl, err.toString());
                }
            }
            if (objectsToSave.KwindooRace.length > 0) {
                try {
                    await createAndSendTempJsonFile(objectsToSave);
                } catch (err) {
                    console.log(
                        `Failed creating and sending temp json file for regatta url ${regattaUrl}`
                    );
                    throw err;
                }
            }
        } catch (err) {
            console.log('Error processing regatta data.', err);
            await registerFailedUrl(SOURCE, regattaUrl, err.toString());
        }
    }

    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
})();

async function fetchRegattaList() {
    const regattaListRequest = await axios({
        method: 'post',
        url: 'https://api.kwindoo.com/api/regatta/all',
    });
    return regattaListRequest.data.response.regattas;
}

async function checkAndSaveRegattaOwner(currentRegatta, newOrExistingRegatta) {
    const ownerState = {};
    ownerState.id = uuidv4();
    ownerState.original_id = currentRegatta.owner_id;
    ownerState.regatta = newOrExistingRegatta.id;
    ownerState.regatta_original_id = newOrExistingRegatta.original_id;
    ownerState.first_name = currentRegatta.owner.first_name;
    ownerState.last_name = currentRegatta.owner.last_name;
    ownerState.email = currentRegatta.owner.email;
    ownerState.facebook_user_id = currentRegatta.owner.facebook_user_id;

    newOrExistingRegatta.owner = ownerState.id;
    newOrExistingRegatta.owner_original_id = ownerState.original_id;
    return ownerState;
}

async function checkAndSaveHomeportLocation(
    currentRegatta,
    newOrExistingRegatta
) {
    const homeportState = {};
    homeportState.id = uuidv4();
    homeportState.original_id = currentRegatta.homeport_location.id;
    homeportState.country = currentRegatta.homeport_location.country;
    homeportState.state = currentRegatta.homeport_location.state;
    homeportState.city = currentRegatta.homeport_location.city;
    homeportState.address = currentRegatta.homeport_location.address;
    homeportState.zip = currentRegatta.homeport_location.zip;
    homeportState.notice = currentRegatta.homeport_location.notice;
    homeportState.lat = currentRegatta.homeport_location.lat;
    homeportState.lon = currentRegatta.homeport_location.lon;
    homeportState.regatta = newOrExistingRegatta.id;
    homeportState.regatta_original_id = newOrExistingRegatta.original_id;
    return homeportState;
}

async function createPois(regattaDetails, newOrExistingRegatta) {
    return regattaDetails.pois.map((poi) => {
        return {
            id: uuidv4(),
            original_id: poi.id,
            regatta: newOrExistingRegatta.id,
            regatta_original_id: newOrExistingRegatta.original_id,
            name: poi.name,
            lat: poi.lat,
            lon: poi.lon,
            link: poi.link,
            description: poi.description,
        };
    });
}

async function createVideoStreams(regattaDetails, newOrExistingRegatta) {
    return regattaDetails.video_streams.map((stream) => {
        return {
            id: uuidv4(),
            original_id: stream.id,
            regatta: newOrExistingRegatta.id,
            regatta_original_id: newOrExistingRegatta.original_id,
            source: stream.video_source,
            video_id: stream.video_id,
            start_time: stream.start_time,
            end_time: stream.end_time,
            start_timestamp: stream.start_timestamp,
            end_timestamp: stream.end_timestamp,
        };
    });
}

async function createRunningGroups(currentRegatta, newOrExistingRegatta) {
    return currentRegatta.running_groups.map((rg) => {
        return {
            id: uuidv4(),
            original_id: rg.id,
            regatta: newOrExistingRegatta.id,
            regatta_original_id: newOrExistingRegatta.original_id,
            name: rg.name,
            description: rg.description,
        };
    });
}

async function checkAndCreateRegattaData(currentRegatta, regattaDetails) {
    const newOrExistingRegatta = {};
    newOrExistingRegatta.id = uuidv4();
    newOrExistingRegatta.original_id = currentRegatta.id;
    newOrExistingRegatta.name = currentRegatta.name;
    newOrExistingRegatta.timezone = currentRegatta.timezone;
    newOrExistingRegatta.public = currentRegatta.public;
    newOrExistingRegatta.private = currentRegatta.private;
    newOrExistingRegatta.sponsor = currentRegatta.sponsor;
    newOrExistingRegatta.display_waypoint_pass_radius =
        currentRegatta.display_waypoint_pass_radius;
    newOrExistingRegatta.name_slug = currentRegatta.name_slug;
    newOrExistingRegatta.first_start_time = currentRegatta.first_start_time;
    newOrExistingRegatta.last_end_time = currentRegatta.last_end_time;
    newOrExistingRegatta.updated_at_timestamp =
        currentRegatta.updated_at_timestamp;
    newOrExistingRegatta.regatta_logo_path = currentRegatta.regatta_logo_path;
    newOrExistingRegatta.name_slug = regattaDetails.name_slug;
    newOrExistingRegatta.featured_background_path =
        regattaDetails.featured_background_path;
    newOrExistingRegatta.sponsor_logo_path = regattaDetails.sponsor_logo_path;

    console.log('Regatta is new.');
    const regattaOwner = await checkAndSaveRegattaOwner(
        currentRegatta,
        newOrExistingRegatta
    );
    const homeportLocation = await checkAndSaveHomeportLocation(
        currentRegatta,
        newOrExistingRegatta
    );

    console.log('Creating new POIs, Running Groups and Video Streams.');
    const pois = await createPois(regattaDetails, newOrExistingRegatta);
    const videoStreams = await createVideoStreams(
        regattaDetails,
        newOrExistingRegatta
    );
    const runningGroups = await createRunningGroups(
        currentRegatta,
        newOrExistingRegatta
    );

    console.log('Creating new Regatta.');
    newOrExistingRegatta.owner = regattaOwner.id;
    newOrExistingRegatta.owner_original_id = regattaOwner.original_id;

    return {
        newOrExistingRegatta,
        regattaOwner,
        homeportLocation,
        pois,
        videoStreams,
        runningGroups,
    };
}

async function fetchRaceBoats(newRace, newOrExistingRegatta) {
    console.log('Getting boat data.');
    const boatDataRequest = await axios({
        method: 'get',
        url: `https://api.kwindoo.com/api/regatta/get-boat-data?raceId=${newRace.original_id}`,
    });
    const boatDetails = boatDataRequest.data.response.users;
    const boats = [];
    if (boatDetails) {
        boatDetails.forEach((boat) => {
            const b = {};
            b.id = uuidv4();
            b.original_id = boat.id;
            b.regatta = newOrExistingRegatta.id;
            b.regatta_original_id = newOrExistingRegatta.original_id;
            b.race = newRace.id;
            b.race_original_id = newRace.original_id;
            b.first_name = boat.first_name;
            b.last_name = boat.last_name;
            b.email = boat.email;
            b.boat_name =
                boat.boat_data === null ? null : boat.boat_data.boat_name;
            b.sail_number =
                boat.boat_data === null ? null : boat.boat_data.sail_number;
            b.race_number =
                boat.boat_data === null ? null : boat.boat_data.race_number;
            b.handycap =
                boat.boat_data === null ? null : boat.boat_data.handycap;
            b.helmsman =
                boat.boat_data === null ? null : boat.boat_data.helmsman;
            b.owner_name =
                boat.boat_data === null ? null : boat.boat_data.owner_name;
            b.registry_number =
                boat.boat_data === null ? null : boat.boat_data.registry_number;
            b.not_racer =
                boat.boat_data === null ? null : boat.boat_data.not_racer;
            b.homeport =
                boat.boat_data === null ? null : boat.boat_data.homeport;
            b.boat_type_name =
                boat.boat_data === null ? null : boat.boat_data.boat_type.name;
            b.boat_type_alias =
                boat.boat_data === null ? null : boat.boat_data.boat_type.alias;
            b.class = boat.boat_data === null ? null : boat.boat_data.class;

            boats.push(b);
        });
    }
    return boats;
}

async function fetchRaceMarkers(newRace, newOrExistingRegatta) {
    console.log('Getting markers.');
    const markersRequest = await axios({
        method: 'get',
        url: `https://api.kwindoo.com/ajax/race-office/track-editor/get-markers-by-race?raceId=${newRace.original_id}`,
    });
    const markers = markersRequest.data.response.markers;

    return markers.map((marker) => ({
        id: uuidv4(),
        original_id: marker.id,
        regatta: newOrExistingRegatta.id,
        regatta_original_id: newOrExistingRegatta.original_id,
        race: newRace.id,
        race_original_id: newRace.original_id,
        name: marker.name,
        lon: marker.lon,
        lat: marker.lat,
        approach_radius: marker.approach_radius,
    }));
}

async function fetchRaceMIAs(newRace, newOrExistingRegatta) {
    console.log('Getting MIAs.');
    const miaRequest = await axios({
        method: 'get',
        url:
            'https://api.kwindoo.com/tracking/get-mias?regattaId=' +
            newOrExistingRegatta.original_id +
            '&raceId=' +
            newRace.original_id,
    });
    const mias = miaRequest.data.response.mias;
    return mias.map((mia) => ({
        id: uuidv4(),
        original_id: mia.id,
        regatta: newOrExistingRegatta.id,
        regatta_original_id: newOrExistingRegatta.original_id,
        race: newRace.id,
        race_original_id: newRace.original_id,
        name: mia.name,
        northeast_lat: mia.northeast_lat,
        northeast_lon: mia.northeast_lng,
        southwest_lat: mia.southwest_lat,
        southwest_lon: mia.southwest_lng,
        rotation: mia.rotation,
    }));
}

async function fetchRaceWaypoints(newRace, newOrExistingRegatta) {
    console.log('Getting waypoints.');
    const waypointRequest = await axios({
        method: 'get',
        url: `https://api.kwindoo.com/ajax/tracking/get-waypoints-by-race?raceId=${newRace.original_id}`,
    });
    const waypoints = waypointRequest.data.response.data.waypoints;
    return waypoints.map((waypoint) => ({
        id: uuidv4(),
        original_id: waypoint.id,
        regatta: newOrExistingRegatta.id,
        regatta_original_id: newOrExistingRegatta.original_id,
        race: newRace.id,
        race_original_id: newRace.original_id,
        primary_marker_id: waypoint.primary_marker_id,
        secondary_marker_id: waypoint.secondary_marker_id,
        type: waypoint.type,
        role: waypoint.role,
        order_number: waypoint.order_number,
        diameter: waypoint.diameter,
        pass_direction: waypoint.pass_direction,
        primary_marker_name: waypoint.primary_marker.name,
        primary_marker_approach_radius: waypoint.primary_marker.approach_radius,
        primary_marker_lat: waypoint.primary_marker.lat,
        primary_marker_lon: waypoint.primary_marker.lon,
        secondary_marker_name:
            waypoint.secondary_marker === null
                ? null
                : waypoint.secondary_marker.name,
        secondary_marker_approach_radius:
            waypoint.secondary_marker === null
                ? null
                : waypoint.secondary_marker.approach_radius,
        secondary_marker_lat:
            waypoint.secondary_marker === null
                ? null
                : waypoint.secondary_marker.lat,
        secondary_marker_lon:
            waypoint.secondary_marker === null
                ? null
                : waypoint.secondary_marker.lon,
    }));
}

async function fetchRaceComments(newRace, newOrExistingRegatta) {
    console.log('Getting comments.');
    const commentsDataRequest = await axios({
        method: 'get',
        url: `https://api.kwindoo.com/api/tracking/get-comments?raceId=${newRace.original_id}`,
    });
    const comments = commentsDataRequest.data.response.comments;
    return comments.map((comment) => ({
        id: uuidv4(),
        original_id: comment.id,
        regatta: newOrExistingRegatta.id,
        regatta_original_id: newOrExistingRegatta.original_id,
        race: newRace.id,
        race_original_id: newRace.original_id,
        text: comment.text,
        event_type: comment.event_type,
        lat: comment.lat,
        lon: comment.lng,
        created_at: comment.created_at,
        created_at_timestamp: comment.created_at_timestamp,
        boat_name: comment.boat_name,
    }));
}

async function fetchRacePositions(
    currentRace,
    newRace,
    boatsData,
    newOrExistingRegatta
) {
    const loadBoatsIntervalOffset = 1200; // 20mins interval, same used by kwindoo website. Needed for long races with many boats
    let fromTimestamp = currentRace.start_timestamp;
    let toTimestamp = fromTimestamp;

    console.log('Getting positions');
    const positionObjects = [];
    do {
        fromTimestamp = toTimestamp;
        toTimestamp = fromTimestamp + loadBoatsIntervalOffset;
        const posUrl =
            'https://api.kwindoo.com/tracking/get-locations?stream=archive&fromTimestamp=' +
            fromTimestamp.toString() +
            '&raceId=' +
            newRace.original_id +
            '&toTimestamp=' +
            toTimestamp;
        try {
            const positionsDataRequest = await axios({
                method: 'get',
                headers: {
                    Accept: '*/*',
                    'User-Agent':
                        'KwindooLive/3.6 (iPhone; iOS 13.7; Scale/3.00)',
                },
                url: posUrl,
            });
            const positions =
                positionsDataRequest.data.response.tracking_locations;
            const boatOriginalIds = Object.keys(positions);
            boatOriginalIds.forEach((oid) => {
                const pos = positions[oid];
                pos.forEach((position) => {
                    const p = {
                        id: uuidv4(),
                        regatta: newOrExistingRegatta.id,
                        regatta_original_id: newOrExistingRegatta.original_id,
                        race: newRace.id,
                        race_original_id: newRace.original_id,
                        boat: boatsData.find(
                            (b) => b.original_id?.toString() === oid
                        )?.id,
                        boat_original_id: oid,
                        i: position.i,
                        u: position.u,
                        t: position.t,
                        lat: position.l,
                        lon: position.o,
                        b: position.b,
                        a: position.a,
                        d: position.d,
                        s: position.s,
                        y: position.y,
                    };
                    positionObjects.push(p);
                });
            });
        } catch (err) {
            console.log(
                `Failed getting positions fromTimestamp=${fromTimestamp}, toTimestamp=${toTimestamp}, race.endTimestamp=${currentRace.end_timestamp}`,
                err
            );
        }
    } while (toTimestamp <= currentRace.end_timestamp);
    return positionObjects;
}
