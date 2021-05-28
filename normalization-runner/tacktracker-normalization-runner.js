const { normalizeRace, SOURCE } = require('../scrapers/tacktracker_scraper');
const { TackTracker, sequelize } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');
const { Op } = require('sequelize');

(async () => {
    let raceId, raceUrl;
    try {
        const racesToBeNormalized = await TackTracker.TackTrackerRace.findAll({
            attributes: ['id', 'name', 'url', 'start', 'regatta'],
            where: {
                id: {
                    [Op.notIn]: sequelize.literal(
                        `(SELECT id FROM "ReadyAboutTrackGeoJsonLookups" WHERE source = '${SOURCE}')`
                    ),
                },
            },
        });
        for (const raceIndex in Object.keys(racesToBeNormalized)) {
            const race = racesToBeNormalized[raceIndex];
            raceUrl = race.url;
            raceId = race.id;
            const raceCondition = {
                where: {
                    race: raceId,
                },
            };
            console.log(`Getting positions for race id ${raceId}`);
            const positions = await TackTracker.TackTrackerPosition.findAll(
                raceCondition
            );
            console.log(`Getting start mark for race id ${raceId}`);
            const startMark = await TackTracker.TackTrackerStart.findOne(
                raceCondition
            );
            console.log(`Getting finish mark for race id ${raceId}`);
            const finnishMark = await TackTracker.TackTrackerFinish.findOne(
                raceCondition
            );
            console.log('Getting boats');
            const boats = await TackTracker.TackTrackerBoat.findAll(
                raceCondition
            );
            await normalizeRace(race, positions, startMark, finnishMark, boats);
            console.log(`Finished normalizing race id ${raceId}`);
        }
    } catch (err) {
        console.log(`Failed normalizing race with id ${raceId}`, err);
        await TackTracker.TackTrackerFailedUrl.create(
            { id: uuidv4(), url: raceUrl, error: err.toString() },
            { fields: ['id', 'url', 'error'] }
        );
    } finally {
        process.exit();
    }
})();
