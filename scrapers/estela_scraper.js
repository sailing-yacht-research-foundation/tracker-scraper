const {
    Estela,
    SearchSchema,
    sequelize,
    connect,
} = require('../tracker-schema/schema.js');
const {
    createBoatToPositionDictionary,
    positionsToFeatureCollection,
    collectLastNPositionsFromBoatsToPositions,
    getCenterOfMassOfPositions,
    findAverageLength,
    createRace,
    createTurfPoint,
    allPositionsToFeatureCollection,
} = require('../tracker-schema/gis_utils.js');
const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const turf = require('@turf/turf');
const puppeteer = require('puppeteer');
const { uploadGeoJsonToS3 } = require('../utils/upload_racegeojson_to_s3.js');

// TODO: automate this limit.
const LIMIT = 3000;
const ESTELA_RACE_PAGE_URL = 'https://www.estela.co/en?page={$PAGENUM$}#races';
const PAGENUM = '{$PAGENUM$}';
const ESTELA_SOURCE = 'ESTELA';

(async () => {
    const CONNECTED_TO_DB = connect();
    if (!CONNECTED_TO_DB) {
        console.log("Couldn't connect to db.");
        process.exit();
    }

    const existingFailureObjects = await Estela.EstelaFailedUrl.findAll({
        attributes: ['url'],
    });
    const existingRaceObjects = await Estela.EstelaRace.findAll({
        attributes: ['id', 'original_id', 'url', 'name'],
    });
    const existingClubObjects = await Estela.EstelaClub.findAll({
        attributes: ['id', 'original_id'],
    });
    const existingClubs = {};
    const existingFailures = [];
    const existingRaces = [];
    existingClubObjects.forEach((c) => {
        existingClubs[c.original_id] = c.id;
    });

    existingFailureObjects.forEach((f) => {
        existingFailures.push(f.url);
    });
    existingRaceObjects.forEach((r) => {
        existingRaces.push(r.url);
    });

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const allRaceUrls = [];

    // Pages increment by 1
    let counter = 1;
    while (counter < LIMIT) {
        // Get current list of races from page.
        console.log('Loading race list page number: ' + counter + '.');

        const pageUrl = ESTELA_RACE_PAGE_URL.replace(
            PAGENUM,
            counter.toString()
        );
        try {
            await page.goto(pageUrl, { timeout: 0, waitUntil: 'networkidle0' });

            const { raceUrls, isNextBtnDisabled } = await page.evaluate(() => {
                const refs = document.querySelectorAll(
                    'body > div > div.container > section > div > div > div > div > div > a'
                );
                const isNextBtnDisabled = !document.querySelector(
                    'body > div:nth-child(3) > div.container > section:nth-child(2) > div > div > ul > li:nth-child(2):not(.disabled)'
                );
                const raceUrls = [];
                for (const index in refs) {
                    const ref = refs[index];
                    if (ref.href !== undefined) {
                        const url = ref.href;
                        const trackingUrl = url.replace(
                            'https://www.estela.co/en/race',
                            'https://www.estela.co/en/tracking-race'
                        );
                        raceUrls.push(trackingUrl);
                    }
                }
                return { raceUrls, isNextBtnDisabled };
            });

            if (raceUrls.length === 0) {
                console.log('No races associated with this event. Skipping.');
                counter += 1;
                continue;
            }

            raceUrls.forEach((u) => {
                if (
                    !existingFailures.includes(u) &&
                    !existingRaces.includes(u)
                ) {
                    allRaceUrls.push(u);
                }
            });
            if (isNextBtnDisabled) {
                break;
            }
        } catch (err) {
            console.log(err);
            try {
                await Estela.EstelaFailedUrl.create(
                    { url: pageUrl, error: err.toString(), id: uuidv4() },
                    { fields: ['url', 'id', 'error'] }
                );
            } catch (err2) {
                console.log('Failed inserting failed record in database', err2);
            }
        }
        counter += 1;
    }

    console.log(
        `Beginning to parse race list with length ${allRaceUrls.length}`
    );

    for (const raceIndex in allRaceUrls) {
        const currentRaceUrl = allRaceUrls[raceIndex];
        try {
            await page.goto(currentRaceUrl, {
                timeout: 0,
                waitUntil: 'networkidle0',
            });
            if (existingRaces.includes(currentRaceUrl)) {
                continue;
            }
            console.log(currentRaceUrl);
            await page.waitForFunction(() => {
                return (
                    window.playerConfig !== null &&
                    window.playerConfig !== undefined
                );
            });
            const raceInfo = await page.evaluate(() => {
                const club = window.playerConfig.club;
                const dorsals = window.playerConfig.dorsals;
                const initLat = window.playerConfig.initLat;
                const initLon = window.playerConfig.initLng;
                const marks = window.playerConfig.marks;
                const results = window.playerConfig.results;
                const r = window.playerConfig.race;
                const bs = r.buoys;
                const buoys = [];

                bs.forEach((b) => {
                    const l = b.layline;
                    let layline = null;
                    if (l !== null && l !== undefined) {
                        layline = {
                            angle: l.angle,
                            distance: l.distance,
                        };
                    }
                    let a = null;
                    let d = null;
                    if (layline !== null) {
                        a = layline.angle;
                        d = layline.distance;
                    }
                    const buoy = {
                        anchored_at: b.anchored_at,
                        door: b.door,
                        focus: b.focus,
                        original_id: b.id,
                        index: b.index,
                        label: b.label,
                        lat: b.lat,
                        lon: b.lng,
                        name: b.name,
                        score: b.score,
                        updated_at: b.updated_at,
                        waypoint: b.waypoint,
                        layline_angle: a,
                        layline_distance: d,
                    };

                    if (
                        b.nextSoringBuoy !== null &&
                        b.nextScoringBuoy !== undefined
                    ) {
                        buoy.nextScoringBuoy = b.nextScoringBuoy.id;
                    }

                    buoys.push(buoy);
                });

                const race = {
                    buoy_radius: r.buoy_radius,
                    buoys: buoys,
                    initLat: initLat,
                    initLon: initLon,
                    classes: r.classes,
                    end: r.end,
                    end_timestamp: r.end_timestamp,
                    ended_at: r.ended_at,
                    has_ended: r.has_ended,
                    has_started: r.has_started,
                    id: r.id,
                    initial_bounds: r.initial_bounds,
                    length: r.length,
                    name: r.name,
                    offset: r.offset,
                    onset: r.onset,
                    onset_timestamp: r.onset_timestamp,
                    players: r.players,
                    scheduled_timestamp: r.scheduled_timestamp,
                    start: r.start,
                    start_timestamp: r.start_timestamp,
                    winds: r.winds,
                    url: '',
                };

                return { race, results, marks, dorsals, club };
            });

            raceInfo.race.url = currentRaceUrl;

            if (
                raceInfo.race.start_timestamp > Date.now() ||
                !raceInfo.race.has_ended
            ) {
                console.log('Future race, skipping.');
                continue;
            }

            const baseUrl = currentRaceUrl.replace(
                'https://www.estela.co/en/tracking-race/',
                'https://www.estela.co/races/'
            );

            const gpxUrl = baseUrl + '/route.gpx?';
            const windsCsvUrl = baseUrl + '/winds.csv';
            const legWindUrl = baseUrl + '/legs-wind.csv';
            const resultsUrl = baseUrl + '/results.csv';

            const gpxRequest = await axios.get(gpxUrl);
            raceInfo.race.gpx = gpxRequest.data;

            const windRequest = await axios.get(windsCsvUrl);
            raceInfo.race.wind = windRequest.data;
            const legWindRequest = await axios.get(legWindUrl);
            raceInfo.race.legWind = legWindRequest.data;
            const resultsRequest = await axios.get(resultsUrl);
            raceInfo.race.resultsData = resultsRequest.data;

            let HAS_POSITIONS = false;
            let positions = {};
            const positionLimit = 100000;
            try {
                const positionRequest = await axios.get(
                    'https://d22ymaefawl8oh.cloudfront.net/v2/races/' +
                        raceInfo.race.id +
                        '/positions/?limit=-1'
                );
                positions = positionRequest.data.data.positions;
                HAS_POSITIONS = true;
            } catch (error) {
                let gotThemAll = false;
                let timeParam = '';
                while (!gotThemAll) {
                    const positionRequest = await axios.get(
                        'https://d22ymaefawl8oh.cloudfront.net/v2/races/' +
                            raceInfo.race.id +
                            '/positions/?' +
                            timeParam +
                            '&limit=' +
                            positionLimit.toString()
                    );
                    if (positionRequest.data.data.positions.length === 0) {
                        gotThemAll = true;
                    } else {
                        if (positionRequest.data.data.length < positionLimit) {
                            gotThemAll = true;
                        }
                        timeParam = 'start=' + positionRequest.data.data.last.t;
                        Object.keys(
                            positionRequest.data.data.positions
                        ).forEach((k) => {
                            if (
                                positions[k] === null ||
                                positions[k] === undefined
                            ) {
                                positions[k] =
                                    positionRequest.data.data.positions[k];
                            } else {
                                positions[k] = positions[k].concat(
                                    positionRequest.data.data.positions[k]
                                );
                            }
                        });
                    }
                }
                HAS_POSITIONS = true;
            }

            const clubExtras = {};
            for (const dorsalIndex in raceInfo.dorsals) {
                const d = raceInfo.dorsals[dorsalIndex];
                const k = d.id;
                const tag = currentRaceUrl.replace(
                    'https://www.estela.co/en/tracking-race/' +
                        raceInfo.race.id,
                    ''
                );
                const boatTrackCsvUrl =
                    'https://www.estela.co/races/' +
                    raceInfo.race.id +
                    '/' +
                    k +
                    '/download' +
                    tag +
                    '/track.csv';

                const boatTrackRequest = await axios.get(boatTrackCsvUrl);
                d.trackCsv = boatTrackRequest.data;

                const clubPageRequest = await axios.get(
                    'https://www.estela.co/clubs?key=' + k
                );
                const namePat = /<span class="panel-title">(.*)<\/span>/g;
                const phonePat = /<small><i class="fa fa-phone"><\/i>([0-9\s]*)<\/small>/gm;
                const emailPat = /<small>(.*)@(.*)<\/small><br>/gm;
                const names = {};
                const phones = {};
                const emails = {};
                let nameCounter = 0;
                if (clubPageRequest.data.match(namePat) !== null) {
                    clubPageRequest.data.match(namePat).forEach((n) => {
                        const name = n.match(
                            /<span class="panel-title">(.*)<\/span>/
                        )[1];
                        names[nameCounter.toString()] = name;
                        nameCounter += 1;
                    });
                }

                let phoneCounter = 0;
                if (clubPageRequest.data.match(phonePat) !== null) {
                    clubPageRequest.data.match(phonePat).forEach((n) => {
                        const phone = n.match(
                            /<small><i class="fa fa-phone"><\/i>([0-9\s]*)<\/small>/
                        )[1];
                        phones[phoneCounter.toString()] = phone.trim();
                        phoneCounter += 1;
                    });
                }

                let emailCounter = 0;
                if (clubPageRequest.data.match(emailPat) !== null) {
                    clubPageRequest.data.match(emailPat).forEach((n) => {
                        const matches = n.match(
                            /<small>(.*)@(.*)<\/small><br>/
                        );
                        const email = matches[1] + '@' + matches[2];
                        emails[emailCounter.toString()] = email;
                        emailCounter += 1;
                    });
                }

                for (const nameIndex in Object.keys(names)) {
                    const k = Object.keys(names)[nameIndex];
                    const n = names[k];
                    const c = {
                        name: n,
                        phone: phones[k],
                        email: emails[k],
                    };
                    clubExtras[n] = c;
                }
            }

            if (
                raceInfo.club !== undefined &&
                clubExtras[raceInfo.club.name] !== undefined
            ) {
                raceInfo.club.phone = clubExtras[raceInfo.club.name].phone;
                raceInfo.club.email = clubExtras[raceInfo.club.name].email;

                // Create new club.
                if (
                    existingClubs[raceInfo.club.id] === null ||
                    existingClubs[raceInfo.club.id] === undefined
                ) {
                    const newClub = {
                        id: uuidv4(),
                        original_id: raceInfo.club.id,
                        user_id: raceInfo.club.user_id,
                        name: raceInfo.club.name,
                        lon: raceInfo.club.lng,
                        lat: raceInfo.club.lat,
                        timezone: raceInfo.club.timezone,
                        website: raceInfo.club.website,
                        address: raceInfo.club.address,
                        twitter: raceInfo.club.twitter_account,
                        api_token: raceInfo.club.api_token,
                        phone: raceInfo.club.phone,
                        email: raceInfo.club.email,
                    };

                    await Estela.EstelaClub.create(newClub, {
                        fields: Object.keys(newClub),
                    });
                    existingClubs[newClub.original_id] = newClub.id;
                }
            }

            if (raceInfo.club !== undefined) {
                raceInfo.newClubId = existingClubs[raceInfo.club.id];
                raceInfo.clubOriginalId = raceInfo.club.id;
            }

            const newRace = {
                id: uuidv4(),
                original_id: raceInfo.race.id,
                initLon: raceInfo.race.initLon,
                initLat: raceInfo.race.initLat,
                end: raceInfo.race.end,
                end_timestamp: raceInfo.race.end_timestamp,
                ended_at: raceInfo.race.ended_at,
                has_ended: raceInfo.race.has_ended,
                has_started: raceInfo.race.has_started,
                length: raceInfo.race.length,
                name: raceInfo.race.name,
                offset: raceInfo.race.offset,
                onset: raceInfo.race.onset,
                onset_timestamp: raceInfo.race.onset_timestamp,
                scheduled_timestamp: raceInfo.race.scheduled_timestamp,
                start: raceInfo.race.start,
                start_timestamp: raceInfo.race.start_timestamp,
                url: raceInfo.race.url,
                gpx: raceInfo.race.gpx,
                winds_csv: raceInfo.race.wind,
                leg_winds_csv: raceInfo.race.legWind,
                results_csv: raceInfo.race.resultsData,
                club: raceInfo.newClubId,
                club_original_id: raceInfo.clubOriginalId,
            };

            const buoyIds = {};
            raceInfo.race.buoys.forEach((b) => {
                b.radius = raceInfo.race.buoy_radius;
                b.id = uuidv4();
                b.race = newRace.id;
                b.race_original_id = newRace.original_id;
                buoyIds[b.original_id] = b.id;
            });

            const newDorsals = [];
            const dorsalIds = {};

            raceInfo.dorsals.forEach((dor) => {
                let cId = null;
                let cOriginalId = null;
                if (dor.pivot !== undefined) {
                    cId = existingClubs[dor.pivot.club_id];
                    cOriginalId = dor.pivot.club_id;
                }

                const dorsal = {
                    id: uuidv4(),
                    original_id: dor.id,
                    race: newRace.id,
                    race_original_id: newRace.original_id,
                    name: dor.name,
                    model: dor.model,
                    committee: dor.committee,
                    number: dor.number,
                    mmsi: dor.mmsi,
                    pivot_club_id: cId,
                    pivot_club_original_id: cOriginalId,
                    class: dor.class,
                    active: dor.active,
                    track_csv: dor.trackCsv,
                };

                newDorsals.push(dorsal);
                dorsalIds[dor.id] = dorsal.id;
            });

            const newPlayers = [];
            raceInfo.race.players.forEach((ply) => {
                const player = {
                    id: uuidv4(),
                    original_id: ply.id,
                    dorsal: dorsalIds[ply.dorsal_id],
                    dorsal_original_id: ply.dorsal_id,
                    class: ply.class,
                    name: ply.name,
                    number: ply.number,
                    committee: ply.committee,
                    race: newRace.id,
                    race_original_id: newRace.original_id,
                };

                newPlayers.push(player);
            });

            const newResults = [];
            raceInfo.results.forEach((res) => {
                const result = {
                    id: uuidv4(),
                    race: newRace.id,
                    race_original_id: newRace.original_id,
                    dorsal: dorsalIds[res.dorsal_id],
                    dorsal_original_id: res.dorsal_id,
                    buoy: buoyIds[res.buoy_id],
                    buoy_original_id: res.buoy_id,
                    laravel_through_key: res.laravel_through_key,
                    timestamp: res.timestamp,
                };

                newResults.push(result);
            });

            const newPositions = [];
            if (HAS_POSITIONS) {
                const keys = Object.keys(positions);
                keys.forEach((k) => {
                    const pos = positions[k];
                    let lastTime = '';
                    pos.forEach((p) => {
                        const position = {
                            id: uuidv4(),
                            race: newRace.id,
                            race_original_id: newRace.original_id,
                            dorsal: dorsalIds[k],
                            dorsal_original_id: k,
                            lon: p.n,
                            lat: p.a,
                            timestamp: p.t,
                            s: p.s,
                            c: p.c,
                            p: p.p,
                            w: p.w,
                            y: p.y,
                        };
                        if (p.t !== lastTime) {
                            lastTime = p.t;
                            newPositions.push(position);
                        }
                    });
                });
            }

            let transaction;
            try {
                transaction = await sequelize.transaction();
                const currentRace = await Estela.EstelaRace.create(newRace, {
                    fields: Object.keys(newRace),
                    transaction,
                });
                if (raceInfo.race.buoys.length > 0) {
                    await Estela.EstelaBuoy.bulkCreate(raceInfo.race.buoys, {
                        fields: Object.keys(raceInfo.race.buoys[0]),
                        transaction,
                    });
                }

                if (newDorsals.length > 0) {
                    await Estela.EstelaDorsal.bulkCreate(newDorsals, {
                        fields: Object.keys(newDorsals[0]),
                        transaction,
                    });
                }

                if (newPlayers.length > 0) {
                    await Estela.EstelaPlayer.bulkCreate(newPlayers, {
                        fields: Object.keys(newPlayers[0]),
                        transaction,
                    });
                }

                if (newResults.length > 0) {
                    await Estela.EstelaResult.bulkCreate(newResults, {
                        fields: Object.keys(newResults[0]),
                        transaction,
                    });
                }
                let tempPositions = [];
                if (newPositions.length > 0) {
                    let posIndex = 0;
                    for (const newPositionsIndex in newPositions) {
                        posIndex += 1;
                        tempPositions.push(newPositions[newPositionsIndex]);
                        if (posIndex === 10000) {
                            posIndex = 0;
                            await Estela.EstelaPosition.bulkCreate(
                                tempPositions,
                                {
                                    fields: Object.keys(newPositions[0]),
                                    transaction,
                                }
                            );
                            tempPositions = [];
                        }
                    }
                    if (posIndex > 0) {
                        await Estela.EstelaPosition.bulkCreate(tempPositions, {
                            fields: Object.keys(newPositions[0]),
                            transaction,
                        });
                    }
                }
                await normalizeRace(
                    currentRace,
                    newPositions,
                    newDorsals,
                    transaction
                );
                await transaction.commit();
                console.log('Finished scraping race.');
            } catch (err) {
                if (transaction) {
                    await transaction.rollback();
                }
                throw err;
            }
            // buoys, players, winds, race, dorsals, results, marks, positions,  initial_bounds then done!
        } catch (err) {
            console.log(err);
            try {
                await Estela.EstelaFailedUrl.create(
                    {
                        url: currentRaceUrl,
                        error: err.toString(),
                        id: uuidv4(),
                    },
                    { fields: ['url', 'id', 'error'] }
                );
            } catch (err2) {
                console.log('Failed inserting failed record in database', err2);
            }
        }
    }

    page.close();
    browser.close();
    process.exit();
})();

async function normalizeRace(race, allPositions, boats, transaction) {
    const id = race.id;
    const name = race.name;
    const event = null;
    const url = race.url;
    const startTime = new Date(race.start_timestamp * 1000).getTime();
    const endTime = new Date(race.end_timestamp * 1000).getTime();
    let startPoint = createTurfPoint(race.initLat, race.initLon);

    if (allPositions.length === 0) {
        console.log('No positions so skipping.');
        return;
    }

    const boundingBox = turf.bbox(
        positionsToFeatureCollection('lat', 'lon', allPositions)
    );
    const boatsToSortedPositions = createBoatToPositionDictionary(
        allPositions,
        'dorsal',
        'timestamp'
    );
    const last3Positions = collectLastNPositionsFromBoatsToPositions(
        boatsToSortedPositions,
        3
    );
    let endPoint = getCenterOfMassOfPositions('lat', 'lon', last3Positions);
    const buoys = await Estela.EstelaBuoy.findAll({ where: { race: race.id } });
    if (buoys.length > 2) {
        buoys.sort((a, b) => (parseInt(a.index) > parseInt(b.index) ? 1 : -1));

        const startBuoy = buoys[0];
        const endBuoy = buoys[buoys.length - 1];
        if (startBuoy.lat !== null && startBuoy.lon !== null) {
            startPoint = createTurfPoint(startBuoy.lat, startBuoy.lon);
        }
        if (endBuoy.lat !== null && endBuoy.lon !== null) {
            endPoint = createTurfPoint(endBuoy.lat, endBuoy.lon);
        }
    }
    allPositions = null;
    const boatNames = [];
    const boatModels = [];
    const handicapRules = [];
    const boatIdentifiers = [];
    const unstructuredText = [];

    for (const boatIndex in boats) {
        const b = boats[boatIndex];
        boatNames.push(b.name);
        boatModels.push(b.model);
        boatIdentifiers.push(b.mmsi);
        boatIdentifiers.push(b.number);
    }

    const roughLength = findAverageLength('lat', 'lon', boatsToSortedPositions);
    const raceMetadata = await createRace(
        id,
        name,
        event,
        ESTELA_SOURCE,
        url,
        startTime,
        endTime,
        startPoint,
        endPoint,
        boundingBox,
        roughLength,
        boatsToSortedPositions,
        boatNames,
        boatModels,
        boatIdentifiers,
        handicapRules,
        unstructuredText
    );
    const tracksGeojson = JSON.stringify(
        allPositionsToFeatureCollection(boatsToSortedPositions)
    );

    await SearchSchema.RaceMetadata.create(raceMetadata, {
        fields: Object.keys(raceMetadata),
        transaction,
    });
    await uploadGeoJsonToS3(race.id, tracksGeojson, ESTELA_SOURCE, transaction);
}
