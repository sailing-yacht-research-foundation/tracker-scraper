const AdmZip = require('adm-zip');
const { launchBrowser } = require('../utils/puppeteerLauncher');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');

const METASAIL_EVENT_URL = 'https://www.metasail.it';
const NO_RACES_WARNING = 'No race still available';
const SOURCE = 'metasail';

(async () => {
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    let browser, page, eventUrls;
    let existingUrls;
    try {
        existingUrls = await getExistingUrls(SOURCE);
    } catch (err) {
        console.log('Error getting existing urls', err);
        process.exit();
    }

    try {
        browser = await launchBrowser();
        page = await browser.newPage();
        eventUrls = await getEventUrls(page);
    } catch (err) {
        console.log('Failed getting event urls', err);
        process.exit();
    }
    for (const urlIndex in eventUrls) {
        const eventUrl = eventUrls[urlIndex];
        console.log(
            `Scraping event index ${urlIndex} of ${eventUrls.length} with url ${eventUrl}`
        );
        const raceId = eventUrl.split('/').pop();
        if (existingUrls.includes(eventUrl)) {
            console.log(
                `Event url already exist in database ${eventUrl}. Skipping.`
            );
            continue;
        }
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
            const now = new Date().getTime();
            if (startDate.getTime() > now || endDate.getTime() > now) {
                console.log('Event starts or ends in future so skipping.');
                continue;
            }

            const currentEvent = {
                id: uuidv4(),
                original_id: raceId,
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
            const objectsToSave = {
                MetasailEvent: [currentEvent],
                MetasailRace: [],
                MetasailBoat: [],
                MetasailBuoy: [],
                MetasailGate: [],
                MetasailPosition: [],
            };
            for (const urlIndex in raceUrls) {
                const currentRaceUrl = raceUrls[urlIndex];
                if (existingUrls.includes(eventUrl)) {
                    console.log(
                        `Race url already exist in database ${currentRaceUrl}. Skipping.`
                    );
                    continue;
                }
                console.log(`Scraping race url ${currentRaceUrl}`);

                try {
                    const {
                        unknownIdentifier,
                        idgara,
                        raceData,
                        redirectedUrl,
                    } = await fetchRaceData(currentRaceUrl, browser);
                    const newRaceId = uuidv4();
                    const {
                        newGates,
                        newBuoys,
                        buoyIds,
                    } = buildGateAndBuoyData(newRaceId, raceData, idgara);
                    const { boatOldIdsToNewIds, newBoats } = buildBoatData(
                        newRaceId,
                        raceData,
                        idgara,
                        buoyIds
                    );
                    const allPointsForId = await fetchRaceAllPoints(
                        currentEvent,
                        newRaceId,
                        buoyIds,
                        boatOldIdsToNewIds,
                        unknownIdentifier,
                        idgara
                    );
                    const stats = await fetchRaceStats(
                        currentRaceUrl,
                        unknownIdentifier,
                        idgara
                    );

                    const newRace = {
                        id: newRaceId,
                        original_id: idgara,
                        name: raceData.raceName,
                        start: raceData.start,
                        stop: raceData.stop,
                        url: redirectedUrl,
                        stats: stats,
                        event: currentEvent.id,
                        event_original_id: currentEvent.original_id,
                        passings: JSON.stringify(raceData.buoyPasses),
                    };

                    objectsToSave.MetasailRace.push(newRace);
                    objectsToSave.MetasailBuoy = objectsToSave.MetasailBuoy.concat(
                        newBuoys
                    );
                    objectsToSave.MetasailBoat = objectsToSave.MetasailBoat.concat(
                        newBoats
                    );
                    objectsToSave.MetasailGate = objectsToSave.MetasailGate.concat(
                        newGates
                    );
                    objectsToSave.MetasailPosition = objectsToSave.MetasailPosition.concat(
                        Object.values(allPointsForId).flat()
                    );
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
            console.log('Saving data');
            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${currentEvent.url}`,
                    err
                );
                await registerFailedUrl(
                    SOURCE,
                    currentEvent.url,
                    err.toString()
                );
            }
        } catch (err) {
            console.log(err);
            await registerFailedUrl(SOURCE, eventUrl, err.toString());
        }
    }

    console.log('Finished scraping all events.');
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
        if (
            document.querySelector(
                '#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-site > a'
            ) !== null
        ) {
            return document.querySelector(
                '#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-site > a'
            ).href;
        } else {
            return null;
        }
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

        const unknownIdentifier = redirectedUrl.match(
            /http:\/\/app\.metasail\.it\/\(S\((.*)\)\)\/ViewRecordedRace(.*)\.aspx\?idgara=([0-9]+)&token=(.*)/
        )[1];
        const idgara = redirectedUrl.match(
            /http:\/\/app\.metasail\.it\/\(S\((.*)\)\)\/ViewRecordedRace(.*)\.aspx\?idgara=([0-9]+)&token=(.*)/
        )[3];

        await racePage.waitForFunction(() => 'garaList' in window, {
            timeout: 300000,
        });
        await racePage.waitForFunction('Object.keys(garaList).length > 0', {
            timeout: 300000,
        });

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

                const name = document.querySelector('#menu-title-gara > span')
                    .textContent;
                return {
                    buoyList: bL,
                    buoyListOffCourse: bLP,
                    buoyPasses: arrayPassaggiBoe,
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
    raceData.buoyList.forEach((b) => {
        if (b.seriale2 === '' || b.seriale2 === '-' || b.seriale2 === ' ') {
            const newMark = {
                id: uuidv4(),
                race: newRaceId,
                race_original_id: idgara,
                original_id: b.seriale1,
                name: b.boa1,
                initials: b.sigla1,
                description: b.descrizione1,
                lat: b.lat1,
                lon: b.lng1,
                lat_m: b.latM1,
                lon_m: b.lngM1,
            };

            buoyIds[b.seriale1] = newMark.id;
            newBuoys.push(newMark);
        } else {
            const newMark1 = {
                id: uuidv4(),
                race: newRaceId,
                race_original_id: idgara,
                original_id: b.seriale1,
                name: b.boa1,
                initials: b.sigla1,
                description: b.descrizione1,
                lat: b.lat1,
                lon: b.lng1,
                lat_m: b.latM1,
                lon_m: b.lngM1,
            };

            const newMark2 = {
                id: uuidv4(),
                race: newRaceId,
                race_original_id: idgara,
                original_id: b.seriale2,
                name: b.boa2,
                initials: b.sigla2,
                description: b.descrizione2,
                lat: b.lat2,
                lon: b.lng2,
                lat_m: b.latM2,
                lon_m: b.lngM2,
            };
            newBuoys.push(newMark1);
            newBuoys.push(newMark2);
            buoyIds[b.seriale1] = newMark1.id;
            buoyIds[b.seriale2] = newMark2.id;

            const newGate = {
                id: uuidv4(),
                race: newRaceId,
                race_original_id: idgara,
                buoy_1: newMark1.id,
                buoy_1_original_id: newMark1.original_id,
                buoy_2: newMark2.id,
                buoy_2_original_id: newMark2.original_id,
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
        url: `http://app.metasail.it/(S(${unknownIdentifier}))/race_${idgara}.zip`,
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
        url: `http://app.metasail.it/(S(${unknownIdentifier}))/MetaSailWS.asmx/getStatistiche`,
        data: `idGara=${idgara}`,
        headers: {
            Host: 'app.metasail.it',
            Referer: currentRaceUrl,
            Accept: '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Origin: 'http://app.metasail.it',
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
        return [
            ...document.querySelectorAll('#past-events > div > ul > ul > li>a'),
        ]
            .map((e) => e.getAttribute('href'))
            .filter((url) => url);
    });
    return eventUrls;
}
