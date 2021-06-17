const { normalizeRace } = require('../scrapers/tacktracker_scraper');
const { TackTracker, sequelize } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');
const { Op } = require('sequelize');

(async () => {
    let raceId, raceUrl, racesToBeNormalized;
    try {
        racesToBeNormalized = await TackTracker.TackTrackerRace.findAll({
            attributes: ['id', 'name', 'url', 'start', 'regatta'],
            where: {
                [Op.and]: [
                    {
                        id: {
                            [Op.notIn]: sequelize.literal(
                                '(SELECT id FROM "ReadyAboutTrackGeoJsonLookups" WHERE source = \'TACKTRACKER\')'
                            ),
                        },
                    },
                    {
                        id: {
                            [Op.in]: sequelize.literal(
                                '(SELECT race FROM "TackTrackerPositions")'
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
        let transaction;
        try {
            transaction = await sequelize.transaction();
            console.log(`Getting positions for race id ${raceId}`);
            const positions = await TackTracker.TackTrackerPosition.findAll(
                raceCondition
            );
            console.log(`Getting start mark for race id ${raceId}`);
            const startMark = await TackTracker.TackTrackerStart.findOne(
                raceCondition
            );
            console.log(`Getting finish mark for race id ${raceId}`);
            const finishMark = await TackTracker.TackTrackerFinish.findOne(
                raceCondition
            );
            console.log('Getting boats');
            const boats = await TackTracker.TackTrackerBoat.findAll(
                raceCondition
            );
            await normalizeRace(
                race,
                positions,
                startMark,
                finishMark,
                boats,
                transaction
            );
            await transaction.commit();
            console.log(`Finished normalizing race id ${raceId}`);
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(`Failed normalizing race with id ${raceId}`, err);
            try {
                await TackTracker.TackTrackerFailedUrl.create(
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
