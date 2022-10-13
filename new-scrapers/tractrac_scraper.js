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
const { launchBrowser } = require('../utils/puppeteerLauncher');

(async () => {
    // These are only used for limited scraping. If these are set, the urls are filtered
    const eventUrlsToScrape = []; // Example https://www.tractrac.com/event-page/event_20221006_SwissSaili/2306
    const raceUrlsToScrape = []; // Example https://live.tractrac.com/viewer/index.html?target=https://em.event3.tractrac.com/events/47120680-a698-013a-6364-342e996a9920/races/4425cea0-26e1-013b-bc44-342e996a9920.json

    const TRACTRAC_MOMENT_FORMAT = 'YYYY-MM-DD hh:mm:ss';
    const SOURCE = 'tractrac';
    let browser, page;

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

    try {
        browser = await launchBrowser();
        page = await browser.newPage();
    } catch (err) {
        console.log('Failed in launching puppeteer.', err);
        process.exit();
    }

    const formatAndSaveRace = function (event, raceDetails, raceObj) {
        const classesToSave = [];
        const raceClassesToSave = [];
        const controlsToSave = [];
        const controlPointsToSave = [];
        const controlPointPositionsToSave = [];
        const routesToSave = [];
        const competitorsToSave = [];
        const competitorPassingsToSave = [];
        const competitorResultsToSave = [];
        const competitorPositionsToSave = [];
        const raceObjSave = raceObj;

        raceObjSave.event = null;
        raceObjSave.event_original_id = null;
        raceObjSave.name = raceDetails.race.name;
        raceObjSave.url = raceDetails.race.url_html;
        raceObjSave.tracking_start = raceDetails.race.tracking_starttime;
        raceObjSave.tracking_stop = raceDetails.race.tracking_endtime;
        raceObjSave.race_start = raceDetails.race.race_starttime;
        raceObjSave.race_end = raceDetails.assorted.endtime;
        raceObjSave.status = raceDetails.race.status;
        raceObjSave.lon = raceDetails.race.lon;
        raceObjSave.lat = raceDetails.race.lat;
        raceObjSave.calculated_start_time =
            raceDetails.assorted.calculated_start_time;
        raceObjSave.race_handicap = raceDetails.assorted.p_race_handicap;

        if (event !== null) {
            raceObjSave.event = event.id;
            raceObjSave.event_original_id = event.original_id;
        }
        const raceClassesByClassId = {};
        Object.values(raceDetails.assorted.classes).forEach((c) => {
            const cl = {};
            cl.id = uuidv4();
            cl.original_id = c.UUID;
            cl.name = c.Name;
            classesToSave.push(cl);
            const rc = {
                id: uuidv4(),
                race: raceObjSave.id,
                boat_class: cl.id,
            };
            raceClassesByClassId[cl.id] = rc;
            raceClassesToSave.push(rc);
        });

        raceDetails.assorted.routes.forEach((r) => {
            const routeObjSave = {};
            routeObjSave.id = uuidv4();
            routeObjSave.original_id = r.route_id;
            routeObjSave.race = raceObjSave.id;
            routeObjSave.race_original_id = raceObjSave.original_id;
            routeObjSave.name = r.route_name;
            routesToSave.push(routeObjSave);

            r.controls.forEach((c) => {
                const controlObjSave = {};
                controlObjSave.id = uuidv4();
                controlObjSave.original_id = c.original_id;
                controlObjSave.race = raceObjSave.id;
                controlObjSave.race_original_id = raceObjSave.original_id;
                controlObjSave.name = c.name;
                controlObjSave.route = routeObjSave.id;
                controlObjSave.route_original_id = routeObjSave.original_id;

                controlsToSave.push(controlObjSave);

                c.control_points.forEach((controlPt) => {
                    const cp = {
                        id: uuidv4(),
                        race: raceObjSave.id,
                        race_original_id: raceObjSave.original_id,
                        name: controlPt.control_name,
                        route: routeObjSave.id,
                        route_original_id: routeObjSave.original_id,
                        control: controlObjSave.id,
                        control_original_id: controlObjSave.original_id,
                    };
                    controlPointsToSave.push(cp);

                    controlPt.positions.forEach((p) => {
                        const ctlptPosition = {
                            id: uuidv4(),
                            race: raceObjSave.id,
                            race_original_id: raceObjSave.original_id,
                            route: routeObjSave.id,
                            route_original_id: routeObjSave.original_id,
                            controlpoint: cp.id,
                            controlpoint_original_id: cp.original_id,
                            lat: p.latitude,
                            lon: p.longitude,
                            height: p.height,
                            speed: p.speed,
                            direction: p.direction,
                            m: p.m,
                            timestamp: p.timestamp,
                            speed_avg: JSON.stringify(p.speedAvg),
                        };
                        controlPointPositionsToSave.push(ctlptPosition);
                    });
                });
            });
        });

        raceDetails.competitors_params.forEach((c) => {
            // This is created manually since the competitor original id is not unique.
            const competitor = {
                id: uuidv4(),
                original_id: c.uuid,
                race: null,
                race_original_id: null,
                class: null,
                class_original_id: null,
                classrace_id: null,
                class_name: null,
                description: null,
                handicap: null,
                handicap_distance: null,
                start_time: null,
                finish_time: null,
                stop_time: null,
                status_original_id: null,
                status_full: null,
                status_time: null,
                first_name: null,
                last_name: null,
                name: null,
                short_name: null,
                name_alias: null,
                short_alias: null,
                nationality: null,
                non_competing: null,
                handicap_tod: null,
                handicap_tot: null,
            };

            competitor.race = raceObjSave.id;
            competitor.race_original_id = raceObjSave.original_id;
            const cl = classesToSave.find(
                (boatClass) => boatClass.original_id === c.classId
            );
            competitor.class = cl.id;
            competitor.class_original_id = cl.original_id;
            competitor.classrace_id = raceClassesByClassId[cl.id].id;
            competitor.class_name = cl.name;
            competitor.description = c.description;
            competitor.handicap = c.handicap;
            competitor.handicap_distance = c.handicapDistance;
            competitor.nationality = c.nationality;
            competitor.non_competing = c.nonCompeting;

            raceDetails.competitors_race.forEach((cr) => {
                if (cr.id === competitor.original_id) {
                    competitor.start_time = cr.startTime;
                    competitor.finish_time = cr.finishTime;
                    competitor.stop_time = cr.stopTime;
                    competitor.status_original_id = cr.statusId;
                    competitor.status_full = cr.statusFull;
                    competitor.status_time = cr.statusTime;
                    competitor.first_name = cr.firstName;
                    competitor.last_name = cr.lastName;
                    competitor.name = cr.name;
                    competitor.short_name = cr.shortName;
                    competitor.name_alias = cr.nameAlias;
                    competitor.short_alias = cr.shortAlias;
                    competitor.handicap_tod = cr.handicapToD;
                    competitor.handicap_tot = cr.handicapToT;
                }
            });

            competitorsToSave.push(competitor);

            let found = false;
            raceDetails.team_position_data.forEach((tpd) => {
                if (tpd.competitor_id === competitor.original_id && !found) {
                    found = true;

                    const competitorResult = {
                        id: uuidv4(),
                        race: raceObjSave.id,
                        race_original_id: raceObjSave.original_id,
                        competitor: competitor.id,
                        competitor_original_id: competitor.original_id,
                        time_elapsed: tpd.time_elapsed,
                        start_time: tpd.start_time,
                        stop_time: tpd.stop_time,
                        finish_time: tpd.finish_time,
                        status: tpd.status.code,
                        team_name: tpd.team,
                    };
                    competitorResultsToSave.push(competitorResult);

                    if (tpd.passings !== null && tpd.passings !== undefined) {
                        tpd.passings.forEach((p) => {
                            const ctl = controlsToSave.find(
                                (c) => c.original_id === p.controlId
                            );

                            const passing = {
                                id: uuidv4(),
                                race: raceObjSave.id,
                                race_original_id: raceObjSave.original_id,
                                competitor: competitor.id,
                                competitor_original_id: competitor.original_id,
                                control: ctl.id,
                                control_original_id: ctl.original_id,
                                passing_time: p.passingTime,
                                real_passing_time: p.realPassingTime,
                                pos: p.pos,
                                time_from_start: p.timeFromStart,
                            };

                            competitorPassingsToSave.push(passing);
                        });
                    }

                    if (tpd.positions !== null && tpd.positions !== undefined) {
                        tpd.positions.forEach((pos) => {
                            const position = {
                                id: uuidv4(),
                                race: raceObjSave.id,
                                race_original_id: raceObjSave.original_id,
                                competitor: competitor.id,
                                competitor_original_id: competitor.original_id,
                                lat: pos.latitude,
                                lon: pos.longitude,
                                height: pos.height,
                                speed: pos.speed,
                                m: pos.m,
                                direction: pos.direction,
                                timestamp: pos.timestamp,
                                speed_avg: JSON.stringify(pos.speedAvg),
                            };

                            competitorPositionsToSave.push(position);
                        });
                    }
                }
            });
        });

        return {
            racesToSave: [raceObjSave],
            classesToSave,
            raceClassesToSave,
            controlsToSave,
            controlPointsToSave,
            controlPointPositionsToSave,
            routesToSave,
            competitorsToSave,
            competitorPassingsToSave,
            competitorResultsToSave,
            competitorPositionsToSave,
        };
    };

    const parseRace = async (race, event, forceScrapeRaceData) => {
        const raceMeta = race;

        /**
                 * race:
                 *  params_url:
   'http://event.tractrac.com/events/event_20201009_SwedishSLM/clientparams.php?event=event_20201009_SwedishSLM&race=a10e8b10-eb7f-0138-b48a-60a44ce903c3&random=1415477511',
  url_html:
   'https://live.tractrac.com/viewer/index.html?target=https://em.event.tractrac.com/events/d2a0e010-a320-0138-c48f-60a44ce903c3/races/a10e8b10-eb7f-0138-b48a-60a44ce903c3.json',
  url_mobile:
   'https://live.tractrac.com/viewer/count_down.html?event_id=d2a0e010-a320-0138-c48f-60a44ce903c3&event_name=Swedish SL- Mästarnas Mästare Marstrand&race_name=Grund  1&publish_time=&server_url=em.event.tractrac.com&web_id=1910&race_id=a10e8b10-eb7f-0138-b48a-60a44ce903c3&race_web_id=21',
  url_scheme:
   'tractrac://open.app/1910/a10e8b10-eb7f-0138-b48a-60a44ce903c3',
  params_json:
   'https://em.event.tractrac.com/events/d2a0e010-a320-0138-c48f-60a44ce903c3/races/a10e8b10-eb7f-0138-b48a-60a44ce903c3.json',
  id: 'a10e8b10-eb7f-0138-b48a-60a44ce903c3',
  name: 'Grund  1',
  tracking_starttime: '2020-10-10 09:15:47',
  tracking_endtime: '2020-10-10 09:35:38',
  race_starttime: '2020-10-10 09:16:00',
  expected_race_startdate: '2020-10-10',
  map_publication_time: null,
  initialized: '1',
  status: 'UNOFFICIAL',
  status_time: '2020-10-10 09:35:38',
  visibility: 'REPLAY',
  classes: 'J/70',
  classes_list:
   [ { id: 'cdbf3ff0-eb7d-0138-b252-60a44ce903c3', name: 'J/70' } ],
  results_url: '',
  rerun: '',
  has_replay: false,
  metadata: ''
   CLUB RACES HAVE LON LAT
}
                 */

        const startTime = new Date(raceMeta.tracking_starttime).getTime();
        const endTime = new Date(raceMeta.tracking_endtime).getTime();

        const now = Date.now();
        if (startTime > now || endTime > now) {
            console.log('Unfinished race. Only scraping race info');
            const unfinishedRace = {
                event: event?.id,
                event_original_id: event?.original_id,
                name: race.name,
                url: race.url_html,
                tracking_start: race.tracking_starttime,
                tracking_stop: race.tracking_endtime,
                race_start: race.race_starttime,
                status: race.status,
                lon: race.lon,
                lat: race.lat,
            };
            return { unfinishedRace };
        }

        // If raceMeta.has_club then the event_id is actually the club? original id.

        // params_json could be null and replaced with params_url. In that case, it may be a .txt file.
        // sample http://club.tractrac.com/events/event_20140410_TarifaSurf/1f149da0-26cd-0136-d122-10bf48d758ce.txt
        // console.log(raceMeta)
        // url_html is the race url to view.

        // if (raceMeta.params_json !== undefined) {
        // const raceParamsRequest = await axios.get(raceMeta.params_json);
        // This is HUGE
        // console.log(Object.keys(raceParamsRequest.data))
        /**
                     * [ 'parameters',
                        'dataservers',
                        'maps',
                        'classes',
                        'teams',
                        'competitors',
                        'controlPoints',
                        'routes',
                        'splits',
                        'eventId',
                        'eventName',
                        'eventAnalyticsName',
                        'eventDb',
                        'eventStartTime',
                        'eventEndTime',
                        'eventType',
                        'enableNotifier',
                        'notifierClient',
                        'eventTimezone',
                        'generateKmls',
                        'dbReplicaEnabled',
                        'highLoadEnabled',
                        'multipleDataservers',
                        'event_key',
                        'eventJSON',
                        'webId',
                        'raceId',
                        'raceName',
                        'raceStartTime',
                        'raceTrackingStartTime',
                        'raceTrackingEndTime',
                        'initialized',
                        'raceDefaultRouteUUID',
                        'raceHandicapSystem',
                        'onlineStatus',
                        'status',
                        'course_area',
                        'raceTimeZone' ]
                     */
        // } else {
        //     const raceParamsRequest = await axios.get(raceMeta.params_url);

        //     // TODO: Do I need this?
        //     const lines = raceParamsRequest.data.split('\n');
        //     const values = {};
        //     lines.forEach((l) => {
        //         const kv = l.split(':');
        //         if (kv.length > 0) {
        //             values[kv[0]] = kv[1];
        //         }
        //     });
        // }

        try {
            console.log(`Scraping race with url ${raceMeta.url_html}`);
            await page.goto(raceMeta.url_html, {
                waitUntil: 'networkidle2',
                timeout: 60000,
            });
            console.log('Waiting for time control play');
            await page.waitForSelector('#time-control-play');
            await page.click('#time-control-play');
            console.log('Waiting for section race');
            await page.waitForSelector('#contTop > div > section.race');
            if (!forceScrapeRaceData) {
                // If force scrape, do not need to wait for slider to finish since it wont finish if it is live
                try {
                    const waitForFullyLoaded =
                        'document.querySelector("#time-slider > div") != null && document.querySelector("#time-slider > div").style["width"] === "100%"';
                    console.log('Waiting for time slider to finish');
                    await page.waitForFunction(waitForFullyLoaded, {
                        timeout: 120000,
                    });
                } catch (err) {
                    console.log(
                        'Error waiting for time slider to finish. Will still try to get boat positions if there are any',
                        err
                    );
                    // continue even if slider has error because some race has no width on the slider even if it has tracks
                }
            }
            console.log('Loaded race, beginning to parse from website.');
            const raceDetails = await page.evaluate(() => {
                const context = document.querySelector(
                    '#contTop > div > section.race'
                )[
                    Object.keys(
                        document.querySelector('#contTop > div > section.race')
                    )[0]
                ][
                    Object.keys(
                        document.querySelector('#contTop > div > section.race')[
                            Object.keys(
                                document.querySelector(
                                    '#contTop > div > section.race'
                                )
                            )[0]
                        ]
                    )[0]
                ].context;
                const race = context.$component.raceData.race;
                const name = race.name;
                const originalId = race.id;
                const calculatedStartTime = race.calculatedStartTime;
                const startTime = race.raceStartTime;
                const endTime = race.raceEndTime;
                const trackingStartTime = race.trackingStartTime;
                const trackingEndTime = race.trackingEndTime;
                const extent = race.extent;
                const timeZone = race.parameterSet.parameters.eventTimezone;
                const raceDateS = race.readableDate;
                const raceDateTimestamp = race.notReadableDate;
                const classes = race.parameterSet.parameters.classes;
                const params = race.parameterSet.parameters.parameters;
                const routes = Object.values(race.routes).map((route) => {
                    const routeName = route.name;
                    const routeId = route.id;
                    const controls = [];
                    route.controls.forEach((c) => {
                        const originalId = c.id;
                        const name = c.name;

                        const controlPoints = [];
                        c.controlPoints.forEach((cp) => {
                            const controlId = cp.control.id;
                            const controlName = cp.control.name;
                            // const positions = cp.positions.positions;
                            controlPoints.push({
                                control_id: controlId,
                                control_name: controlName,
                                // positions,
                            });
                        });
                        controls.push({
                            original_id: originalId,
                            name,
                            control_points: controlPoints,
                        });
                    });
                    return {
                        route_name: routeName,
                        route_id: routeId,
                        controls,
                    };
                    // Legs are all derrived values I think.
                    //    let legs = []
                    //    route.legs.forEach(l => {

                    //    })
                });

                const pEventId = race.parameterSet.parameters.eventId;
                const pEventSt = race.parameterSet.parameters.eventStartTime;
                const pEventEt = race.parameterSet.parameters.eventEndTime;
                const pRaceHandicap =
                    race.parameterSet.parameters.raceHandicapSystem;
                const pWebId = race.parameterSet.parameters.webId;
                const pCourseArea = race.parameterSet.parameters.course_area;

                const assorted = {
                    params,
                    classes,
                    routes,
                    extent,
                    end_time: endTime,
                    calculated_start_time: calculatedStartTime,
                    p_event_id: pEventId,
                    p_event_st: pEventSt,
                    p_event_et: pEventEt,
                    p_web_id: pWebId,
                    p_course_area: pCourseArea,
                    p_race_handicap: pRaceHandicap,
                };

                const competitorsParams = Object.values(
                    race.parameterSet.parameters.competitors
                );
                const competitorsRace = [];
                Object.values(race.raceCompetitors).forEach((c) => {
                    competitorsRace.push({
                        classId: c.competitorClass.id,
                        className: c.competitorClass.name,
                        description: c.description,
                        finishTime: c.finishTime,
                        firstName: c.firstName,
                        handicapToD: c.handicapToD,
                        handicapToT: c.handicapToT,
                        id: c.id,
                        lastName: c.lastName,
                        name: c.name,
                        nameAlias: c.nameAlias,
                        nationality: c.nationality,
                        nonCompeting: c.nonCompeting,
                        boatName: c.properties.boatName,
                        boatId: c.properties.boatId,
                        shortAlias: c.shortAlias,
                        shortName: c.shortName,
                        standingPos: c.standingPos,
                        startTime: c.startTime,
                        statusId: c.status.id,
                        statusCodePointAt: c.statusCodePointAt,
                        statusName: c.statusName,
                        statusDescription: c.statusDesc,
                        statusFull: c.status.full,
                        statusTime: c.statusTime,
                        stopTime: c.stopTime,
                    });
                });

                const teamPositionData = Object.values(
                    context.$component.raceData.resultItems
                ).map((resultItem) => {
                    const team = resultItem.team.id;
                    const competitorId = resultItem.id;
                    const shortName = resultItem.shortName;
                    const timeElapsed = resultItem.timeElapsed;
                    const startTime = resultItem.startTime;
                    const stopTime = resultItem.stopTime;
                    const finishTime = resultItem.finishTime;
                    const status = resultItem.status;

                    let passings = null;
                    if (resultItem.controlPassings !== null) {
                        passings = resultItem.controlPassings.map((p) => {
                            return {
                                controlId: p.control.id,
                                passingTime: p.passingTime,
                                realPassingTime: p.realPassingTime,
                                pos: p.pos,
                                timeFromStart: p.timeFromStart,
                            };
                        });
                    }

                    const groupLeader = resultItem.groupLeader;
                    const couseTimeHandicap = resultItem.courseTimeHandicap;
                    const startLineAnalysis = resultItem.startLineAnalysis;

                    return {
                        group_leader: groupLeader,
                        competitor_id: competitorId,
                        course_time_handicap: couseTimeHandicap,
                        start_line_analysis: startLineAnalysis,
                        team,
                        short_name: shortName,
                        time_elapsed: timeElapsed,
                        start_time: startTime,
                        stop_time: stopTime,
                        finish_time: finishTime,
                        status,
                        passings,
                    };
                });

                return {
                    competitors_params: competitorsParams,
                    competitors_race: competitorsRace,
                    team_position_data: teamPositionData,
                    assorted,
                    race_date_timestamp: raceDateTimestamp,
                    name,
                    original_id: originalId,
                    calculated_start_time: calculatedStartTime,
                    start_time: startTime,
                    end_time: endTime,
                    tracking_start_time: trackingStartTime,
                    tracking_end_time: trackingEndTime,
                    time_zone: timeZone,
                    race_date_s: raceDateS,
                };
            });

            // Get the control points positions by batch because there are races that are too big and puppeteer evaluate is limited to 100mb
            // A sample race with huge positions data is https://live.tractrac.com/viewer/index.html?target=https://em.event.tractrac.com/events/d87f1b20-3fcc-0136-c5b0-60a44ce903c3/races/1f28f610-42b0-0136-5a33-60a44ce903c3.json
            for (const routeIndex in raceDetails.assorted.routes) {
                const route = raceDetails.assorted.routes[routeIndex];
                const routeId = route.route_id;
                for (const controlIndex in route.controls) {
                    const control = route.controls[controlIndex];
                    for (const controlPointIndex in control.control_points) {
                        const controlPoint =
                            control.control_points[controlPointIndex];
                        const controlPointPositions = await page.evaluate(
                            ({ routeId, controlIndex, controlPointIndex }) => {
                                const context = document.querySelector(
                                    '#contTop > div > section.race'
                                )[
                                    Object.keys(
                                        document.querySelector(
                                            '#contTop > div > section.race'
                                        )
                                    )[0]
                                ][
                                    Object.keys(
                                        document.querySelector(
                                            '#contTop > div > section.race'
                                        )[
                                            Object.keys(
                                                document.querySelector(
                                                    '#contTop > div > section.race'
                                                )
                                            )[0]
                                        ]
                                    )[0]
                                ].context;
                                return context.$component.raceData.race.routes[
                                    routeId
                                ]?.controls[controlIndex]?.controlPoints[
                                    controlPointIndex
                                ]?.positions?.positions;
                            },
                            { routeId, controlIndex, controlPointIndex }
                        );
                        controlPoint.positions = controlPointPositions;
                    }
                }
            }
            // Get the positions by batch because there are races that are too big and puppeteer evaluate is limited to 100mb
            // A sample race with huge positions data is https://live.tractrac.com/viewer/index.html?target=https://em.club.tractrac.com/events/399b7480-6e75-0137-f0a9-60a44ce903c3/races/0291cfa0-86c1-0137-b1c5-10bf48d758ce.json
            for (const teamPositionIndex in raceDetails.team_position_data) {
                const teamData =
                    raceDetails.team_position_data[teamPositionIndex];
                const competitorId = teamData?.competitor_id;
                const competitorPositions = await page.evaluate(
                    (competitorId) => {
                        const context = document.querySelector(
                            '#contTop > div > section.race'
                        )[
                            Object.keys(
                                document.querySelector(
                                    '#contTop > div > section.race'
                                )
                            )[0]
                        ][
                            Object.keys(
                                document.querySelector(
                                    '#contTop > div > section.race'
                                )[
                                    Object.keys(
                                        document.querySelector(
                                            '#contTop > div > section.race'
                                        )
                                    )[0]
                                ]
                            )[0]
                        ].context;
                        return context.$component.raceData.resultItems[
                            competitorId
                        ]?.positions?.positions;
                    },
                    competitorId
                );
                teamData.positions = competitorPositions;
            }
            console.log('Finished parse.');
            raceDetails.race = raceMeta;
            return raceDetails;
        } catch (err) {
            console.log('Failed parsing race', err);
            await registerFailedUrl(SOURCE, raceMeta.url_html, err.toString());
            return null;
        }
    };

    // Events and clubs are basically the same in this schema. So we need to check all races associated with an event or a club.
    let allEventsRequest;
    try {
        allEventsRequest = await axios.get(
            'http://live.tractrac.com/rest-api/events.json'
        );
    } catch (err) {
        console.log('Failed getting events.', err);
        process.exit();
    }
    let allEvents;
    if (eventUrlsToScrape.length) {
        allEvents = allEventsRequest.data.events.filter((e) =>
            eventUrlsToScrape.includes(e.races_url)
        );
    } else {
        allEvents = allEventsRequest.data.events;
    }

    for (const eventObject of allEvents) {
        /** evennt object
            *
            * { id: '1957',
      races_url:
       'http://event.tractrac.com/events/event_20201110_classJapan/jsonservice.php',
      database: 'event_20201110_classJapan',
      name: '470 class Japan Championships 2020',
      logo:
       'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_small.png',
      logo_large:
       'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_large.png',
      cover:
       'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_cover.jpg',
      type: 'Sailing',
      startTime: '2020-11-11',
       for(eventIndex in allEvents){
        let eventObject = allEvents[eventIndex]

           /** evennt object
            *
            * { id: '1957',
      races_url:
       'http://event.tractrac.com/events/event_20201110_classJapan/jsonservice.php',
      database: 'event_20201110_classJapan',
      name: '470 class Japan Championships 2020',
      logo:
       'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_small.png',
      logo_large:
       'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_large.png',
      cover:
       'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_cover.jpg',
      type: 'Sailing',
      startTime: '2020-11-11',
      endTime: '2020-11-15',
      country: 'JPN',
      city: 'Enoshima',
      lat: '35.300000000000',
      lon: '139.500000000000',
      sortOrder: '6',
      map_visibility: 'past',
      etype_icon: 'ico-sailing.png' }
            */

        if (eventObject.type === 'Sailing') {
            if (existingUrls.includes(eventObject.races_url)) {
                console.log(
                    `Existing event url in database ${eventObject.races_url}. Skipping`
                );
                continue;
            }
            console.log(
                `Getting races from event url ${eventObject.races_url}`
            );
            let racesRequest = null;
            try {
                racesRequest = await axios.get(eventObject.races_url);
            } catch (err) {
                console.log(
                    `Failed getting event url ${eventObject.races_url}`,
                    err
                );
                // If certificate is invalid try it with http
                if (
                    err?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' &&
                    eventObject.races_url.includes('https://')
                ) {
                    eventObject.races_url = eventObject.races_url.replace(
                        'https://',
                        'http://'
                    );
                    try {
                        racesRequest = await axios.get(eventObject.races_url);
                    } catch (err2) {
                        console.log(
                            `Failed getting event url on http ${eventObject.races_url}`,
                            err2
                        );
                        await registerFailedUrl(
                            SOURCE,
                            eventObject.races_url,
                            err2.toString()
                        );
                        continue;
                    }
                } else {
                    await registerFailedUrl(
                        SOURCE,
                        eventObject.races_url,
                        err.toString()
                    );
                    continue;
                }
            }

            if (!racesRequest?.data?.event || !racesRequest?.data?.races) {
                const errMsg = 'No event or race details';
                console.log(errMsg);
                await registerFailedUrl(SOURCE, eventObject.races_url, errMsg);
                continue;
            }

            const eventDetails = racesRequest.data.event;

            let races;
            if (raceUrlsToScrape.length) {
                races = racesRequest.data.races.filter((r) =>
                    raceUrlsToScrape.includes(r.url_html)
                );
            } else {
                races = racesRequest.data.races.filter(
                    (r) => r.visibility !== 'HIDDEN'
                ); // Hidden races does not load properly
            }

            const eventSaveObj = {};
            eventSaveObj.id = uuidv4();
            eventSaveObj.original_id = eventDetails.id;

            // console.log(eventDetails)
            /** event details
             *
             *
             * { id: 'd2a0e010-a320-0138-c48f-60a44ce903c3',
                name: 'Swedish SL- Mästarnas Mästare Marstrand',
                database: 'event_20201009_SwedishSLM',
                starttime: '2020-10-09 22:00:00',
                endtime: '2020-10-11 21:00:00',
                type: 'a1b74ca0-fdd8-11dc-8811-005056c00008',
                enable_notifier: false,
                notifier_client_name: null,
                subscriber_service:
                'https://em.event.tractrac.com/api/v1/events/d2a0e010-a320-0138-c48f-60a44ce903c3/mobile_subscriptions',
                url_scheme: 'tractrac://open.app/1910',
                db_replica_enabled: false,
                high_load: false,
                web_url:
                'https://www.tractrac.com/event-page/event_20201009_SwedishSLM/1910',
                dataservers: { stored: [], live: [], ws: [] },
                sap_url:
                'https://swedishleague2020.sapsailing.com/sailingserver/api/v1/leaderboardgroups/Mastarnas%20Mastare',
                sap_event_url:
                'https://swedishleague2020.sapsailing.com/gwt/Home.html#/regatta/leaderboard/:eventId=https://swedishleague2020.sapsailing.com/sailingserver/api/v1/leaderboardgroups/Mastarnas%20Mastare',
                sap_leaderboard_name: 'Mästarnas Mästare Marstrand' }
                *
                *
                */
            try {
                await page.goto(eventDetails.web_url);
                eventSaveObj.external_website = await page.evaluate(() => {
                    return document.querySelector(
                        '#app > main > section > div > div.details > div:nth-child(3) > a'
                    ).href;
                });
            } catch (err) {
                console.log(
                    `Failed visiting url ${eventDetails.web_url}. External website will not be saved.`
                );
            }

            eventSaveObj.name = eventObject.name || eventDetails.name;
            eventSaveObj.country = eventObject.country;
            eventSaveObj.city = eventObject.city;
            eventSaveObj.type = eventObject.type;
            eventSaveObj.start = eventDetails.starttime;
            eventSaveObj.end = eventDetails.endtime;
            eventSaveObj.web_url = eventDetails.web_url;
            eventSaveObj.sap_url = eventDetails.sap_url;
            eventSaveObj.sap_event_url = eventDetails.sap_event_url;
            eventSaveObj.sap_leaderboard_name =
                eventDetails.sap_leaderboard_name;
            eventSaveObj.lat = eventObject.lat;
            eventSaveObj.lon = eventObject.lon;

            if (races.length === 0) {
                console.log('No races on event');
                continue;
            }

            console.log('Got race list. Going through each race now.');
            for (const raceIndex in races) {
                const raceObject = races[raceIndex];

                console.log(
                    `Scraping race index ${raceIndex} of ${races.length} with url`,
                    raceObject.url_html
                );
                if (existingUrls.includes(raceObject.url_html)) {
                    console.log(
                        `Existing race url in database ${raceObject.url_html}. Skipping`
                    );
                    continue;
                }
                let details;
                const raceToFormat = {};
                const forceScrapeRaceData = forceScrapeRacesMap[raceObject.id];
                const existingRaceId = unfinishedRaceIdsMap[raceObject.id]; // in case its already been scraped as unfinished race
                raceToFormat.id =
                    forceScrapeRaceData?.id || existingRaceId || uuidv4();
                raceToFormat.original_id = raceObject.id;
                if (forceScrapeRaceData) {
                    const now = Date.now();
                    const startTime = new Date(
                        raceObject.tracking_starttime
                    ).getTime();
                    if (startTime > now) {
                        // if start time is in the future set it today
                        raceObject.tracking_starttime = moment
                            .utc(now)
                            .format(TRACTRAC_MOMENT_FORMAT);
                        raceObject.tracking_endtime = moment
                            .utc(now)
                            .format(TRACTRAC_MOMENT_FORMAT);
                    } else {
                        raceObject.tracking_endtime = moment
                            .utc(forceScrapeRaceData.approx_end_time_ms)
                            .format(TRACTRAC_MOMENT_FORMAT);
                    }
                }
                try {
                    details = await parseRace(
                        raceObject,
                        eventSaveObj,
                        forceScrapeRaceData
                    );
                } catch (err) {
                    console.log('Failed parsing race', err);
                    await registerFailedUrl(
                        SOURCE,
                        raceObject.url_html,
                        err.toString()
                    );
                    continue;
                }

                if (!details) {
                    continue;
                }

                let objectsToSave;
                if (details.unfinishedRace) {
                    objectsToSave = {
                        TracTracEvent: [eventSaveObj],
                        TracTracRace: [
                            Object.assign(details.unfinishedRace, raceToFormat),
                        ],
                    };
                    scrapedUnfinishedOrigIds.push(
                        details.unfinishedRace.original_id
                    );
                } else {
                    const thingsToSave = formatAndSaveRace(
                        eventSaveObj,
                        details,
                        raceToFormat
                    );

                    if (!thingsToSave.competitorsToSave.length) {
                        const errMsg = 'No boats in race';
                        await registerFailedUrl(
                            SOURCE,
                            raceObject.url_html,
                            errMsg
                        );
                        continue;
                    }

                    if (!thingsToSave.competitorPositionsToSave.length) {
                        const errMsg = 'No positions in race';
                        console.log(errMsg);
                        await registerFailedUrl(
                            SOURCE,
                            raceObject.url_html,
                            errMsg
                        );
                        continue;
                    }

                    objectsToSave = {
                        TracTracClass: thingsToSave.classesToSave,
                        TracTracRaceClass: thingsToSave.raceClassesToSave,
                        TracTracEvent: [eventSaveObj],
                        TracTracRace: thingsToSave.racesToSave,
                        TracTracCompetitor: thingsToSave.competitorsToSave,
                        TracTracCompetitorResult:
                            thingsToSave.competitorResultsToSave,
                        TracTracCompetitorPosition:
                            thingsToSave.competitorPositionsToSave,
                        TracTracCompetitorPassing:
                            thingsToSave.competitorPassingsToSave,
                        TracTracRoute: thingsToSave.routesToSave,
                        TracTracControl: thingsToSave.controlsToSave,
                        TracTracControlPoint: thingsToSave.controlPointsToSave,
                        TracTracControlPointPosition:
                            thingsToSave.controlPointPositionsToSave,
                    };
                }

                try {
                    await createAndSendTempJsonFile(objectsToSave);
                } catch (err) {
                    console.log(
                        `Failed creating and sending temp json file for url ${raceObject.url_html}`,
                        err
                    );
                    await registerFailedUrl(
                        SOURCE,
                        raceObject.url_html,
                        err.toString()
                    );
                    continue;
                }
            }
        }
    }

    // Clubs
    let allClubsRequest;
    try {
        allClubsRequest = await axios.get(
            'http://live.tractrac.com/rest-api/clubs.json'
        );
    } catch (err) {
        console.log('Failed getting clubs.', err);
        process.exit();
    }
    let allClubs;
    if (eventUrlsToScrape.length) {
        allClubs = allClubsRequest.data.events.filter((e) =>
            eventUrlsToScrape.includes(e.races_url)
        );
    } else {
        allClubs = allClubsRequest.data.events;
    }

    for (const clubIndex in allClubs) {
        const clubObject = allClubs[clubIndex];
        if (existingUrls.includes(clubObject.races_url)) {
            console.log(
                `Existing event url in database ${clubObject.races_url}. Skipping`
            );
            continue;
        }

        // TODO: check if club exists.

        // TODO: There is a bug here for saving routes.
        /** Club object
         *
         * { id: '27',
            races_url:
            'https://club.tractrac.com/tracms/client/jsonserviceclubs.php?user=boyan.zlatarev@icloud.com',
            name: '1 Tarifa Sportlink/ Surfski Center',
            logo:
            'images/clubs/4ba84810-a2bc-0131-f55f-10bf48d758ce_small.PNG',
            type: 'Sailing',
            country: 'ESP',
            city: 'Tarifa',
            token_url: null }
         */
        clubObject.original_id = clubObject.id;
        clubObject.id = uuidv4();
        clubObject.email = clubObject.races_url.split('user=')[1];

        let emailObjToSave;
        if (clubObject.email !== undefined) {
            emailObjToSave = {
                id: uuidv4(),
                email: clubObject.email,
                country: clubObject.country,
                source: 'TracTrac',
            };
        }
        let clubRacesRequest;
        try {
            clubRacesRequest = await axios.get(clubObject.races_url);
        } catch (err) {
            console.log(err);
            await registerFailedUrl(
                SOURCE,
                clubObject.races_url,
                err.toString()
            );
            continue;
        }

        let clubRaces;
        if (raceUrlsToScrape.length) {
            clubRaces = clubRacesRequest.data.races.filter((r) =>
                raceUrlsToScrape.includes(r.url_html)
            );
        } else {
            clubRaces = clubRacesRequest.data.races;
        }
        for (const raceIndex in clubRaces) {
            const raceObject = clubRaces[raceIndex];
            /**
            *
            * Race object
            *
            * { database: 'event_20140410_TarifaSurf',
  url:
   'http://club.tractrac.com/events/event_20140410_TarifaSurf/index.php?raceid=58fee0b0-de58-0135-d464-101b0ec43d96',
  url_emb:
   'http://club.tractrac.com/events/event_20140410_TarifaSurf/58fee0b0-de58-0135-d464-101b0ec43d96.html',
  params_url:
   'http://club.tractrac.com/events/event_20140410_TarifaSurf/58fee0b0-de58-0135-d464-101b0ec43d96.txt',
  url_html:
   'https://live.tractrac.com/viewer/index.html?target=https://em.club.tractrac.com/events/782fb150-a2bb-0131-f556-10bf48d758ce/races/58fee0b0-de58-0135-d464-101b0ec43d96.json',
  event_id: '782fb150-a2bb-0131-f556-10bf48d758ce',
  event_name: 'Surfski Center Tarifa',
  event_type: 'Sailing',
  id: '58fee0b0-de58-0135-d464-101b0ec43d96',
  name: 'Surfski Center Tarifa - Test Paddle 16:00 h',
  tracking_starttime: '2018-01-18 14:47:31',
  tracking_endtime: '2018-01-18 17:18:56',
  race_starttime: '',
  expected_race_startdate: '2018-01-18',
  initialized: '1',
  status: 'ONLINE',
  visibility: 'REPLAY',
  classes: 'Tarifa',
  classes_list:
   [ { id: '1f351760-0919-0132-f4a2-10bf48d758ce', name: 'Tarifa' } ],
  rerun: '',
  lat: 36.02044505682507,
  lon: -5.619309594726587 }
            */
            raceObject.club = clubObject.id;
            raceObject.club_original_id = clubObject.original_id;
            raceObject.has_club = true;

            if (raceObject.event_type === 'Sailing') {
                if (existingUrls.includes(raceObject.url_html)) {
                    console.log(
                        `Existing race url in database ${raceObject.url_html}. Skipping`
                    );
                    continue;
                }
                const raceToFormat = {};
                const forceScrapeRaceData = forceScrapeRacesMap[raceObject.id];
                const existingRaceId = unfinishedRaceIdsMap[raceObject.id]; // in case its already been scraped as unfinished race
                raceToFormat.id =
                    forceScrapeRaceData?.id || existingRaceId || uuidv4();
                raceToFormat.original_id = raceObject.id;

                if (forceScrapeRaceData) {
                    const now = Date.now();
                    const startTime = new Date(
                        raceObject.tracking_starttime
                    ).getTime();
                    if (startTime > now) {
                        // if start time is in the future set it today
                        raceObject.tracking_starttime = moment
                            .utc(now)
                            .format(TRACTRAC_MOMENT_FORMAT);
                        raceObject.tracking_endtime = moment
                            .utc(now)
                            .format(TRACTRAC_MOMENT_FORMAT);
                    } else {
                        raceObject.tracking_endtime = moment
                            .utc(forceScrapeRaceData.approx_end_time_ms)
                            .format(TRACTRAC_MOMENT_FORMAT);
                    }
                }

                const eventSaveObj = {
                    id: uuidv4(),
                    original_id: raceObject.event_id,
                    name: raceObject.event_name,
                    description: `Club Name: ${clubObject.name}`,
                    web_url: clubObject.races_url,
                    country: clubObject.country,
                    city: clubObject.city,
                    type: raceObject.event_type,
                };

                const details = await parseRace(
                    raceObject,
                    eventSaveObj,
                    forceScrapeRaceData
                );
                if (!details) {
                    continue;
                }

                let objectsToSave;
                if (details.unfinishedRace) {
                    objectsToSave = {
                        TracTracEvent: [eventSaveObj],
                        TracTracRace: [
                            Object.assign(details.unfinishedRace, raceToFormat),
                        ],
                    };
                    scrapedUnfinishedOrigIds.push(
                        details.unfinishedRace.original_id
                    );
                } else {
                    const thingsToSave = formatAndSaveRace(
                        eventSaveObj,
                        details,
                        raceToFormat
                    );

                    if (!thingsToSave.competitorsToSave.length) {
                        const errMsg = 'No boats in race';
                        console.log(errMsg);
                        await registerFailedUrl(
                            SOURCE,
                            raceObject.url_html,
                            errMsg
                        );
                        continue;
                    }

                    if (!thingsToSave.competitorPositionsToSave.length) {
                        const errMsg = 'No positions in race';
                        console.log(errMsg);
                        await registerFailedUrl(
                            SOURCE,
                            raceObject.url_html,
                            errMsg
                        );
                        continue;
                    }

                    objectsToSave = {
                        TracTracEvent: [eventSaveObj],
                        TracTracClass: thingsToSave.classesToSave,
                        TracTracRaceClass: thingsToSave.raceClassesToSave,
                        TracTracRace: thingsToSave.racesToSave,
                        TracTracCompetitor: thingsToSave.competitorsToSave,
                        TracTracCompetitorResult:
                            thingsToSave.competitorResultsToSave,
                        TracTracCompetitorPosition:
                            thingsToSave.competitorPositionsToSave,
                        TracTracCompetitorPassing:
                            thingsToSave.competitorPassingsToSave,
                        TracTracRoute: thingsToSave.routesToSave,
                        TracTracControl: thingsToSave.controlsToSave,
                        TracTracControlPoint: thingsToSave.controlPointsToSave,
                        TracTracControlPointPosition:
                            thingsToSave.controlPointPositionsToSave,
                    };
                    if (emailObjToSave) {
                        objectsToSave.SailorEmail = [emailObjToSave];
                    }
                }

                try {
                    await createAndSendTempJsonFile(objectsToSave);
                } catch (err) {
                    console.log(
                        `Failed creating and sending temp json file for url ${raceObject.url_html}`,
                        err
                    );
                    await registerFailedUrl(
                        SOURCE,
                        raceObject.url_html,
                        err.toString()
                    );
                    continue;
                }
            }
        }
    }
    console.log('Finished scraping all races');
    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
    page.close();
    browser.close();
    process.exit();
})();
