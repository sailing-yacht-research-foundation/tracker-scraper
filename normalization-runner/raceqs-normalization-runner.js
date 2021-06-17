const { normalizeRace } = require('../scrapers/raceqs_scraper');
const { RaceQs, sequelize, connect } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');
const { Op } = require('sequelize');

(async () => {
    let eventId, eventUrl, eventsToBeNormalized;
    try {
        const CONNECTED_TO_DB = await connect();
        if (!CONNECTED_TO_DB) {
            console.log('Not connected to DB.');
            process.exit();
        }
        console.log('Getting events to be normalized');
        eventsToBeNormalized = await RaceQs.Event.findAll({
            attributes: ['id', 'name', 'regatta', 'url', 'from', 'till'],
            where: {
                [Op.and]: [
                    {
                        id: {
                            [Op.notIn]: sequelize.literal(
                                '(SELECT id FROM "ReadyAboutTrackGeoJsonLookups" WHERE source = \'RACEQS\')'
                            ),
                        },
                    },
                    {
                        id: {
                            [Op.in]: sequelize.literal(
                                '(SELECT event FROM "RaceQsPositions")'
                            ),
                        },
                    },
                ],
            },
        });
    } catch (err) {
        console.log('Failed getting events from database', err);
        process.exit();
    }
    console.log('eventsToBeNormalized length', eventsToBeNormalized.length);
    await eventsToBeNormalized.reduce(async (prevEventPromise, event) => {
        await prevEventPromise;
        eventUrl = event.url;
        eventId = event.id;
        const eventCondition = {
            where: {
                event: eventId,
            },
        };
        let transaction;
        try {
            console.log(`Getting regatta for regatta id ${event.regatta}`);
            const regatta = await RaceQs.Regatta.findOne({
                where: { id: event.regatta },
            });
            console.log(`Getting waypoints for event id ${eventId}`);
            const waypoints = await RaceQs.Waypoint.findAll(eventCondition);
            console.log(`Getting positions for event id ${eventId}`);
            const positions = await RaceQs.Position.findAll(eventCondition);
            console.log('Getting participants');
            const participants = await RaceQs.Participant.findAll(
                eventCondition
            );

            transaction = await sequelize.transaction();
            await normalizeRace({
                event,
                regatta,
                waypoints,
                positions,
                participants,
                transaction,
            });
            console.log(`Finished normalizing event id ${eventId}`);
            await transaction.commit();
        } catch (err) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(`Failed normalizing event with id ${eventId}`, err);
            try {
                await RaceQs.FailedUrl.create(
                    { id: uuidv4(), url: eventUrl, error: err.toString() },
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
