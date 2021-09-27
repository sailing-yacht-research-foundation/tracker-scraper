const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const xml2json = require('xml2json');

const {
    launchBrowser,
    closePageAndBrowser,
} = require('../utils/puppeteerLauncher');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingData,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');

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
        const existingRaceIds = {};
        successRaceIds.forEach((id) => {
            existingRaceIds[id] = true;
        });
        const prevMaxRaceId = successRaceIds.reduce(
            (a, b) => Math.max(a, b),
            0
        );
        const MAX_RACE_INDEX = prevMaxRaceId + 1000 || 1000;

        browser = await launchBrowser();
        page = await browser.newPage();

        let idx = 1;
        while (idx <= MAX_RACE_INDEX) {
            console.log(`Scraping race index ${idx} of ${MAX_RACE_INDEX}`);
            if (existingRaceIds[idx]) {
                idx++;
                console.log('Already saved this so skipping.');
                continue;
            }

            const pageUrl = `https://www.yacht-bot.com/races/${idx}`;
            const existingUrl = existingData.find((u) => u.url === pageUrl);
            if (existingUrl) {
                idx++;
                if (existingUrl.status === 'failed') {
                    console.log(
                        `Existing failed url ${pageUrl}. Check database table for error message.`
                    );
                } else {
                    console.log(`Already visited url ${pageUrl}`);
                }
                continue;
            }

            try {
                const token = await openRacePageAndGetAccessToken(
                    page,
                    pageUrl
                );
                if (token) {
                    const raceSaveObj = {
                        id: uuidv4(),
                        original_id: idx,
                    };

                    const session = await fetchSession(idx, token);
                    const startTime = session.data.session.start_time;
                    const endTime = session.data.session.end_time;

                    if (
                        startTime > new Date().getTime() ||
                        endTime > new Date().getTime()
                    ) {
                        console.log('Future race so skipping.');
                        idx++;
                        continue;
                    }

                    session.data.session.url = pageUrl;

                    let logs = await fetchLogs(idx, token);

                    const metadatas = [];
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
                        } else if (firstKey === 'metadata') {
                            metadatas.push(data.metadata);
                        }
                    });

                    metadatas.forEach((m) => {
                        if (
                            m.manual_wind !== null &&
                            m.manual_wind !== undefined
                        ) {
                            session.data.session.manual_wind = JSON.stringify(
                                m.manual_wind
                            );
                        } else if (
                            m.course_direction !== null &&
                            m.course_direction !== undefined
                        ) {
                            session.data.session.course_direction =
                                m.course_direction;
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
                    objectData.forEach((o) => {
                        const serialNumber = oidsToSerial[o.object_id];
                        o.object_content.serial_number = serialNumber;
                        o.object_content.uuid = uuidv4();

                        if (
                            serialNumber !== null &&
                            serialNumber !== undefined
                        ) {
                            positionRequestData =
                                positionRequestData +
                                '&serial_numbers%5B%5D=' +
                                serialNumber;
                            serials[serialNumber] = o.object_content;
                        } else {
                            serials[o.object_id] = o.object_content;
                        }
                    });

                    positionRequestData =
                        positionRequestData +
                        '&_method=GET&restore_archives=true&access_token=' +
                        token;
                    const positionsRequest = await fetchPositions(
                        positionRequestData,
                        token
                    );

                    const { boats, buoys, positions } = parsePositionsData(
                        positionsRequest,
                        serials,
                        oidsToSerial,
                        raceSaveObj
                    );

                    // NOW SAVE session.data.session , things, and maybe serials?
                    session.data.session.name = decodeURI(
                        session.data.session.name
                    );

                    raceSaveObj.name = session.data.session.name;
                    raceSaveObj.start_time = startTime;
                    raceSaveObj.end_time = endTime;
                    raceSaveObj.url = pageUrl;
                    raceSaveObj.manual_wind = session.data.session.manual_wind;
                    raceSaveObj.course_direction =
                        session.data.session.course_direction;

                    const races = [raceSaveObj];

                    const objectsToSave = {
                        YachtBotRace: races,
                        YachtBotYacht: boats,
                        YachtBotBuoy: buoys,
                        YachtBotPosition: positions,
                    };

                    console.log('Uploading data file');
                    await createAndSendTempJsonFile(objectsToSave);
                    console.log('Finished sending file');
                } else {
                    console.log('Should not continue so going to next race.');
                }
            } catch (err) {
                console.log(err);
                await registerFailedUrl(SOURCE, pageUrl, err.toString());
            }
            idx++;
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
    console.log('about to go to page ' + pageUrl);
    await page.goto(pageUrl);
    console.log('went to page ' + pageUrl);
    const errorShown = await page
        .waitForFunction(
            "document.querySelector('#overlay > div.error-state').style.display === 'block'",
            {
                timeout: 2000,
            }
        )
        .then(() => true)
        .catch(() => false);
    if (errorShown) {
        return null;
    }

    const token = await page.evaluate(() => window.oauth_access_token);
    return token;
};

const fetchSession = async (idx, token) => {
    return axios.get(
        'https://www.igtimi.com/api/v1/sessions/' +
            idx +
            '?access_token=' +
            token
    );
};

const fetchLogs = async (idx, token) => {
    const logsRequest = await axios.get(
        'https://www.igtimi.com/api/v1/sessions/' +
            idx +
            '/logs?access_token=' +
            token
    );

    return JSON.parse(xml2json.toJson(logsRequest.data)).session.content.log
        .log_entry;
};

const fetchPositions = async (positionRequestData, token) => {
    return axios({
        method: 'post',
        url: 'https://www.igtimi.com/api/v1/resources/data',
        data:
            positionRequestData +
            '&_method=GET&restore_archives=true&access_token=' +
            token,
    });
};

const parsePositionsData = (
    positionsRequest,
    serials,
    oidsToSerial,
    raceSaveObj
) => {
    const boats = [];
    const buoys = [];

    const positions = [];

    const positionSerials = Object.keys(positionsRequest.data);

    // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals

    positionSerials.forEach((s) => {
        const data = positionsRequest.data[s];

        const gps = data['1'];

        const device = serials[s];

        const gpsQuality = data['2'];
        const gpsQualitySatCount = data['3'];
        const gpsQualityHDOP = data['4'];
        const gpsAltitude = data['5'];
        const cog = data['6'];
        const hdgm = data['7'];
        const hdg = data['8'];
        const sog = data['9'];
        const stw = data['10'];
        const awa = data['11'];
        const aws = data['12'];
        const antHrm = data['13'];
        const quaternion = data['17'];
        const acceleration = data['18'];
        const gyro = data['19'];
        const force = data['20'];
        const torque = data['21'];
        const twa = data['22'];
        const tws = data['23'];
        const pressure = data['24'];

        let metas = JSON.stringify({
            gpsQuality,
            gpsQualitySatCount,
            gpsQualityHDOP,
            gpsAltitude,
            cog,
            hdgm,
            hdg,
            sog,
            stw,
            awa,
            aws,
            antHrm,
            quaternion,
            acceleration,
            gyro,
            force,
            torque,
            twa,
            tws,
            pressure,
        });

        if (metas === '{}') {
            metas = null;
        }
        const currentPositions = [];

        if (gps !== undefined && gps !== null) {
            const lons = gps['1'];
            const lats = gps['2'];
            const gpsTimes = gps.t;

            for (const gpsTimeIndex in gpsTimes) {
                const t = gpsTimes[gpsTimeIndex];
                const lon = lons[gpsTimeIndex];
                const lat = lats[gpsTimeIndex];
                let quality = null;
                if (
                    gpsQuality !== undefined &&
                    gpsQuality.length >= gpsTimeIndex
                ) {
                    quality = gpsQuality;
                }
                currentPositions.push({
                    id: uuidv4(),
                    race: raceSaveObj.id,
                    race_original_id: raceSaveObj.original_id,
                    time: t,
                    lon: lon,
                    lat: lat,
                    gps_quality: quality,
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
                metas,
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
            const race = raceSaveObj.id;
            const raceOriginalId = raceSaveObj.original_id;
            const name = device.name;
            const boatNumber = device.boat_number;
            const crew = JSON.stringify(device.crew);
            const country = JSON.stringify(device.country);

            const b = {
                id,
                original_id: originalId,
                race,
                race_original_id: raceOriginalId,
                name,
                boat_number:
                    typeof boatNumber === 'object'
                        ? String(boatNumber)
                        : boatNumber,
                crew,
                country,
                metas,
            };
            currentPositions.forEach((p) => {
                p.yacht_or_buoy = 'yacht';
                p.yacht = id;
                p.yacht_original_id = originalId;
                positions.push(p);
            });

            boats.push(b);
        } else {
            console.log('Unknown device type.');
            console.log(device);
            console.log(positions[0]);
            console.log(metas);
        }
    });

    return { boats, buoys, positions };
};

// const fetchWindows = async (startTime, token) => {
//     const currentTime = new Date().getTime();
//     const windowsRequest = await axios.get(
//         'https://www.igtimi.com/api/v1/devices/data_access_windows?start_time=' +
//             startTime +
//             '&end_time=' +
//             currentTime +
//             '&types%5B%5D=read&types%5B%5D=modify&access_token=' +
//             token
//     );
//     const windows = windowsRequest.data.data_access_windows;

//     const groups = {};
//     windows.forEach((w) => {
//         const accessWindow = w.data_access_window;
//         const key = accessWindow.recipient.group.id;
//         if (groups[key] === null || groups[key] === undefined) {
//             groups[key] = [accessWindow.device_serial_number];
//         } else {
//             groups[key].push(accessWindow.device_serial_number);
//         }
//     });
//     return { windows, groups };
// };
