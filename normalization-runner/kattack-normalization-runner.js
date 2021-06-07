const { normalizeRace } = require('../scrapers/kattack_scraper');
const { Kattack, sequelize, connect } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');
const { Op } = require('sequelize');

(async () => {
    let raceId, raceUrl, racesToBeNormalized;
    try {
        const CONNECTED_TO_DB = await connect();
        if (!CONNECTED_TO_DB) {
            console.log('Not connected to DB.');
            process.exit();
        }
        console.log('Getting races to be normalized');
        racesToBeNormalized = await Kattack.Race.findAll({
            attributes: ['id', 'name', 'url', 'start', 'stop'],
            where: {
                [Op.and]: [
                    {
                        id: {
                            [Op.notIn]: sequelize.literal(
                                '(SELECT id FROM "ReadyAboutTrackGeoJsonLookups" WHERE source = \'KATTACK\')'
                            ),
                        },
                    },
                    {
                        id: {
                            [Op.in]: sequelize.literal(
                                '(SELECT race FROM "KattackPositions")'
                            ),
                        },
                    },
                ],
            },
        });
    } catch (err) {
        console.log('Failed getting races from database', err);
        process.exit();
    }
    console.log('racesToBeNormalized length', racesToBeNormalized.length);
    await racesToBeNormalized.reduce(async (prevEventPromise, race) => {
        await prevEventPromise;
        raceUrl = race.url;
        raceId = race.id;
        const raceCondition = {
            where: {
                race: raceId,
            },
        };
        try {
            console.log(`Getting positions for race id ${raceId}`);
            const positions = await Kattack.Position.findAll(raceCondition);
            console.log('Getting waypoints');
            const waypoints = await Kattack.Waypoint.findAll(raceCondition);
            console.log('Getting devices');
            const devices = await Kattack.Device.findAll(raceCondition);
            await normalizeRace(race, positions, waypoints, devices);
            console.log(`Finished normalizing race id ${raceId}`);
        } catch (err) {
            console.log(`Failed normalizing race with id ${raceId}`, err);
            try {
                await Kattack.FailedUrl.create(
                    { id: uuidv4(), url: raceUrl, error: err.toString() },
                    { fields: ['id', 'url', 'error'] }
                );
            } catch (err2) {
                console.log('Failed inserting failed record in database', err2);
            }
        }
    }, Promise.resolve());
    console.log('Finished normalizing. Exiting...');
    process.exit();
})();
