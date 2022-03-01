const { launchBrowser } = require('../utils/puppeteerLauncher');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
    getUnfinishedRaceIds,
    cleanUnfinishedRaces,
} = require('../utils/raw-data-server-utils');

const LIMIT = 3000;
const ESTELA_RACE_PAGE_URL = 'https://www.estela.co/en?page={$PAGENUM$}#races';
const PAGENUM = '{$PAGENUM$}';

(async () => {
    const SOURCE = 'estela';
    const existingClubs = {};
    const {
        PROXY_HOST,
        PROXY_PORT,
        PROXY_USERNAME,
        PROXY_PASSWORD,
    } = process.env;
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

    try {
        const puppeteerOptions = {};
        if (PROXY_HOST && PROXY_PORT) {
            puppeteerOptions.args = [
                `--proxy-server=${PROXY_HOST}:${PROXY_PORT}`,
            ];
        }
        browser = await launchBrowser(puppeteerOptions);
        page = await browser.newPage();
        if (PROXY_USERNAME && PROXY_PASSWORD) {
            await page.authenticate({
                username: PROXY_USERNAME,
                password: PROXY_PASSWORD,
            });
        }
    } catch (err) {
        console.log('Failed in launching puppeteer.', err);
        process.exit();
    }

    let unfinishedRaceIdsMap;
    try {
        unfinishedRaceIdsMap = await getUnfinishedRaceIds(SOURCE);
    } catch (err) {
        console.log('Error getting unfinished race ids', err);
        process.exit();
    }
    const scrapedUnfinishedOrigIds = [];

    const allRaceUrls = [];
    let counter = 1;
    while (counter < LIMIT) {
        const pageUrl = ESTELA_RACE_PAGE_URL.replace(
            PAGENUM,
            counter.toString()
        );
        console.log(`Getting race list with url ${pageUrl}`);
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
                console.log(`No races associated with this page ${pageUrl}.`);
            } else {
                allRaceUrls.push(...raceUrls);
            }
            if (isNextBtnDisabled) {
                break;
            }
        } catch (err) {
            console.log('Failed scraping race list', err);
            await registerFailedUrl(SOURCE, pageUrl, err.toString());
        }
        counter++;
    }

    console.log(
        `Beginning to parse race list with length ${allRaceUrls.length}`
    );

    for (const raceIndex in allRaceUrls) {
        const objectsToSave = {};
        const currentRaceUrl = allRaceUrls[raceIndex];
        if (existingUrls.includes(currentRaceUrl)) {
            continue;
        }
        console.log(`Scraping race with url ${currentRaceUrl}`);
        try {
            await page.goto(currentRaceUrl, {
                timeout: 0,
                waitUntil: 'networkidle0',
            });
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

            const newRace = {
                id: unfinishedRaceIdsMap[raceInfo.race.id] || uuidv4(),
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
            };

            const now = Date.now();
            if (
                raceInfo.race.start_timestamp * 1000 > now ||
                !raceInfo.race.has_ended ||
                raceInfo.race.end_timestamp * 1000 > now
            ) {
                console.log(
                    'Unfinished race. Only scraping race info',
                    newRace
                );
                await createAndSendTempJsonFile({
                    EstelaRace: [newRace],
                });
                console.log('Finished sending unfinished race.');
                scrapedUnfinishedOrigIds.push(newRace.original_id);
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
            const axiosOptions = {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
                },
            };
            if (PROXY_HOST && PROXY_PORT) {
                axiosOptions.proxy = {
                    host: PROXY_HOST,
                    port: PROXY_PORT,
                };
                if (PROXY_USERNAME && PROXY_PASSWORD) {
                    axiosOptions.proxy.auth = {
                        username: process.env.PROXY_USERNAME,
                        password: process.env.PROXY_PASSWORD,
                    };
                }
            }
            const gpxRequest = await axios.get(gpxUrl, axiosOptions);
            raceInfo.race.gpx = gpxRequest.data;

            const windRequest = await axios.get(windsCsvUrl, axiosOptions);
            raceInfo.race.wind = windRequest.data;
            const legWindRequest = await axios.get(legWindUrl, axiosOptions);
            raceInfo.race.legWind = legWindRequest.data;
            const resultsRequest = await axios.get(resultsUrl, axiosOptions);
            raceInfo.race.resultsData = resultsRequest.data;

            let HAS_POSITIONS = false;
            let positions = {};
            const positionLimit = 100000;
            try {
                const positionRequest = await axios.get(
                    'https://d22ymaefawl8oh.cloudfront.net/v2/races/' +
                        raceInfo.race.id +
                        '/positions/?limit=-1',
                    axiosOptions
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
                            positionLimit.toString(),
                        axiosOptions
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

                const boatTrackRequest = await axios.get(
                    boatTrackCsvUrl,
                    axiosOptions
                );
                d.trackCsv = boatTrackRequest.data;

                const clubPageRequest = await axios.get(
                    'https://www.estela.co/clubs?key=' + k,
                    axiosOptions
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

            objectsToSave.EstelaClub = [];
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

                    objectsToSave.EstelaClub.push(newClub);
                    existingClubs[newClub.original_id] = newClub.id;
                }
            }

            if (raceInfo.club !== undefined) {
                raceInfo.newClubId = existingClubs[raceInfo.club.id];
                raceInfo.clubOriginalId = raceInfo.club.id;
            }

            Object.assign(newRace, {
                gpx: raceInfo.race.gpx,
                winds_csv: raceInfo.race.wind,
                leg_winds_csv: raceInfo.race.legWind,
                results_csv: raceInfo.race.resultsData,
                club: raceInfo.newClubId,
                club_original_id: raceInfo.clubOriginalId,
            });

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

            if (!newPositions?.length) {
                throw new Error('No positions in race');
            }

            if (!newDorsals?.length) {
                throw new Error('No boats in race');
            }

            objectsToSave.EstelaRace = [newRace];
            objectsToSave.EstelaBuoy = raceInfo.race.buoys;
            objectsToSave.EstelaDorsal = newDorsals;
            objectsToSave.EstelaPlayer = newPlayers;
            objectsToSave.EstelaResult = newResults;
            objectsToSave.EstelaPosition = newPositions;

            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${currentRaceUrl}`
                );
                throw err;
            }
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, currentRaceUrl, err.toString());
        }
    }

    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
    page.close();
    browser.close();
    process.exit();
})();
