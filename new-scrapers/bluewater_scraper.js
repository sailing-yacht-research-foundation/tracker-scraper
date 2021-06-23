const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env'),
});

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { createAndSendTempJsonFile } = require('../utils/raw-data-server-utils');

(async () => {
    const RAW_DATA_SERVER_API = process.env.RAW_DATA_SERVER_API;
    const BASE_URL = 'https://api.bluewatertracks.com/api/race/';
    const BASE_REFERRAL_URL = 'https://race.bluewatertracks.com/';
    const FROM_UPDATE_TIME = '2015-03-12T19:33:50.187Z';
    const todayPlusMonth = new Date();
    todayPlusMonth.setMonth(todayPlusMonth.getMonth() + 1);
    const raceListApiUrl = `https://api.bluewatertracks.com/api/racelist/${FROM_UPDATE_TIME}/${todayPlusMonth.toISOString()}`;

    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }
    console.log(`Getting race list with url ${raceListApiUrl}`);
    let result;
    try {
        result = await axios.get(raceListApiUrl);
    } catch (err) {
        console.log('An error occured getting the race list', err);
        process.exit();
    }
    const races = result.data.raceList;

    for (const index in races) {
        const raceObj = races[index];
        const raceUrl = BASE_URL + raceObj.slug;
        const objectsToSave = {};

        console.log(`Getting race object with url ${raceUrl}`);
        let result;
        try {
            result = await axios.get(raceUrl);
        } catch (err) {
            console.log(`Failed getting race info with url ${raceUrl}`, err);
            continue;
        }
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

        if (positions.length === 0) {
            console.log(`No positions with race url ${raceUrl}. Skipping`);
            continue;
        }
        const boats = race.boats;
        const map = race.map;
        const timezone = race.timezone;
        const finishTimezone = race.finishTimezone;
        const announcement = race.announcement;
        const currentRace = {
            id: uuidv4(),
            original_id: raceObj._id,
            name: race.raceName,
            referral_url: BASE_REFERRAL_URL + raceObj.slug,
            start_time: race.raceStartTime,
            timezone_location: timezone.location,
            timezone_offset: timezone.offset,
            finish_timezone_location: finishTimezone.location,
            finish_timezone_offset: finishTimezone.offset,
            track_time_start: trackTimeStart,
            track_time_finish: trackTimeFinish,
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
            console.log('Creating temp json file');
            await createAndSendTempJsonFile(
                `${RAW_DATA_SERVER_API}/api/v1/upload-file`,
                objectsToSave
            );
            console.log('Finished sending file');
        } catch (err) {
            console.log(
                `Failed creating and sending temp json file for url ${raceUrl}`,
                err
            );
            continue;
        }
    }
    console.log('Finished scraping races');
    process.exit(0);
})();
