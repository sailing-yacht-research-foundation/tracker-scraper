const turf = require('@turf/turf');
const {
    Kwindoo,
    connect,
    findExistingObjects,
    instantiateOrReturnExisting,
    getUUIDForOriginalId,
    bulkSave,
    sequelize,
    SearchSchema,
} = require('../tracker-schema/schema.js');
const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const { appendArray } = require('../utils/array');
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
const { uploadGeoJsonToS3 } = require('../utils/upload_racegeojson_to_s3');

const KWINDOO_SOURCE = 'KWINDOO';

async function fetchRegattaList() {
    const regattaListRequest = await axios({
        method: 'post',
        url: 'https://api.kwindoo.com/api/regatta/all',
    });
    return regattaListRequest.data.response.regattas;
}

async function fetchRegattaDetails(regattaId) {
    const detailsRequest = await axios({
        method: 'get',
        url: `https://api.kwindoo.com/api/regatta/get-details?regatta_id=${regattaId}`,
    });

    return detailsRequest.data.response.regatta;
}

async function checkAndSaveRegattaOwner(
    existingObjects,
    currentRegatta,
    newOrExistingRegatta,
    transaction
) {
    const ownerState = instantiateOrReturnExisting(
        existingObjects,
        Kwindoo.RegattaOwner,
        currentRegatta.owner_id
    );

    ownerState.obj.regatta = newOrExistingRegatta.id;
    ownerState.obj.regatta_original_id = newOrExistingRegatta.original_id;
    ownerState.obj.first_name = currentRegatta.owner.first_name;
    ownerState.obj.last_name = currentRegatta.owner.last_name;
    ownerState.obj.email = currentRegatta.owner.email;
    ownerState.obj.facebook_user_id = currentRegatta.owner.facebook_user_id;

    if (!ownerState.shouldSave) {
        newOrExistingRegatta.owner = ownerState.obj.id;
        newOrExistingRegatta.owner_original_id = ownerState.obj.original_id;
    } else {
        await Kwindoo.RegattaOwner.create(ownerState.obj, { transaction });
    }
    return ownerState;
}

async function checkAndSaveHomeportLocation(
    existingObjects,
    currentRegatta,
    newOrExistingRegatta,
    transaction
) {
    const homeportState = instantiateOrReturnExisting(
        existingObjects,
        Kwindoo.HomeportLocation,
        currentRegatta.homeport_location.id
    );
    homeportState.obj.country = currentRegatta.homeport_location.country;
    homeportState.obj.state = currentRegatta.homeport_location.state;
    homeportState.obj.city = currentRegatta.homeport_location.city;
    homeportState.obj.address = currentRegatta.homeport_location.address;
    homeportState.obj.zip = currentRegatta.homeport_location.zip;
    homeportState.obj.notice = currentRegatta.homeport_location.notice;
    homeportState.obj.lat = currentRegatta.homeport_location.lat;
    homeportState.obj.lon = currentRegatta.homeport_location.lon;
    homeportState.obj.regatta = newOrExistingRegatta.id;
    homeportState.obj.regatta_original_id = newOrExistingRegatta.original_id;
    if (homeportState.shouldSave) {
        await Kwindoo.HomeportLocation.create(homeportState.obj, {
            transaction,
        });
    }
    return homeportState;
}

async function createPois(regattaDetails, newOrExistingRegatta, transaction) {
    for (const poiIndex in regattaDetails.pois) {
        const poi = regattaDetails.pois[poiIndex];
        await Kwindoo.POI.create(
            {
                id: uuidv4(),
                original_id: poi.id,
                regatta: newOrExistingRegatta.id,
                regatta_original_id: newOrExistingRegatta.original_id,
                name: poi.name,
                lat: poi.lat,
                lon: poi.lon,
                link: poi.link,
                description: poi.description,
            },
            { transaction }
        );
    }
}

async function createVideoStreams(
    regattaDetails,
    newOrExistingRegatta,
    transaction
) {
    for (const videoStreamIndex in regattaDetails.video_streams) {
        const stream = regattaDetails.video_streams[videoStreamIndex];
        await Kwindoo.VideoStream.create(
            {
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
            },
            { transaction }
        );
    }
}

async function createRunningGroups(
    currentRegatta,
    newOrExistingRegatta,
    transaction
) {
    for (const runningGroupIndex in currentRegatta.running_groups) {
        const rg = currentRegatta.running_groups[runningGroupIndex];
        await Kwindoo.RunningGroup.create(
            {
                id: uuidv4(),
                original_id: rg.id,
                regatta: newOrExistingRegatta.id,
                regatta_original_id: newOrExistingRegatta.original_id,
                name: rg.name,
                description: rg.description,
            },
            { transaction }
        );
    }
}

async function checkAndCreateRegattaData(
    existingObjects,
    currentRegatta,
    regattaDetails
) {
    console.log('Checking status of regatta.');
    const currentRegattaState = instantiateOrReturnExisting(
        existingObjects,
        Kwindoo.Regatta,
        currentRegatta.id
    );

    const regattaIsNew = currentRegattaState.shouldSave;
    const newOrExistingRegatta = currentRegattaState.obj;

    let transaction;
    try {
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
        newOrExistingRegatta.regatta_logo_path =
            currentRegatta.regatta_logo_path;
        newOrExistingRegatta.name_slug = regattaDetails.name_slug;
        newOrExistingRegatta.featured_background_path =
            regattaDetails.featured_background_path;
        newOrExistingRegatta.sponsor_logo_path =
            regattaDetails.sponsor_logo_path;

        if (regattaIsNew) {
            transaction = await sequelize.transaction();

            console.log('Regatta is new.');
            const ownerState = await checkAndSaveRegattaOwner(
                existingObjects,
                currentRegatta,
                newOrExistingRegatta,
                transaction
            );
            await checkAndSaveHomeportLocation(
                existingObjects,
                currentRegatta,
                newOrExistingRegatta,
                transaction
            );

            console.log('Creating new POIs, Running Groups and Video Streams.');
            await createPois(regattaDetails, newOrExistingRegatta, transaction);
            await createVideoStreams(
                regattaDetails,
                newOrExistingRegatta,
                transaction
            );
            await createRunningGroups(
                currentRegatta,
                newOrExistingRegatta,
                transaction
            );

            console.log('Creating new Regatta.');
            newOrExistingRegatta.owner = ownerState.obj.id;
            newOrExistingRegatta.owner_original_id = ownerState.obj.original_id;

            await Kwindoo.Regatta.create(newOrExistingRegatta, { transaction });

            await transaction.commit();
        }

        return newOrExistingRegatta;
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        throw err;
    }
}

async function fetchRaceBoats(newRace, existingObjects, newOrExistingRegatta) {
    console.log('Getting boat data.');
    const boatDataRequest = await axios({
        method: 'get',
        url: `https://api.kwindoo.com/api/regatta/get-boat-data?raceId=${newRace.original_id}`,
    });
    const boatDetails = boatDataRequest.data.response.users;
    const boats = [];
    if (boatDetails) {
        boatDetails.forEach((boat) => {
            const bTemp = instantiateOrReturnExisting(
                existingObjects,
                Kwindoo.Boat,
                boat.id
            );
            const b = bTemp.obj;
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

            if (bTemp.shouldSave) {
                boats.push(b);
            }
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
    existingObjects,
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
        const id = getUUIDForOriginalId(existingObjects, Kwindoo.Boat, oid);
        const pos = positions[oid];
        pos.forEach((position) => {
            const p = {
                id: uuidv4(),
                regatta: newOrExistingRegatta.id,
                regatta_original_id: newOrExistingRegatta.original_id,
                race: newRace.id,
                race_original_id: newRace.original_id,
                boat: id,
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

async function normalizeRace({
    race,
    regatta,
    boats,
    waypoints,
    positions,
    transaction,
}) {
    console.log('Normalizing race');
    console.log('A');
    const allPositions = [];
    positions.forEach((p) => {
        p.timestamp = parseInt(p.t) * 1000;
        if (p.lat && p.lon && p.timestamp) {
            allPositions.push(p);
        }
    });
    console.log(`Position length: ${allPositions.length}`);
    if (allPositions.length === 0) {
        console.log('No positions so skipping.');
        return;
    }

    const id = race.id;
    const name = `${regatta.name} - ${race.name}`;
    const event = race.regatta;
    const url = race.url;
    const startTime = parseInt(race.start_timestamp) * 1000;
    const endTime = parseInt(race.end_timestamp) * 1000;

    const runningGroups = await Kwindoo.RunningGroup.findAll({
        where: { regatta: race.regatta },
    });
    const classes = [];
    const handicaps = [];
    runningGroups.forEach((rg) => {
        if (
            rg.name !== 'All classes' &&
            rg.name !== 'All 1' &&
            rg.name !== 'All 2'
        ) {
            if (rg.name.includes('ORC') || rg.name.includes('PHRF')) {
                handicaps.push(rg.name);
            } else {
                classes.push(rg.name);
            }
        }
    });

    const boatIdentifiers = [];
    const boatNames = [];
    const unstructuredText = [];
    boats.forEach((b) => {
        boatIdentifiers.push(b.registry_number);
        boatIdentifiers.push(b.sail_number);
        boatNames.push(b.boat_name);
        classes.push(b.class);
    });

    let startPoint = null;
    let endPoint = null;
    waypoints.forEach((wpt) => {
        if (wpt.role === 'start') {
            startPoint = createTurfPoint(
                wpt.primary_marker_lat,
                wpt.primary_marker_lon
            );
        } else if (wpt.role === 'finish') {
            endPoint = createTurfPoint(
                wpt.primary_marker_lat,
                wpt.primary_marker_lon
            );
        }
    });

    const fc = positionsToFeatureCollection('lat', 'lon', allPositions);
    console.log('B');
    const boundingBox = turf.bbox(fc);
    console.log('C');
    const boatsToSortedPositions = createBoatToPositionDictionary(
        allPositions,
        'boat',
        'timestamp'
    );
    console.log('D');

    if (startPoint === null) {
        const first3Positions = collectFirstNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        startPoint = getCenterOfMassOfPositions('lat', 'lon', first3Positions);
    }

    console.log('E');
    if (endPoint === null) {
        const last3Positions = collectLastNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        endPoint = getCenterOfMassOfPositions('lat', 'lon', last3Positions);
    }

    console.log('F');
    const roughLength = findAverageLength('lat', 'lon', boatsToSortedPositions);
    console.log('G');
    const raceMetadata = await createRace(
        id,
        name,
        event,
        KWINDOO_SOURCE,
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
    console.log('H');
    const tracksGeojson = JSON.stringify(
        allPositionsToFeatureCollection(boatsToSortedPositions)
    );

    await uploadGeoJsonToS3(id, tracksGeojson, KWINDOO_SOURCE, transaction);

    await SearchSchema.RaceMetadata.create(raceMetadata, {
        fields: Object.keys(raceMetadata),
        transaction,
    });
}

async function saveRaceData({
    newOrExistingRegatta,
    newRace,
    newBoatObjects,
    newPOIObjects,
    newMIAObjects,
    newWaypointObjects,
    newCommentObjects,
    newMarkerObjects,
    newPositionsObjects,
}) {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const newObjectsToSave = [
            {
                objectType: Kwindoo.Race,
                objects: [newRace],
            },
            {
                objectType: Kwindoo.Boat,
                objects: newBoatObjects,
            },
            {
                objectType: Kwindoo.POI,
                objects: newPOIObjects,
            },
            {
                objectType: Kwindoo.MIA,
                objects: newMIAObjects,
            },
            {
                objectType: Kwindoo.Waypoint,
                objects: newWaypointObjects,
            },
            {
                objectType: Kwindoo.Comment,
                objects: newCommentObjects,
            },
            {
                objectType: Kwindoo.Marker,
                objects: newMarkerObjects,
            },
            {
                objectType: Kwindoo.Position,
                objects: newPositionsObjects,
            },
        ];
        console.log('Bulk saving objects.');
        await bulkSave(newObjectsToSave, transaction);
        await normalizeRace({
            race: newRace,
            regatta: newOrExistingRegatta,
            boats: newBoatObjects,
            waypoints: newWaypointObjects,
            positions: newPositionsObjects,
            transaction,
        });
        await transaction.commit();
        console.log('Finished saving race. On to the next one.');
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
        }
        throw err;
    }
}

async function createFailureRecord(err, url) {
    await Kwindoo.FailedUrl.create({
        id: uuidv4(),
        url,
        error: err.toString(),
    });
}

(async () => {
    const dbConnected = await connect();
    if (!dbConnected) {
        process.exit();
    }
    const existingObjects = await findExistingObjects(Kwindoo);

    const now = new Date().getTime();
    const regattas = await fetchRegattaList();

    for (const regattaIndex in regattas) {
        try {
            const currentRegatta = regattas[regattaIndex];

            if (new Date(currentRegatta.last_end_time).getTime() > now) {
                console.log('Live or future race.');
                continue;
            }

            const regattaDetails = await fetchRegattaDetails(currentRegatta.id);

            const newOrExistingRegatta = await checkAndCreateRegattaData(
                existingObjects,
                currentRegatta,
                regattaDetails
            );

            console.log(
                `Going through all races, length ${regattaDetails.races.length}... `
            );

            for (const raceIndex in regattaDetails.races) {
                console.log('Beginning new race.');
                const currentRace = regattaDetails.races[raceIndex];
                const url =
                    'https://www.kwindoo.com/tracking/' +
                    newOrExistingRegatta.original_id +
                    '-' +
                    newOrExistingRegatta.name_slug +
                    '?race_id=' +
                    currentRace.id;
                console.log({ raceUrl: url });
                try {
                    const raceState = instantiateOrReturnExisting(
                        existingObjects,
                        Kwindoo.Race,
                        currentRace.id
                    );
                    if (!raceState.shouldSave) {
                        console.log('Skipping existing race.');
                        continue;
                    }

                    const newRace = raceState.obj;

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
                    newRace.url = url;
                    const newBoatObjects = [];
                    const newPOIObjects = [];
                    const newMIAObjects = [];
                    const newWaypointObjects = [];
                    const newCommentObjects = [];
                    const newMarkerObjects = [];
                    const newPositionsObjects = [];

                    const boats = await fetchRaceBoats(
                        newRace,
                        existingObjects,
                        newOrExistingRegatta
                    );
                    appendArray(newBoatObjects, boats);

                    const markers = await fetchRaceMarkers(
                        newRace,
                        newOrExistingRegatta
                    );
                    appendArray(newMarkerObjects, markers);

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
                    appendArray(newMIAObjects, mias);

                    const waypoints = await fetchRaceWaypoints(
                        newRace,
                        newOrExistingRegatta
                    );
                    appendArray(newWaypointObjects, waypoints);

                    const comments = await fetchRaceComments(
                        newRace,
                        newOrExistingRegatta
                    );
                    appendArray(newCommentObjects, comments);

                    const positions = await fetchRacePositions(
                        currentRace,
                        newRace,
                        existingObjects,
                        newOrExistingRegatta
                    );
                    appendArray(newPositionsObjects, positions);

                    await saveRaceData({
                        newOrExistingRegatta,
                        newRace,
                        newBoatObjects,
                        newPOIObjects,
                        newMIAObjects,
                        newWaypointObjects,
                        newCommentObjects,
                        newMarkerObjects,
                        newPositionsObjects,
                    });
                } catch (err) {
                    console.log('Error downloading and saving race data.');
                    console.log(err);
                    await createFailureRecord(err, url);
                }
            }
        } catch (err) {
            console.log('Error processing regatta data.');
            console.log(err);
            await createFailureRecord(err, `regatta ${regattaIndex}`);
        }
    }
})();
