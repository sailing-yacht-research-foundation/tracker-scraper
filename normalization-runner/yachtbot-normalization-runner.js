const { normalizeRace } = require('../scrapers/yachtbot_scraper');
const { YachtBot, sequelize } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');
const { Op } = require('sequelize');

(async () => {
    let raceId, raceUrl;
    try {
        console.log('Getting races to be normalized');
        const racesToBeNormalized = await YachtBot.Race.findAll({
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
            console.log(`Getting positions for race id ${raceId}`);
            const positions = await YachtBot.Position.findAll(raceCondition);
            console.log('Getting boats');
            const boats = await YachtBot.Yacht.findAll(raceCondition);
            await normalizeRace(race, positions, boats);
            console.log(`Finished normalizing race id ${raceId}`);
        }, Promise.resolve());
    } catch (err) {
        console.log(`Failed normalizing race with id ${raceId}`, err);
        await YachtBot.FailedUrl.create(
            { id: uuidv4(), url: raceUrl, error: err.toString() },
            { fields: ['id', 'url', 'error'] }
        );
    } finally {
        console.log('Finished normalizing. Exiting...');
        process.exit();
    }
})();
