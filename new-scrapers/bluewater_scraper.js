const axios = require('axios');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
    getUnfinishedRaceData,
    cleanUnfinishedRaces,
} = require('../utils/raw-data-server-utils');

(async () => {
    // This is only used for limited scraping. If these are set, the urls are filtered
    const slugsToScrape = [];

    const SOURCE = 'bluewater';
    const BASE_URL = 'https://api.bluewatertracks.com/api/race/';
    const BASE_REFERRAL_URL = 'https://race.bluewatertracks.com/';
    const FROM_UPDATE_TIME = '2015-03-12T19:33:50.187Z';
    const BLUEWATER_MOMENT_FORMAT = 'YYYY-MM-DDThh:mm:ss.SSS[Z]';
    const todayPlusMonth = new Date();
    todayPlusMonth.setMonth(todayPlusMonth.getMonth() + 1);
    const raceListApiUrl = `https://api.bluewatertracks.com/api/racelist/${FROM_UPDATE_TIME}/${todayPlusMonth.toISOString()}`;

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

    console.log(`Getting race list with url ${raceListApiUrl}`);
    let result;
    try {
        result = await axios.get(raceListApiUrl);
    } catch (err) {
        console.log('An error occured getting the race list', err);
        process.exit();
    }
    let races = result.data.raceList;
    if (slugsToScrape.length) {
        races = races.filter((r) => slugsToScrape.includes(r.slug));
    }

    for (const index in races) {
        const raceObj = races[index];
        const raceUrl = BASE_URL + raceObj.slug;
        const objectsToSave = {};

        if (existingUrls.includes(raceObj.slug)) {
            console.log(`Race slug ${raceObj.slug} already exist. Skipping`);
            continue;
        }

        console.log(`Getting race object with url ${raceUrl}`);
        let result;
        try {
            result = await axios.get(raceUrl);
        } catch (err) {
            console.log(`Failed getting race info with url ${raceUrl}`, err);
            await registerFailedUrl(SOURCE, raceObj.slug, err.toString());
            continue;
        }
        const resultData = result.data;
        const positions = resultData.positions;
        const race = resultData.race;
        let raceStartTimeMs = Date.parse(race.raceStartTime);
        let raceEndTimeMs = Date.parse(race.trackTimeFinish);

        const now = Date.now();
        const forceScrapeRaceData = forceScrapeRacesMap[raceObj._id];

        if (forceScrapeRaceData) {
            if (raceStartTimeMs > now) {
                // if start time is in the future set it today
                raceStartTimeMs = now;
                raceEndTimeMs = now;
                race.raceStartTime = moment
                    .utc(now)
                    .format(BLUEWATER_MOMENT_FORMAT);
                race.trackTimeFinish = moment
                    .utc(now)
                    .format(BLUEWATER_MOMENT_FORMAT);
            } else {
                raceEndTimeMs = forceScrapeRaceData.approx_end_time_ms;
                race.trackTimeFinish = moment
                    .utc(forceScrapeRaceData.approx_end_time_ms)
                    .format(BLUEWATER_MOMENT_FORMAT);
            }
        }
        const isUnfinished =
            raceStartTimeMs > now ||
            (raceStartTimeMs && !race.trackTimeFinish) ||
            raceEndTimeMs > now;

        if (isUnfinished) {
            scrapedUnfinishedOrigIds.push(raceObj._id);
        } else if (!positions?.length) {
            const errMsg = 'No positions in race';
            console.log(errMsg);
            await registerFailedUrl(SOURCE, raceObj.slug, errMsg);
            continue;
        }
        const boats = race.boats;
        const map = race.map;
        const timezone = race.timezone;
        const finishTimezone = race.finishTimezone;
        const announcement = race.announcement;
        const currentRace = {
            id:
                forceScrapeRaceData?.id ||
                unfinishedRaceIdsMap[raceObj._id] ||
                uuidv4(),
            original_id: raceObj._id,
            name: race.raceName,
            referral_url: BASE_REFERRAL_URL + raceObj.slug,
            start_time: race.raceStartTime,
            timezone_location: timezone.location,
            timezone_offset: timezone.offset,
            finish_timezone_location: finishTimezone.location,
            finish_timezone_offset: finishTimezone.offset,
            track_time_start: race.trackTimeStart,
            track_time_finish: race.trackTimeFinish,
            account_name: race.accountName,
            account_website: race.accountWebsite,
            calculation: race.calculation,
            slug: raceObj.slug,
        };
        objectsToSave.BluewaterRace = [currentRace];

        if (announcement !== null && announcement !== undefined) {
            objectsToSave.BluewaterAnnouncement = [
                {
                    html: announcement.html,
                    time: announcement.time,
                    race: currentRace.id,
                    id: uuidv4(),
                },
            ];
        }

        objectsToSave.BluewaterMap = [
            {
                id: uuidv4(),
                race: currentRace.id,
                center_lon: map.center[0],
                center_lat: map.center[1],
                start_line: JSON.stringify(map.startLine.geometry.coordinates),
                finish_line: JSON.stringify(
                    map.finishLine.geometry.coordinates
                ),
                course: JSON.stringify(map.course.geometry.coordinates),
                regions: JSON.stringify(map.regions),
            },
        ];

        objectsToSave.BluewaterBoat = [];
        objectsToSave.BluewaterCrew = [];
        objectsToSave.BluewaterCrewSocialMedia = [];
        objectsToSave.BluewaterBoatHandicap = [];
        objectsToSave.BluewaterBoatSocialMedia = [];
        objectsToSave.BluewaterPosition = [];

        for (const boatIndex in boats) {
            const boat = boats[boatIndex];
            const boatOriginalId = boat.boat_id;
            const boatNewId = uuidv4();
            const boatModel = {
                original_id: boatOriginalId,
                id: boatNewId,
                name: boat.boatName,
                mmsi: boat.mmsi,
                skipper: boat.skipper,
                sail_no: boat.sailNo,
                design: boat.design,
                length: boat.length,
                width: boat.width,
                units: boat.units,
                draft: boat.draft,
                type: boat.type,
                bio: boat.bio,
                country_name: boat.country.name,
                country_code: boat.country.code,
                finish_time: boat.finishTime,
                status: boat.status,
                race: currentRace.id,
                race_original_id: currentRace.original_id,
                message: boat.message,
            };
            objectsToSave.BluewaterBoat.push(boatModel);

            for (const crewIndex in boat.crews) {
                const crew = boat.crews[crewIndex];
                const crewId = uuidv4();

                objectsToSave.BluewaterCrew.push({
                    first_name: crew.firstName,
                    last_name: crew.lastName,
                    image_url: crew.imageURL,
                    bio: boat.bio,
                    country_code: crew.country?.code,
                    country_name: crew.country?.name,
                    boat: boatNewId,
                    boat_original_id: boatOriginalId,
                    race: currentRace.id,
                    race_original_id: currentRace.original_id,
                    id: crewId,
                    role: crew.crewRole,
                });

                for (const crewSmIndex in crew.socialMedia) {
                    const crewSocialMedia = crew.socialMedia[crewSmIndex];
                    objectsToSave.BluewaterCrewSocialMedia.push({
                        crew: crewId,
                        url: crewSocialMedia.url,
                        id: uuidv4(),
                    });
                }
            }

            for (const handicapIndex in boat.handicaps) {
                const hc = boat.handicaps[handicapIndex];
                objectsToSave.BluewaterBoatHandicap.push({
                    id: uuidv4(),
                    name: hc.name,
                    rating: hc.rating,
                    division: hc.division,
                    original_id: hc.handicaps_id,
                    boat: boatNewId,
                    boat_original_id: boatOriginalId,
                });
            }

            for (const smIndex in boat.socialMedia) {
                const sm = boat.socialMedia[smIndex];
                objectsToSave.BluewaterBoatSocialMedia.push({
                    boat: boatNewId,
                    boat_original_id: boatOriginalId,
                    icon: sm.icon,
                    url: sm.url,
                    race: currentRace.id,
                    race_original_id: currentRace.original_id,
                    id: uuidv4(),
                });
            }
        }
        for (const positionIndex in positions) {
            const position = positions[positionIndex];
            const pos = {
                geometry_type: position.geometry?.type,
                coordinate_0: position.geometry?.coordinates[0],
                coordinate_1: position.geometry?.coordinates[1],
                coordinate_2: position.geometry?.coordinates[2],
                race: currentRace.id,
                race_original_id: currentRace.original_id,
                boat_original_id: position.properties.boat_id,
                boat_name: position.properties.boatName,
                cog: position.properties.cog,
                date: position.properties.date,
                device_id: position.properties.deviceId,
                sog: position.properties.sog,
                source: position.properties.source,
                id: uuidv4(),
            };
            objectsToSave.BluewaterPosition.push(pos);
        }

        try {
            await createAndSendTempJsonFile(objectsToSave);
        } catch (err) {
            console.log(
                `Failed creating and sending temp json file for url ${raceUrl}`,
                err
            );
            await registerFailedUrl(SOURCE, raceObj.slug, err.toString());
            continue;
        }
    }
    console.log('Finished scraping races');
    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
    process.exit(0);
})();
