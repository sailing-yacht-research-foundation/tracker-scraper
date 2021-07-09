const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');
const SOURCE = 'kwindoo';

(async () => {
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    const now = new Date().getTime();
    let regattas;
    try {
        regattas = await fetchRegattaList();
    } catch (err) {
        console.log('Failed getting regatta list', err);
        process.exit();
    }

    let existingUrls;
    try {
        existingUrls = await getExistingUrls(SOURCE);
    } catch (err) {
        console.log('Error getting existing urls', err);
        process.exit();
    }

    for (const regattaIndex in regattas) {
        const currentRegatta = regattas[regattaIndex];
        const regattaUrl = `https://api.kwindoo.com/api/regatta/get-details?regatta_id=${currentRegatta.id}`;
        try {
            console.log(`Getting regatta details with url ${regattaUrl}`);
            if (new Date(currentRegatta.last_end_time).getTime() > now) {
                console.log('Live or future race. Skipping.');
                continue;
            }
            if (existingUrls.includes(regattaUrl)) {
                console.log('Regatta exist in database. Skipping');
                continue;
            }

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

            console.log(
                `Going through all races, length ${regattaDetails.races.length}... `
            );

            for (const raceIndex in regattaDetails.races) {
                const currentRace = regattaDetails.races[raceIndex];
                const raceUrl = `https://www.kwindoo.com/tracking/${newOrExistingRegatta.original_id}-${newOrExistingRegatta.name_slug}?race_id=${currentRace.id}`;
                if (existingUrls.includes(raceUrl)) {
                    console.log('Race exist in database. Skipping');
                    continue;
                }
                console.log(
                    `Scraping race ${raceIndex} of ${regattaDetails.races.length} with url ${raceUrl}`
                );
                try {
                    const newRace = {};
                    newRace.id = uuidv4();
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

                    const boats = await fetchRaceBoats(
                        newRace,
                        newOrExistingRegatta
                    );

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

                    const waypoints = await fetchRaceWaypoints(
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

                    await saveRaceData({
                        newOrExistingRegatta,
                        regattaOwner,
                        homeportLocation,
                        pois,
                        videoStreams,
                        runningGroups,
                        newRace,
                        boats,
                        mias,
                        waypoints,
                        comments,
                        markers,
                        positions,
                    });
                } catch (err) {
                    console.log('Error downloading and saving race data.', err);
                    await registerFailedUrl(SOURCE, raceUrl, err.toString());
                }
            }
        } catch (err) {
            console.log('Error processing regatta data.', err);
            await registerFailedUrl(SOURCE, regattaUrl, err.toString());
        }
    }
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
            source: stream.source,
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
        northeast_lon: mia.northeast_lon,
        southwest_lat: mia.soutwest_lat,
        southwest_lon: mia.southwest_lon,
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
    const fromTimestamp = currentRace.start_timestamp;
    const toTimestamp = currentRace.end_timestamp;

    console.log('Getting positions.');
    const positionObjects = [];
    const posUrl =
        'https://api.kwindoo.com/tracking/get-locations?stream=archive&fromTimestamp=' +
        fromTimestamp.toString() +
        '&raceId=' +
        newRace.original_id +
        '&toTimestamp=' +
        toTimestamp;
    const positionsDataRequest = await axios({
        method: 'get',
        headers: {
            Accept: '*/*',
            'User-Agent': 'KwindooLive/3.6 (iPhone; iOS 13.7; Scale/3.00)',
        },
        url: posUrl,
    });
    const positions = positionsDataRequest.data.response.tracking_locations;
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
                boat: boatsData.find((b) => b.original_id?.toString() === oid)
                    ?.id,
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
    return positionObjects;
}

async function saveRaceData({
    newOrExistingRegatta,
    regattaOwner,
    homeportLocation,
    pois,
    videoStreams,
    runningGroups,
    newRace,
    boats,
    mias,
    waypoints,
    comments,
    markers,
    positions,
}) {
    const objectsToSave = {
        KwindooRegatta: [newOrExistingRegatta],
        KwindooRegattaOwner: [regattaOwner],
        KwindooRace: [newRace],
        KwindooBoat: boats,
        KwindooComment: comments,
        KwindooHomeportLocation: [homeportLocation],
        KwindooMarker: markers,
        KwindooMIA: mias,
        KwindooPOI: pois,
        KwindooPosition: positions,
        KwindooRunningGroup: runningGroups,
        KwindooVideoStream: videoStreams,
        KwindooWaypoint: waypoints,
    };

    try {
        await createAndSendTempJsonFile(objectsToSave);
    } catch (err) {
        console.log(
            `Failed creating and sending temp json file for url ${newRace.url}`,
            err
        );
        await registerFailedUrl(SOURCE, newRace.url, err.toString());
    }
}
