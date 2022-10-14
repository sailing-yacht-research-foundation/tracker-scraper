const AdmZip = require('adm-zip');
const { launchBrowser } = require('../utils/puppeteerLauncher');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingData,
    registerFailedUrl,
    getUnfinishedRaceData,
    cleanUnfinishedRaces,
} = require('../utils/raw-data-server-utils');

const METASAIL_EVENT_URL = 'https://www.metasail.it';
const NO_RACES_WARNING = 'No race still available';
const SOURCE = 'metasail';

(async () => {
    // These are only used for limited scraping. If these are set, the urls are filtered
    const eventUrlsToScrape = []; // Example https://www.metasail.it/past/343
    const raceOriginalIdsToScrape = []; // use race original id (as string) since url contains the token which changes. Example '16999'

    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    let browser, page, eventUrls;
    let existingRaceOrigIds;
    try {
        const existingData = await getExistingData(SOURCE);
        // Need to use original id instead of URL since metasail url contains token that changes in each visit
        existingRaceOrigIds = existingData.reduce((acc, d) => {
            if (d.original_id) {
                acc.push(d.original_id);
            } else {
                // Failed records does not have original id so need to parse url to get original_id
                const { idgara } = _parseRaceUrl(d.url);
                if (idgara) {
                    acc.push(idgara);
                }
            }
            return acc;
        }, []);
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
        eventUrls = await getEventUrls(page);
        if (eventUrlsToScrape.length) {
            eventUrls = eventUrls.filter((url) =>
                eventUrlsToScrape.includes(url)
            );
        }
    } catch (err) {
        console.log('Failed getting event urls', err);
        process.exit();
    }
    for (const urlIndex in eventUrls) {
        const eventUrl = eventUrls[urlIndex];
        console.log(
            `Scraping event index ${urlIndex} of ${
                eventUrls.length - 1
            } with url ${eventUrl}`
        );
        const eventOrigId = eventUrl.split('/').pop();
        try {
            const validEvent = await isValidEvent(eventUrl, page);
            if (!validEvent) {
                console.log('No races associated with this event. Skipping.');
                continue;
            }

            const {
                eventName,
                eventOfficialWebsite,
                eventCategoryText,
                eventDates,
            } = await getPageData(page);

            const { startDate, endDate } = getEventStartAndEndDate(eventDates);

            const currentEvent = {
                id: uuidv4(),
                original_id: eventOrigId,
                name: eventName,
                external_website: eventOfficialWebsite,
                url: eventUrl,
                category_text: eventCategoryText,
                start: startDate.getTime() / 1000,
                end: endDate.getTime() / 1000,
            };

            const raceUrls = await getRaceUrls(page);
            if (raceUrls.length === 0) {
                console.log('No race associated to event. Skipping.');
                continue;
            }

            for (const currentRaceUrl of raceUrls) {
                console.log(`Scraping race url ${currentRaceUrl}`);

                const { idgara: raceOrigId } = _parseRaceUrl(currentRaceUrl);
                if (existingRaceOrigIds.includes(raceOrigId)) {
                    console.log(
                        `Race with idgara ${raceOrigId} already exist in database. Skipping.`
                    );
                    continue;
                }
                // If raceOriginalIdsToScrape is set and raceOrigId is not in the list skip it
                if (
                    raceOriginalIdsToScrape.length &&
                    !raceOriginalIdsToScrape.includes(raceOrigId)
                ) {
                    console.log(
                        'Race is not on the list to be scraped. Skipping.'
                    );
                    continue;
                }
                try {
                    const {
                        unknownIdentifier,
                        idgara,
                        raceData,
                        redirectedUrl,
                    } = await fetchRaceData(currentRaceUrl, browser);

                    const forceScrapeRaceData = forceScrapeRacesMap[idgara];
                    const newRaceId =
                        forceScrapeRaceData?.id ||
                        unfinishedRaceIdsMap[idgara] ||
                        uuidv4();

                    const newRace = {
                        id: newRaceId,
                        original_id: idgara,
                        name: raceData.raceName,
                        start: raceData.start,
                        stop: raceData.stop,
                        url: redirectedUrl,
                        event: currentEvent.id,
                        event_original_id: currentEvent.original_id,
                    };
                    if (raceData.buoyPasses) {
                        newRace.passings = JSON.stringify(raceData.buoyPasses);
                    }

                    const {
                        newGates,
                        newBuoys,
                        buoyIds,
                    } = buildGateAndBuoyData(newRaceId, raceData, idgara);

                    const objectsToSave = {
                        MetasailEvent: [currentEvent],
                        MetasailRace: [newRace],
                        MetasailBuoy: newBuoys,
                        MetasailGate: newGates,
                    };

                    const now = Date.now();
                    if (forceScrapeRaceData) {
                        if (raceData.start > now) {
                            // if start time is in the future set it today
                            raceData.start = now;
                            raceData.stop = now;
                        } else {
                            raceData.stop =
                                forceScrapeRaceData.approx_end_time_ms;
                        }
                    }
                    if (
                        raceData.start > now ||
                        raceData.stop > now ||
                        raceData.stop < 0 ||
                        typeof raceData.stop === 'undefined'
                    ) {
                        // live race has negative stop time
                        console.log(
                            'Unfinished race. Only scraping race info and buoys'
                        );
                        scrapedUnfinishedOrigIds.push(idgara);
                    } else {
                        const { boatOldIdsToNewIds, newBoats } = buildBoatData(
                            newRaceId,
                            raceData,
                            idgara,
                            buoyIds
                        );
                        console.log('Fetching positions');
                        const allPointsForId = await fetchRaceAllPoints(
                            currentEvent,
                            newRaceId,
                            buoyIds,
                            boatOldIdsToNewIds,
                            unknownIdentifier,
                            idgara
                        );
                        console.log('Fetching race stats');
                        const stats = await fetchRaceStats(
                            currentRaceUrl,
                            unknownIdentifier,
                            idgara
                        );
                        newRace.stats = stats;

                        if (!newBoats.length) {
                            throw new Error('No boats in race');
                        }

                        const newPositions = Object.values(
                            allPointsForId
                        ).flat();
                        if (!newPositions.length) {
                            throw new Error('No positions in race');
                        }
                        Object.assign(objectsToSave, {
                            MetasailBoat: newBoats,
                            MetasailPosition: newPositions,
                        });
                    }

                    try {
                        await createAndSendTempJsonFile(objectsToSave);
                    } catch (err) {
                        console.log(
                            `Failed creating and sending temp json file race original id ${idgara}`,
                            err
                        );
                        throw err;
                    }
                    console.log('Finished scraping race.');
                } catch (err) {
                    console.log('Error in scraping race', err);
                    await registerFailedUrl(
                        SOURCE,
                        currentRaceUrl,
                        err.toString()
                    );
                }
            } // End of visiting all races
            console.log('Finished visiting all race urls.');
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, eventUrl, err.toString());
        }
    }

    console.log('Finished scraping all events.');
    await cleanUnfinishedRaces(SOURCE, scrapedUnfinishedOrigIds);
    page.close();
    browser.close();
    process.exit();
})();

/**
 * Check if event page has race list by detecting message "No race still available" is absent on page.
 * If the message is visible on page that mean the event is not valid or event doesn't have races.
 */
async function isValidEvent(eventUrl, page) {
    await page.goto(eventUrl, {
        timeout: 0,
        waitUntil: 'networkidle0',
    });

    const noRaceText = await page.evaluate(() => {
        return document.querySelector(
            '#evento-single > div > div:nth-child(2) > div.col-sm-8 > div > h4'
        ).textContent;
    });
    return noRaceText !== NO_RACES_WARNING;
}

async function getPageData(page) {
    const eventName = await page.evaluate(() => {
        return document.querySelector(
            '#evento-single > div > div:nth-child(1) > div > div > h5'
        ).textContent;
    });
    const eventOfficialWebsite = await page.evaluate(() => {
        const officialWebsiteDom = document.querySelector(
            '#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-site > a'
        );
        return officialWebsiteDom?.href || null;
    });
    const eventCategoryText = await page.evaluate(() => {
        return document.querySelector(
            '#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-classi > div > dl'
        ).textContent;
    });
    const eventDates = await page.evaluate(() => {
        return document.querySelector(
            '#evento-single > div > div:nth-child(1) > div > div > p'
        ).textContent;
    });

    return {
        eventName,
        eventOfficialWebsite,
        eventCategoryText,
        eventDates,
    };
}

function getEventStartAndEndDate(eventDates) {
    const first = eventDates.split(' - ')[0];
    const second = eventDates.split(' - ')[1];

    const startMonth = first.split(' ')[0];
    let startDay = first
        .split(' ')[1]
        .replace('th', '')
        .replace('rd', '')
        .replace('nd', '')
        .replace('st', '');
    let endMonth = startMonth;
    let endDay = second
        .split(' ')[0]
        .replace('th', '')
        .replace('rd', '')
        .replace('nd', '')
        .replace('st', '');
    let year = second.split(' ')[1];
    if (second.split(' ').length > 2) {
        endMonth = second.split(' ')[0];
        endDay = second
            .split(' ')[1]
            .replace('th', '')
            .replace('rd', '')
            .replace('nd', '')
            .replace('st', '');
        year = second.split(' ')[2];
    }
    const months = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        June: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12',
    };

    const singleDigits = {
        1: '01',
        2: '02',
        3: '03',
        4: '04',
        5: '05',
        6: '06',
        7: '07',
        8: '08',
        9: '09',
    };

    if (parseInt(startDay < 10)) {
        startDay = singleDigits[startDay];
    }
    if (parseInt(endDay < 10)) {
        endDay = singleDigits[endDay];
    }

    const startDate = new Date(
        year + '-' + months[startMonth] + '-' + startDay
    );
    const endDate = new Date(year + '-' + months[endMonth] + '-' + endDay);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    return { startDate, endDate };
}

async function getRaceUrls(page) {
    const raceUrls = await page.evaluate(() => {
        const urls = [];
        const refs = document.querySelectorAll(
            '#evento-single > div > div:nth-child(2) > div.col-sm-8 > div > ul > li > div > p > a'
        );

        for (const index in refs) {
            const ref = refs[index];
            if (ref.href !== undefined) {
                urls.push(ref.href);
            }
        }
        return urls;
    });
    return raceUrls;
}

async function fetchRaceData(currentRaceUrl, browser) {
    const racePage = await browser.newPage();
    try {
        console.log(`Going to page ${currentRaceUrl}`);
        await racePage.goto(currentRaceUrl, {
            timeout: 680000,
            waitUntil: 'networkidle0',
        });
        const redirectedUrl = racePage.url();
        console.log('Evaluating page');
        await racePage.evaluate(() => {
            /* eslint-disable no-undef */
            const storage = localStorage;
            if (storage.getItem('emailAdded') === null) {
                storage.setItem('emailAdded', true);
                location.reload();
            }
            /* eslint-enable no-undef */
        });

        const { unknownIdentifier, idgara } = _parseRaceUrl(redirectedUrl);

        /* eslint-disable no-undef */
        await racePage.waitForFunction(
            () => 'dtLStart' in window && 'garaInfo' in window,
            {
                timeout: 60000,
            }
        );
        const isUnfinished = await racePage.evaluate(
            () =>
                dtLStart > Date.now() ||
                typeof dtLStop === 'undefined' ||
                dtLStop > Date.now() ||
                dtLStop < 0
        );
        /* eslint-enable no-undef */

        // If unfinished do not need to wait for boat positions
        if (!isUnfinished) {
            const MAX_RETRY_COUNT = 3;
            let waitError;
            for (let ctr = 0; ctr < MAX_RETRY_COUNT; ctr++) {
                waitError = null;
                try {
                    console.log('Waiting for garaList');
                    await racePage.waitForFunction(() => 'garaList' in window, {
                        timeout: 60000,
                    });
                    console.log(
                        'Waiting for garaList and boaList positions to load'
                    );
                    await racePage.waitForFunction(
                        'Object.keys(garaList).length > 0',
                        {
                            timeout: 300000,
                        }
                    );

                    // This is for loading the boaList[0].gpsData1, buoy's initial lat lon. 5s is just an estimate, 1s seems not enough since some buoy info are missed
                    await racePage.waitForNetworkIdle({
                        idleTime: 5000,
                    });
                    break;
                } catch (err) {
                    console.log(`Timeout occured. Retry count ${ctr + 1}`, err);
                    if (ctr < MAX_RETRY_COUNT - 1) {
                        await racePage.reload();
                    } else {
                        waitError = err;
                    }
                }
            }
            if (waitError) {
                throw waitError;
            }
        }

        const raceData = await racePage.evaluate(
            () => {
                /* eslint-disable no-undef */
                let bL;
                let bLP;
                if (boaList !== null && boaList !== undefined) {
                    bL = boaList;
                }

                if (
                    boaListFuoriPercorso !== null &&
                    boaListFuoriPercorso !== undefined
                ) {
                    bLP = boaListFuoriPercorso;
                }

                let titleDom = document.querySelector(
                    '#menu-title-gara > span'
                );
                if (!titleDom) {
                    // Live races has different dom id
                    titleDom = document.querySelector(
                        '#menu-title-gara-Online > span'
                    );
                }
                const name = titleDom?.textContent;
                return {
                    buoyList: bL,
                    buoyListOffCourse: bLP,
                    buoyPasses:
                        typeof arrayPassaggiBoe === 'undefined'
                            ? undefined
                            : arrayPassaggiBoe, // live races does not declare this var
                    raceInfo: garaInfo,
                    raceList: garaList,
                    racePathList: racePathList,
                    start: dtLStart,
                    stop: dtLStop,
                    raceName: name,
                };
                /* eslint-enable no-undef */
            },
            {
                timeout: 680000,
            }
        );
        return {
            unknownIdentifier,
            idgara,
            raceData,
            redirectedUrl,
        };
    } finally {
        racePage.close();
    }
}

function buildGateAndBuoyData(newRaceId, raceData, idgara) {
    const newGates = [];
    const newBuoys = [];
    const buoyIds = {};
    []
        .concat(raceData.buoyList, raceData.buoyListOffCourse)
        .forEach((b, index) => {
            if (!b?.gpsData1 && !b?.gpsData2) return;
            const createMark = (boa, boaIndex) => ({
                id: uuidv4(),
                race: newRaceId,
                race_original_id: idgara,
                original_id: boa[`seriale${boaIndex}`],
                name: boa[`boa${boaIndex}`],
                initials: boa[`sigla${boaIndex}`],
                description: boa[`descrizione${boaIndex}`],
                lat:
                    boa[`lat${boaIndex}`] ||
                    boa[`gpsData${boaIndex}`]?.Latitudine,
                lon:
                    boa[`lng${boaIndex}`] ||
                    boa[`gpsData${boaIndex}`]?.Longitudine,
                lat_m:
                    boa[`latM${boaIndex}`] ||
                    boa[`gpsData${boaIndex}`]?.LatitudineMetri,
                lon_m:
                    boa[`lngM${boaIndex}`] ||
                    boa[`gpsData${boaIndex}`]?.LongitudineMetri,
                order: index + 1,
            });
            if (b.gpsData1 && !b.gpsData2) {
                if (
                    !newBuoys.some(
                        (existingBuoy) =>
                            existingBuoy.original_id === b.seriale1
                    )
                ) {
                    const newMark = createMark(b, 1);
                    buoyIds[b.seriale1] = newMark.id;
                    newBuoys.push(newMark);
                }
            } else if (b.gpsData2 && !b.gpsData1) {
                if (
                    !newBuoys.some(
                        (existingBuoy) =>
                            existingBuoy.original_id === b.seriale2
                    )
                ) {
                    const newMark = createMark(b, 2);
                    buoyIds[b.seriale2] = newMark.id;
                    newBuoys.push(newMark);
                }
            } else {
                let newMark1 = newBuoys.find(
                    (existingBuoy) => existingBuoy.original_id === b.seriale1
                );
                let newMark2 = newBuoys.find(
                    (existingBuoy) => existingBuoy.original_id === b.seriale2
                );
                if (!newMark1) {
                    newMark1 = createMark(b, 1);
                    newBuoys.push(newMark1);
                    buoyIds[b.seriale1] = newMark1.id;
                }
                if (!newMark2) {
                    newMark2 = createMark(b, 2);
                    newBuoys.push(newMark2);
                    buoyIds[b.seriale2] = newMark2.id;
                }

                const newGate = {
                    id: uuidv4(),
                    race: newRaceId,
                    race_original_id: idgara,
                    buoy_1: newMark1.id,
                    buoy_1_original_id: newMark1.original_id,
                    buoy_2: newMark2.id,
                    buoy_2_original_id: newMark2.original_id,
                    order: index + 1,
                };

                newGates.push(newGate);
            }
        });
    return {
        newRaceId,
        newGates,
        newBuoys,
        buoyIds,
    };
}

function buildBoatData(newRaceId, raceData, idgara, buoyIds) {
    const boatOldIdsToNewIds = {};
    const newBoats = [];
    const boatIds = Object.keys(raceData.raceInfo);
    boatIds.forEach((serial) => {
        const b = raceData.raceInfo[serial];
        const newBoat = {
            id: uuidv4(),
            original_id: b.idBarca,
            race: newRaceId,
            race_original_id: idgara,
            serial: serial,
            name: b.sigla,
            description: b.descrizione,
            sail_number: b.descrizione2,
            is_dummy: b.is_dummy,
        };
        if (
            buoyIds[newBoat.serial] === undefined ||
            buoyIds[newBoat.serial] === null
        ) {
            boatOldIdsToNewIds[newBoat.serial] = newBoat.id;
            newBoats.push(newBoat);
        }
    });
    return {
        boatOldIdsToNewIds,
        newBoats,
    };
}

async function fetchRaceZipData(unknownIdentifier, idgara) {
    const zipFileResult = await axios({
        method: 'get',
        url: `https://app.metasail.it/(S(${unknownIdentifier}))/race_${idgara}.zip`,
        responseType: 'arraybuffer',
    });

    const zip = new AdmZip(zipFileResult.data);

    const zipEntries = zip.getEntries();

    let zipTextRows = [];
    for (let i = 0; i < zipEntries.length; i++) {
        const file = zip.readAsText(zipEntries[i]);
        zipTextRows = zipTextRows.concat(file.split('\\'));
    }
    return zipTextRows;
}

async function fetchRaceAllPoints(
    currentEvent,
    newRaceId,
    buoyIds,
    boatOldIdsToNewIds,
    unknownIdentifier,
    idgara
) {
    const zipTextRows = await fetchRaceZipData(unknownIdentifier, idgara);
    const allPointsForId = {};
    for (const rowIndex in zipTextRows) {
        const row = zipTextRows[rowIndex];
        const values = row.split('|');

        const id = values[0];
        if (allPointsForId[id] === undefined) {
            allPointsForId[id] = [];
        }

        const allPoints = allPointsForId[id];

        const time = values[1];
        const lon = values[2];
        const lat = values[3];

        const unknown1 = values[4];

        const unknown2 = values[5];

        const unknown14 = values[6];
        const speed = values[7];

        const unknown3 = values[8];
        const unknown4 = values[9];
        const unknown5 = values[10];
        const unknown6 = values[11];
        const unknown7 = values[12];
        const unknown8 = values[13];
        const unknown9 = values[14];
        const unknown10 = values[15];
        const unknown11 = values[16];
        const unknown12 = values[17];
        const unknown13 = values[18];

        let boatId = '';
        let boatOriginalId = '';
        let buoyId = '';
        let buoyOriginalId = '';
        if (buoyIds[id] !== undefined && buoyIds[id] !== null) {
            buoyId = buoyIds[id];
            buoyOriginalId = id;
            boatId = null;
            boatOriginalId = null;
        } else {
            buoyId = null;
            buoyOriginalId = null;
            boatId = boatOldIdsToNewIds[id];
            boatOriginalId = id;
        }

        const container = {
            id: uuidv4(),
            race: newRaceId,
            race_original_id: idgara,
            event: currentEvent.id,
            event_original_id: currentEvent.original_id,
            boat: boatId,
            boat_original_id: boatOriginalId,
            buoy: buoyId,
            buoy_original_id: buoyOriginalId,
            time: time,
            lon: lon,
            lat: lat,
            speed: speed,
            lon_metri_const: unknown1,
            lat_metri_const: unknown2,
            rank: unknown3,
            distance_to_first_boat: unknown4,
            wind_state: unknown5,
            wind_direction: unknown6,
            slope_rank_line: unknown7,
            end_time_difference: unknown8,
            begin_date_time: unknown9,
            crt_race_segment: unknown10,
            apply_wind: unknown11,
            vmc: unknown12,
            vmg: unknown13,
            orientation: unknown14,
        };

        if (
            time !== null &&
            lon !== null &&
            lat !== null &&
            time !== '' &&
            time !== undefined
        ) {
            allPoints.push(container);
        }
    }
    return allPointsForId;
}

async function fetchRaceStats(currentRaceUrl, unknownIdentifier, idgara) {
    const statsRequest = await axios({
        method: 'post',
        url: `https://app.metasail.it/(S(${unknownIdentifier}))/MetaSailWS.asmx/getStatistiche`,
        data: `idGara=${idgara}`,
        headers: {
            Host: 'app.metasail.it',
            Referer: currentRaceUrl,
            Accept: '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Origin: 'https://app.metasail.it',
            Pragma: 'no-cache',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
        },
    });

    return statsRequest.data;
}

async function getEventUrls(page) {
    console.log('Getting event urls');
    await page.goto(METASAIL_EVENT_URL, {
        timeout: 0,
        waitUntil: 'networkidle0',
    });
    const eventUrls = await page.evaluate(() => {
        const pastEvents = [
            ...document.querySelectorAll('#past-events > div > ul > ul > li>a'),
        ];
        const liveEvents = [
            ...document.querySelectorAll('#live-events > div > ul > li>a'),
        ];
        const nextEvents = [
            ...document.querySelectorAll('#next-events > div > ul > li>a'),
        ];

        return [...pastEvents, ...liveEvents, ...nextEvents].reduce(
            (acc, e) => {
                const url = e.getAttribute('href');
                if (url) {
                    acc.push(url);
                }
                return acc;
            },
            []
        );
    });
    return eventUrls;
}

function _parseRaceUrl(url) {
    const urlData = url.match(
        /https:\/\/app\.metasail\.it\/\(S\((.*)\)\)\/(.*)\.aspx\?idgara=([0-9]+)&token=(.*)/
    );
    const unknownIdentifier = urlData?.[1];
    let idgara = urlData?.[3];
    if (!idgara) {
        // metasail url only contains token if it is redirected
        const urlData2 = url.match(
            /https:\/\/app\.metasail\.it\/(.*)\.aspx\?idgara=([0-9]+)&token=(.*)/
        );
        idgara = urlData2?.[2];
    }
    return {
        unknownIdentifier,
        idgara,
    };
}
