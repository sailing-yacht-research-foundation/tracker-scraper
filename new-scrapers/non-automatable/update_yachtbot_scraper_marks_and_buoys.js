/**
 * Update Yacht bot scraper marks and bouy
 * The initial yachtbot_scraper.js missing information related to static marks and bouy original_object_id
 * They are vital information to create points, lines on SYRF map.
 * This script is created to run one time only to fix marks and bouy information.
 * It will send information to {{raw-data-server-url}}/api/v1/yacht-bot.
 * Raw data sever will update the data
 */
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const xml2json = require('xml2json');

const {
    launchBrowser,
    closePageAndBrowser,
} = require('../../utils/puppeteerLauncher');
const {
    RAW_DATA_SERVER_API,
    getExistingData,
    registerFailedUrl,
    createAndSendTempJsonFile,
} = require('../../utils/raw-data-server-utils');

const SOURCE = 'yachtbot';

(async () => {
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        return -1;
    }

    let browser;
    let page;
    try {
        const existingData = await getExistingData(SOURCE);
        const successRaceIds = existingData
            .map((u) => u.original_id)
            .filter((id) => !!id);

        if (!successRaceIds.length) {
            console.log(
                'There is no success rate in the system, bot is stopped'
            );
            return;
        }

        browser = await launchBrowser();
        page = await browser.newPage();

        for (const idx of successRaceIds) {
            console.log(`Scraping race index ${idx}`);

            const pageUrl = `https://www.yacht-bot.com/races/${idx}`;
            try {
                const token = await openRacePageAndGetAccessToken(
                    page,
                    pageUrl
                );
                if (!token) {
                    console.log(
                        'Token not found. Should not continue so going to next race.'
                    );
                    continue;
                }

                const raceSaveObj = {
                    id: uuidv4(),
                    original_id: idx,
                };

                const session = await fetchSession(idx, token);
                if (!session) {
                    console.log(
                        'Session not found. Should not continue so going to next race.'
                    );
                    continue;
                }

                const startTime = session.data.session.start_time;
                const endTime = session.data.session.end_time;

                session.data.session.url = pageUrl;

                let logs = await fetchLogs(idx, token);

                const objects = [];
                const objectData = [];
                // Devices have object ids and serial numbers.
                const devices = [];
                if (logs && !(logs instanceof Array)) {
                    logs = [logs];
                }
                logs.forEach((entry) => {
                    const data = entry.data;
                    const firstKey = Object.keys(data)[0];
                    if (firstKey === 'object_data') {
                        objectData.push(data.object_data);
                    } else if (firstKey === 'object') {
                        objects.push(data.object);
                    } else if (firstKey === 'device') {
                        devices.push(data.device);
                    }
                });

                const oidsToSerial = {};
                devices.forEach((d) => {
                    oidsToSerial[d.object_id] = d.serial_number;
                });

                // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals
                let positionRequestData =
                    'start_time=' +
                    startTime +
                    '&end_time=' +
                    endTime +
                    '&types%5B1%5D=0&types%5B2%5D=0&types%5B3%5D=0&types%5B4%5D=0&types%5B5%5D=0&types%5B6%5D=0&types%5B7%5D=0&types%5B8%5D=0&types%5B9%5D=0&types%5B10%5D=0&types%5B11%5D=0&types%5B12%5D=0&types%5B13%5D=0&types%5B14%5D=0&types%5B15%5D=0&types%5B16%5D=0&types%5B17%5D=0&types%5B18%5D=0&types%5B19%5D=0&types%5B20%5D=0&types%5B21%5D=0&types%5B22%5D=0&types%5B23%5D=0&types%5B24%5D=0&types%5B25%5D=0&types%5B26%5D=0&types%5B27%5D=0&types%5B28%5D=0&types%5B29%5D=0&types%5B30%5D=0&types%5B31%5D=0&types%5B32%5D=0&types%5B33%5D=0&types%5B34%5D=0&types%5B35%5D=0&types%5B36%5D=0&types%5B37%5D=0&types%5B38%5D=0&types%5B39%5D=0&types%5B40%5D=0&types%5B41%5D=0&types%5B42%5D=0&types%5B43%5D=0&types%5B44%5D=0&types%5B45%5D=0&types%5B46%5D=0&types%5B47%5D=0&types%5B48%5D=0&types%5B49%5D=0&types%5B50%5D=0&types%5B51%5D=0&types%5B52%5D=0&types%5B53%5D=0&types%5B54%5D=0&types%5B55%5D=0&types%5B56%5D=0&types%5B57%5D=0&types%5B23%5D=0&restore_archives=true';
                const serials = {};
                const serialNumbers = [];

                objectData.forEach((o) => {
                    const serialNumber = oidsToSerial[o.object_id];
                    o.object_content.serial_number = serialNumber;
                    o.object_content.uuid = uuidv4();

                    if (
                        serialNumber !== null &&
                        serialNumber !== undefined &&
                        !serialNumbers.includes(serialNumber)
                    ) {
                        serialNumbers.push(serialNumber);
                        serials[serialNumber] = {
                            object_id: o.object_id,
                            ...o.object_content,
                        };
                    } else {
                        serials[o.object_id] = o.object_content;
                    }
                });

                positionRequestData += `&_method=GET&access_token=${token}`;
                const posResponseData = await fetchPositions(
                    positionRequestData,
                    serialNumbers
                );

                const { boats, buoys, marks } = parsePositionsData(
                    posResponseData,
                    serials,
                    oidsToSerial,
                    raceSaveObj
                );

                const races = [raceSaveObj];

                const objectsToSave = {
                    YachtBotRace: races,
                    YachtBotBuoy: buoys,
                    YachtBotMark: marks,
                    YachtBotYacht: boats,
                };

                console.log('createAndSendTempJsonFile to /api/v1/yacht-bot');
                await createAndSendTempJsonFile(
                    objectsToSave,
                    'api/v1/yacht-bot'
                );
                console.log('Finished sending Json Data');
            } catch (err) {
                console.log(err);
                await registerFailedUrl(SOURCE, pageUrl, err.toString());
            }
        }
    } catch (err) {
        console.log('yachtbot scraper error', err);
        return -1;
    } finally {
        console.log('Finished scraping all races.');
        await closePageAndBrowser({ page, browser });
    }
})();

const openRacePageAndGetAccessToken = async (page, pageUrl) => {
    try {
        console.log('about to go to page ' + pageUrl);
        await page.goto(pageUrl);
        console.log('went to page ' + pageUrl);
        await page.waitForFunction('window.oauth_access_token', {
            timeout: 2000,
        });
        const token = await page.evaluate(() => window.oauth_access_token);
        return token;
    } catch (e) {}
    return null;
};

const fetchSession = async (idx, token) => {
    const url = `https://www.igtimi.com/api/v1/sessions/${idx}?access_token=${token}`;
    return new Promise((resolve, reject) => {
        axios
            .get(url)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                if (error.response) {
                    console.log(
                        `the url ${url} has error with status = ${error.response.status}, statusText = ${error.response.statusText}`
                    );
                    console.log(error.response.data);
                }
                console.log(resolve(null));
            });
    });
};

const fetchLogs = async (idx, token) => {
    const logsRequest = await axios.get(
        `https://www.igtimi.com/api/v1/sessions/${idx}/logs?access_token=${token}`
    );

    return JSON.parse(xml2json.toJson(logsRequest.data)).session.content.log
        .log_entry;
};

const fetchPositions = async (positionRequestData, serialNumbers) => {
    const posResponseData = {};
    for (const serialNumber of serialNumbers) {
        const posRequestParam = `${positionRequestData}&serial_numbers%5B%5D=${serialNumber}`;
        const positionsRequest = await axios({
            method: 'post',
            url: 'https://www.igtimi.com/api/v1/resources/data',
            data: posRequestParam,
        });
        Object.assign(posResponseData, positionsRequest.data);
    }
    return posResponseData;
};

const parsePositionsData = (
    posResponseData,
    serials,
    oidsToSerial,
    raceSaveObj
) => {
    const boats = [];
    const buoys = [];

    const positions = [];

    const positionSerials = Object.keys(posResponseData);

    // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals

    positionSerials.forEach((s) => {
        const data = posResponseData[s];

        const gps = data['1'];

        const device = serials[s];
        const currentPositions = [];

        if (gps !== undefined && gps !== null) {
            const lons = gps['1'];
            const lats = gps['2'];
            const gpsTimes = gps.t;

            for (const gpsTimeIndex in gpsTimes) {
                const t = gpsTimes[gpsTimeIndex];
                const lon = lons[gpsTimeIndex];
                const lat = lats[gpsTimeIndex];

                currentPositions.push({
                    id: uuidv4(),
                    race: raceSaveObj.id,
                    race_original_id: raceSaveObj.original_id,
                    time: t,
                    lon: lon,
                    lat: lat,
                    yacht_original_id: null,
                    yacht: null,
                    buoy: null,
                    buoy_original_id: null,
                    yacht_or_buoy: null,
                });
            }
        }
        if (device && (device.type === 'buoy' || device.type === 'wind')) {
            const id = device.uuid;
            const originalId = s;
            const race = raceSaveObj.id;
            const raceOriginalId = raceSaveObj.original_id;
            const name = device.name;
            const buoyType = device.buoy_type;

            let connectedBuoy = null;
            let connectedBuoyOriginalId = null;

            if (
                device.connected_buoy !== null &&
                device.connected_buoy !== undefined &&
                Object.keys(device.connected_buoy).length !== 0
            ) {
                if (
                    oidsToSerial[device.connected_buoy] === null ||
                    oidsToSerial[device.connected_buoy] === undefined
                ) {
                    const content = serials[device.connected_buoy];
                    const cb = {
                        id: uuidv4(),
                        original_id: content.name,
                        race: race,
                        race_original_id: raceOriginalId,
                        name: content.name,
                        buoy_type: content.buoy_type,
                        connected_buoy: id,
                        connected_buoy_original_id: originalId,
                        metas: null,
                        original_object_id: content.object_id,
                    };
                    buoys.push(cb);
                    connectedBuoyOriginalId = cb.original_id;
                    connectedBuoy = cb.id;
                } else {
                    connectedBuoyOriginalId =
                        oidsToSerial[device.connected_buoy];
                    connectedBuoy = serials[connectedBuoyOriginalId].uuid;
                }
            }

            const bo = {
                id,
                original_id: originalId,
                race,
                race_original_id: raceOriginalId,
                name,
                buoy_type: buoyType,
                connected_buoy: connectedBuoy,
                connected_buoy_original_id: connectedBuoyOriginalId,
                original_object_id: serials[originalId].object_id,
            };
            currentPositions.forEach((p) => {
                p.yacht_or_buoy = device.type;
                p.buoy = id;
                p.buoy_original_id = originalId;

                positions.push(p);
            });

            buoys.push(bo);
        } else if (device && device.type === 'yacht') {
            const id = device.uuid;
            const originalId = s;
            const raceOriginalId = raceSaveObj.original_id;

            const b = {
                id,
                original_id: originalId,
                race_original_id: raceOriginalId,
                original_object_id: serials[originalId].object_id,
            };

            boats.push(b);
        }
    });

    const marks = [];
    // static buoy
    for (const key of Object.keys(serials)) {
        if (serials[key].type !== 'buoy' || !serials[key].positions) {
            continue;
        }
        const isAvailable = buoys.find((t) => t.original_id === key);
        if (isAvailable) {
            continue;
        }

        if (typeof serials[key].connected_buoy !== 'string') {
            delete serials[key].connected_buoy;
        }

        const connectedBuoyOriginalId = serials[key].connected_buoy || null;
        const connectedBuoyId = serials[key].connected_buoy
            ? serials[serials[key].connected_buoy]?.uuid
            : null;
        const positions = serials[key].positions;
        const lat = positions?.position?.latitude;
        const lon = positions?.position?.longitude;
        marks.push({
            original_id: key,
            ...serials[key],
            id: serials[key].uuid,
            connected_buoy_original_id: connectedBuoyOriginalId,
            connected_buoy: connectedBuoyId,
            lat,
            lon,
            race: raceSaveObj.id,
            race_original_id: raceSaveObj.original_id,
        });
    }
    return { boats, buoys, marks, positions };
};
