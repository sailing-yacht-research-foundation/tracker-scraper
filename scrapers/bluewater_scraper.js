const {
    Bluewater,
    SearchSchema,
    sequelize,
    connect,
} = require('../tracker-schema/schema.js');
const {
    createBoatToPositionDictionary,
    positionsToFeatureCollection,
    collectFirstNPositionsFromBoatsToPositions,
    collectLastNPositionsFromBoatsToPositions,
    getCenterOfMassOfPositions,
    findAverageLength,
    findCenter,
    createRace,
    createTurfPoint,
    allPositionsToFeatureCollection,
} = require('../tracker-schema/gis_utils.js');
const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const turf = require('@turf/turf');
const { uploadGeoJsonToS3 } = require('../utils/upload_racegeojson_to_s3');

const BLUEWATER_SOURCE = 'BLUEWATER';

async function normalizeRace(race, positions, map, boats, transaction) {
    const startTime = new Date(race.start_time).getTime();
    const endTime = new Date(race.track_time_finish).getTime();

    positions.forEach((p) => {
        p.timestamp = new Date(p.date).getTime();
        p.lat = p.coordinate_1;
        p.lon = p.coordinate_0;
    });
    const boatsToSortedPositions = createBoatToPositionDictionary(
        positions,
        'boat_original_id',
        'timestamp'
    );

    const start = JSON.parse(map.start_line);
    const end = JSON.parse(map.finish_line);
    const course = JSON.parse(map.course);

    let startPoint = null;
    if (start.length === 2) {
        const sideA = start[0];
        const sideB = start[1];
        startPoint = findCenter(sideA[1], sideA[0], sideB[1], sideB[0]);
    } else if (course.length > 0) {
        const startT = course[0];
        startPoint = createTurfPoint(startT[1], startT[0]);
    } else {
        const first3Positions = collectFirstNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        startPoint = getCenterOfMassOfPositions(
            'coordinate_1',
            'coordinate_0',
            first3Positions
        );
    }

    let endPoint = null;
    if (end.length === 2) {
        const sideA = end[0];
        const sideB = end[1];
        endPoint = findCenter(sideA[1], sideA[0], sideB[1], sideB[0]);
    } else if (course.length > 0) {
        const courseLength = course.length;
        const endT = course[courseLength - 1];
        endPoint = createTurfPoint(endT[1], endT[0]);
    } else {
        const last3Positions = collectLastNPositionsFromBoatsToPositions(
            boatsToSortedPositions,
            3
        );
        endPoint = getCenterOfMassOfPositions(
            'coordinate_1',
            'coordinate_0',
            last3Positions
        );
    }
    const boundingBox = turf.bbox(
        positionsToFeatureCollection('coordinate_1', 'coordinate_0', positions)
    );

    const boatNames = [];
    const boatModels = [];
    const handicapRules = [];
    const boatIdentifiers = [];
    const unstructuredText = [];
    const event = null;
    for (const i in boats) {
        const b = boats[i];
        boatNames.push(b.name);
        boatModels.push(b.design);
        boatIdentifiers.push(b.mmsi);
        boatIdentifiers.push(b.sail_no);
        unstructuredText.push(b.bio);

        const h = await Bluewater.BluewaterBoatHandicap.findOne({
            where: { boat: b.id },
        });
        if (h !== null && h !== undefined) {
            if (!handicapRules.includes(h.name)) {
                handicapRules.push(h.name);
            }
        }
    }

    const roughLength = findAverageLength(
        'coordinate_1',
        'coordinate_0',
        boatsToSortedPositions
    );

    const raceMetadata = await createRace(
        race.id,
        race.name,
        event,
        BLUEWATER_SOURCE,
        race.referral_url,
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

    console.log({ raceMetadata });
    console.log({ raceId: race.id });
    console.log({ tracksGeojson });

    await SearchSchema.RaceMetadata.create(raceMetadata, {
        fields: Object.keys(raceMetadata),
        transaction,
    });
    await uploadGeoJsonToS3(
        race.id,
        tracksGeojson,
        BLUEWATER_SOURCE,
        transaction
    );
}

(async () => {
    const CONNECTED_TO_DB = connect();
    if (!CONNECTED_TO_DB) {
        console.log("Couldn't connect to db.");
        process.exit();
    }

    let bluewaterMetadata, bluewaterRaces, bluewaterBoats;

    try {
        bluewaterMetadata = await Bluewater.BluewaterMetadata.findOne({
            attributes: ['last_update_time', 'base_url', 'base_referral_url'],
        });
        bluewaterRaces = await Bluewater.BluewaterRace.findAll({
            attributes: ['original_id', 'name', 'referral_url', 'id'],
        });
        bluewaterBoats = await Bluewater.BluewaterBoat.findAll({
            attributes: ['original_id', 'id'],
        });
    } catch (err) {
        console.log('Failed getting database metadata and races', err);
        process.exit();
    }

    const existingRaces = {};
    bluewaterRaces.forEach((r) => {
        existingRaces[r.original_id] = true;
    });

    const boatOriginalIdToNewId = {};
    bluewaterBoats.forEach((b) => {
        boatOriginalIdToNewId[b.original_id] = b.id;
    });

    // Visit the Bluewater Home Page and look for new URLS. Leaving this in for posterity.
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto(BLUEWATER_TRACKS_HOME_PAGE, {waitUntil: "networkidle2", timeout: 300000});
    // const raceUrls = await page.evaluate(() => Array.from(document.querySelectorAll('#races > div > div > table > tbody > tr > td:nth-child(1) > a'), element => element.href));

    // Get URLs from API:
    const today = new Date();
    const todayPlusMonth = new Date();
    todayPlusMonth.setMonth(todayPlusMonth.getMonth() + 1);
    const raceListApiUrl =
        'https://api.bluewatertracks.com/api/racelist/' +
        bluewaterMetadata.last_update_time +
        '/' +
        todayPlusMonth.toISOString();
    console.log(`Getting race list with url ${raceListApiUrl}`);
    let result;
    try {
        result = await axios.get(raceListApiUrl);
    } catch (err) {
        console.log('An error occured getting the race list', err);
        process.exit();
    }
    const races = result.data.raceList;

    const baseUrl = bluewaterMetadata.base_url;

    for (const index in races) {
        let transaction;
        const raceObj = races[index];
        const raceUrl = baseUrl + raceObj.slug;
        try {
            console.log(`Getting race object with url ${raceUrl}`);
            const result = await axios.get(raceUrl);
            const resultData = result.data;
            const positions = resultData.positions;
            const race = resultData.race;

            const trackTimeStart = race.trackTimeStart;
            const trackTimeFinish = race.trackTimeFinish;
            const startTimestamp = new Date(trackTimeStart).getTime();
            const endTimestamp = new Date(trackTimeFinish).getTime();

            const nowTimestamp = new Date().getTime();
            if (
                startTimestamp > nowTimestamp ||
                endTimestamp === null ||
                endTimestamp > nowTimestamp
            ) {
                console.log(`Future race with url ${raceUrl}`);
                continue;
            }

            console.log({
                positionLength: positions.length,
                raceExisted: existingRaces[raceObj._id],
            });

            if (positions.length === 0 || existingRaces[raceObj._id]) {
                console.log(
                    `No positions or race already saved with race url ${raceUrl}. Skipping`
                );
                continue;
            }
            const boats = race.boats;
            const map = race.map;

            const raceName = race.raceName;
            const raceStartTime = race.raceStartTime;
            const timezone = race.timezone;
            const finishTimzone = race.finishTimezone;
            const accountName = race.accountName;
            const accountWebsite = race.accountWebsite;
            const announcement = race.announcement;
            const calculation = race.calculation;
            const raceOriginalId = raceObj._id;
            const raceNewId = uuidv4();

            // Create the Race
            transaction = await sequelize.transaction();
            const currentRace = await Bluewater.BluewaterRace.create(
                {
                    name: raceName,
                    referral_url:
                        bluewaterMetadata.base_referral_url + raceObj.slug,
                    start_time: raceStartTime,
                    timezone_location: timezone.location,
                    timezone_offset: timezone.offset,
                    finish_timezone_location: finishTimzone.location,
                    finish_timezone_offset: finishTimzone.offset,
                    track_time_start: trackTimeStart,
                    track_time_finish: trackTimeFinish,
                    account_name: accountName,
                    account_website: accountWebsite,
                    calculation: calculation,
                    slug: raceObj.slug,
                    original_id: raceOriginalId,
                    id: raceNewId,
                },
                {
                    fields: [
                        'name',
                        'referral_url',
                        'start_time',
                        'timezone_location',
                        'timezone_offset',
                        'finish_timezone_location',
                        'finish_timezone_offset',
                        'track_time_start',
                        'track_time_finish',
                        'account_name',
                        'account_website',
                        'calculation',
                        'slug',
                        'original_id',
                        'id',
                    ],
                    transaction,
                }
            );

            // Create Announcement
            if (announcement !== null && announcement !== undefined) {
                await Bluewater.BluewaterAnnouncement.create(
                    {
                        html: announcement.html,
                        time: announcement.time,
                        race: raceNewId,
                        id: uuidv4(),
                    },
                    {
                        fields: ['html', 'time', 'race', 'id'],
                        transaction,
                    }
                );
            }

            console.log('Saving race data in database');
            // Map
            const centerLon = map.center[0];
            const centerLat = map.center[1];
            const currentMap = await Bluewater.BluewaterMap.create(
                {
                    id: uuidv4(),
                    race: currentRace.id,
                    center_lon: centerLon,
                    center_lat: centerLat,
                    start_line: JSON.stringify(
                        map.startLine.geometry.coordinates
                    ),
                    finish_line: JSON.stringify(
                        map.finishLine.geometry.coordinates
                    ),
                    course: JSON.stringify(map.course.geometry.coordinates),
                    regions: JSON.stringify(map.regions),
                },
                {
                    fields: [
                        'id',
                        'race',
                        'center_lon',
                        'center_lat',
                        'start_line',
                        'finish_line',
                        'course',
                        'regions',
                    ],
                    transaction,
                }
            );

            const boatModels = [];

            for (const boatIndex in boats) {
                const boat = boats[boatIndex];

                const boatOriginalId = boat.boat_id;
                const boatNewId = uuidv4();

                const boatName = boat.boatName;
                const mmsi = boat.mmsi;
                const skipper = boat.skipper;
                const sailNo = boat.sailNo;
                const design = boat.design;
                const length = boat.length;
                const width = boat.width;
                const units = boat.units;
                const draft = boat.draft;
                const type = boat.type;
                const bio = boat.bio;
                const countryName = boat.country.name;
                const countryCode = boat.country.code;
                const finishTime = boat.finishTime;
                const status = boat.status;
                const message = boat.message;

                const boatModel = await Bluewater.BluewaterBoat.create(
                    {
                        original_id: boatOriginalId,
                        id: boatNewId,
                        name: boatName,
                        mmsi: mmsi,
                        skipper: skipper,
                        sail_no: sailNo,
                        design: design,
                        length: length,
                        width: width,
                        units: units,
                        draft: draft,
                        type: type,
                        bio: bio,
                        country_name: countryName,
                        country_code: countryCode,
                        finish_time: finishTime,
                        status: status,
                        race: raceNewId,
                        race_original_id: raceOriginalId,
                        message: message,
                    },
                    {
                        fields: [
                            'original_id',
                            'id',
                            'name',
                            'mmsi',
                            'skipper',
                            'sail_no',
                            'design',
                            'length',
                            'width',
                            'units',
                            'draft',
                            'type',
                            'bio',
                            'country_name',
                            'country_code',
                            'finish_time',
                            'status',
                            'race',
                            'race_original_id',
                            'message',
                        ],
                        transaction,
                    }
                );
                boatModels.push(boatModel);

                for (const crewIndex in boat.crews) {
                    const crew = boat.crews[crewIndex];
                    const firstName = crew.firstName;
                    const lastName = crew.lastName;
                    const imageUrl = crew.imageURL;
                    const country = crew.country;
                    let cCode = null;
                    let cName = null;
                    if (country !== undefined) {
                        cCode = crew.country.code;
                        cName = crew.country.name;
                    }

                    const role = crew.crewRole;
                    const crewId = uuidv4();

                    await Bluewater.BluewaterCrew.create(
                        {
                            first_name: firstName,
                            last_name: lastName,
                            image_url: imageUrl,
                            bio: bio,
                            country_code: cCode,
                            country_name: cName,
                            boat: boatNewId,
                            boat_original_id: boatOriginalId,
                            race: raceNewId,
                            race_original_id: raceOriginalId,
                            id: crewId,
                            role: role,
                        },
                        {
                            fields: [
                                'first_name',
                                'last_name',
                                'image_url',
                                'bio',
                                'country_name',
                                'country_code',
                                'boat',
                                'boat_original_id',
                                'race',
                                'race_original_id',
                                'id',
                                'role',
                            ],
                            transaction,
                        }
                    );

                    for (const crewSmIndex in crew.socialMedia) {
                        const crewSocialMedia = crew.socialMedia[crewSmIndex];
                        const crewSmUrl = crewSocialMedia.url;

                        await Bluewater.BluewaterCrewSocialMedia.create(
                            {
                                crew: crewId,
                                url: crewSmUrl,
                                id: uuidv4(),
                            },
                            {
                                fields: ['crew', 'url', 'id'],
                                transaction,
                            }
                        );
                    }
                }

                for (const handicapIndex in boat.handicaps) {
                    const hc = boat.handicaps[handicapIndex];
                    const name = hc.name;
                    const rating = hc.rating;
                    const division = hc.division;
                    const hcId = hc.handicaps_id;

                    await Bluewater.BluewaterBoatHandicap.create(
                        {
                            id: uuidv4(),
                            name: name,
                            rating: rating,
                            division: division,
                            original_id: hcId,
                            boat: boatNewId,
                            boat_original_id: boatOriginalId,
                        },
                        {
                            fields: [
                                'id',
                                'name',
                                'rating',
                                'division',
                                'original_id',
                                'boat',
                                'boat_original_id',
                            ],
                            transaction,
                        }
                    );
                }

                for (const smIndex in boat.socialMedia) {
                    const sm = boat.socialMedia[smIndex];
                    const icon = sm.icon;
                    const url = sm.url;
                    await Bluewater.BluewaterBoatSocialMedia.create(
                        {
                            boat: boatNewId,
                            boat_original_id: boatOriginalId,
                            icon: icon,
                            url: url,
                            race: raceNewId,
                            race_original_id: raceOriginalId,
                            id: uuidv4(),
                        },
                        {
                            fields: [
                                'boat',
                                'boat_original_id',
                                'icon',
                                'url',
                                'race',
                                'race_original_id',
                                'id',
                            ],
                            transaction,
                        }
                    );
                }
            }
            const limit = 100000;
            let current = 1;
            let positionEntries = [];
            for (const positionIndex in positions) {
                const position = positions[positionIndex];
                const geometryType = position.geometry.type;

                const coord0 = position.geometry.coordinates[0];
                const coord1 = position.geometry.coordinates[1];
                const coord2 = position.geometry.coordinates[2];

                const boatOriginalId = position.properties.boat_id;
                const boatName = position.properties.boatName;

                const cog = position.properties.cog;
                const date = position.properties.date;
                const deviceId = position.properties.deviceId;
                const sog = position.properties.sog;
                const source = position.properties.source;

                const pos = {
                    geometry_type: geometryType,
                    coordinate_0: coord0,
                    coordinate_1: coord1,
                    coordinate_2: coord2,
                    race: raceNewId,
                    race_original_id: raceOriginalId,
                    boat_original_id: boatOriginalId,
                    boat_name: boatName,
                    cog: cog,
                    date: date,
                    device_id: deviceId,
                    sog: sog,
                    source: source,
                    id: uuidv4(),
                };

                positionEntries.push(pos);

                current += 1;
                if (current > limit) {
                    await Bluewater.BluewaterPosition.bulkCreate(
                        positionEntries,
                        {
                            fields: [
                                'geometry_type',
                                'coordinate_0',
                                'coordinate_1',
                                'coordinate_2',
                                'race',
                                'race_original_id',
                                'boat_original_id',
                                'boat_name',
                                'cog',
                                'date',
                                'device_id',
                                'sog',
                                'source',
                                'id',
                            ],
                            hooks: false,
                            transaction,
                        }
                    ).then(() => {
                        console.log('100K Positions Inserted!');
                    });
                    current = 1;
                    positionEntries = [];
                }
            }
            await Bluewater.BluewaterPosition.bulkCreate(positionEntries, {
                fields: [
                    'geometry_type',
                    'coordinate_0',
                    'coordinate_1',
                    'coordinate_2',
                    'race',
                    'race_original_id',
                    'boat_original_id',
                    'boat_name',
                    'cog',
                    'date',
                    'device_id',
                    'sog',
                    'source',
                    'id',
                ],
                hooks: false,
                transaction,
            }).then(() => {
                console.log('Positions Inserted!');
            });

            await normalizeRace(
                currentRace,
                positionEntries,
                currentMap,
                boatModels,
                transaction
            );

            await Bluewater.BluewaterSuccessfulUrl.create(
                {
                    id: uuidv4(),
                    date_attempted: today.toISOString(),
                    url: raceUrl,
                },
                {
                    fields: ['id', 'date_attempted', 'url'],
                    transaction,
                }
            );
            await transaction.commit();
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            try {
                await Bluewater.BluewaterFailedUrl.create(
                    {
                        id: uuidv4(),
                        date_attempted: today.toISOString(),
                        url: raceUrl,
                    },
                    { fields: ['id', 'date_attempted', 'url'] }
                );
            } catch (err2) {
                console.log('Failed inserting failed record in database', err2);
            }
        }
    }
    console.log('Finished scraping races');
    process.exit(0);
})();
