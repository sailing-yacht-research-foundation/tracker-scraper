const { normalizeRace } = require('../scrapers/kattack_scraper');
const { Kattack, sequelize } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');
const { Op } = require('sequelize');

(async () => {
    let raceId, raceUrl;
    try {
        const racesToBeNormalized = await Kattack.Race.findAll({
            attributes: ['id', 'name', 'url', 'start', 'stop'],
            where: {
                id: {
                    [Op.notIn]: sequelize.literal(
                        '(SELECT id FROM "ReadyAboutTrackGeoJsonLookups" WHERE source = \'KATTACK\')'
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
            const positions = await Kattack.Position.findAll(raceCondition);
            console.log('Getting waypoints');
            const waypoints = await Kattack.Waypoint.findAll(raceCondition);
            console.log('Getting devices');
            const devices = await Kattack.Device.findAll(raceCondition);
            await normalizeRace(race, positions, waypoints, devices);
            console.log(`Finished normalizing race id ${raceId}`);
        }
    } catch (err) {
        console.log(`Failed normalizing race with id ${raceId}`, err);
        await Kattack.FailedUrl.create(
            { id: uuidv4(), url: raceUrl, error: err.toString() },
            { fields: ['id', 'url', 'error'] }
        );
    } finally {
        process.exit();
    }
})();
