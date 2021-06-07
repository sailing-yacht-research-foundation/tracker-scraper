const { normalizeRace } = require('../scrapers/yachtbot_scraper');
const { YachtBot, sequelize, connect } = require('../tracker-schema/schema.js');
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
        racesToBeNormalized = await YachtBot.Race.findAll({
            attributes: ['id', 'name', 'url', 'start_time', 'end_time'],
            where: {
                [Op.and]: [
                    {
                        id: {
                            [Op.notIn]: sequelize.literal(
                                '(SELECT id FROM "ReadyAboutTrackGeoJsonLookups" WHERE source = \'YACHTBOT\')'
                            ),
                        },
                    },
                    {
                        id: {
                            [Op.in]: sequelize.literal(
                                '(SELECT race FROM "YachtBotPositions")'
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
            const positions = await YachtBot.Position.findAll(raceCondition);
            console.log('Getting boats');
            const boats = await YachtBot.Yacht.findAll(raceCondition);
            await normalizeRace(race, positions, boats);
            console.log(`Finished normalizing race id ${raceId}`);
        } catch (err) {
            console.log(`Failed normalizing race with id ${raceId}`, err);
            try {
                await YachtBot.FailedUrl.create(
                    { id: uuidv4(), url: raceUrl, error: err.toString() },
                    { fields: ['id', 'url', 'error'] }
                );
            } catch (err2) {
                console.log('Failed inserting failed record in database', err2);
            }
            console.log(`Failed normalizing race with id ${raceId}`, err);
        }
    }, Promise.resolve());
    console.log('Finished normalizing. Exiting...');
    process.exit();
})();
