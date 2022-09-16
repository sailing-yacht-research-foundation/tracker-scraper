const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env'),
});
const crypto = require('crypto');
const temp = require('temp').track();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { doGzipObject } = require('./zipFile');
const { sleep } = require('./utils');

const SEND_DELAY_IN_MS = 2000; // delay to not overwhelm the raw-data-server. Useful for unfinished races
const RAW_DATA_SERVER_API = process.env.RAW_DATA_SERVER_API;

const generateRawDataServerSecret = () => {
    const todayDate = new Date();
    // Example format: 2021 Jun 21, Mon
    const formattedTodayDate = `${todayDate.getUTCFullYear()} ${todayDate.toLocaleString(
        'en-US',
        {
            month: 'short',
            timeZone: 'UTC',
        }
    )} ${todayDate.getUTCDate()}, ${todayDate.toLocaleString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
    })}`;
    return generateSecret(formattedTodayDate);
};

const generateSecret = function (plainText) {
    const secretSalt = process.env.SIMPLE_AUTH_SALT;
    return crypto
        .createHash('md5')
        .update(`${secretSalt}:${plainText}:${secretSalt}`)
        .digest('hex');
};

const createAndSendTempJsonFile = async (data, url = 'api/v1/upload-file') => {
    console.log('Creating temp file');
    const dirPath = temp.mkdirSync('scraper_raw_data');
    const filePath = path.join(
        dirPath,
        `scraper_raw_data_${new Date().getTime()}.json.gz`
    );
    await doGzipObject(data, filePath);

    console.log('Sending temp file');
    const formData = new FormData();
    const zipReadStream = fs.createReadStream(filePath);
    formData.append('raw_data', zipReadStream);
    const secret = generateRawDataServerSecret();
    try {
        await axios.post(`${RAW_DATA_SERVER_API}/${url}`, formData, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                authorization: secret,
                'content-type': `multipart/form-data; boundary=${formData._boundary}`,
            },
        });
        console.log('Finished creating and sending temp file', filePath);
        await sleep(SEND_DELAY_IN_MS);
    } catch (err) {
        console.log('Failed sending zip file', err);
    } finally {
        zipReadStream.destroy();
    }
};

const getExistingData = async (tracker) => {
    const secret = generateRawDataServerSecret();
    const result = await axios.get(
        `${RAW_DATA_SERVER_API}/api/v1/scraped-url/${tracker}`,
        {
            headers: {
                authorization: secret,
            },
        }
    );
    return result.data?.urlList;
};

const getExistingUrls = async (tracker) => {
    const result = await getExistingData(tracker);
    return result?.map((i) => i.url) || [];
};

const registerFailedUrl = async (tracker, url, error) => {
    const secret = generateRawDataServerSecret();
    try {
        const result = await axios.post(
            `${RAW_DATA_SERVER_API}/api/v1/register-failed-url`,
            {
                tracker,
                url,
                error,
            },
            {
                headers: {
                    authorization: secret,
                },
            }
        );
        return result.data?.success;
    } catch (err) {
        console.log('Failed registering failed url', err);
        return false;
    }
};

const getUnfinishedRaceData = async (tracker) => {
    const secret = generateRawDataServerSecret();
    const result = await axios.get(
        `${RAW_DATA_SERVER_API}/api/v1/get-unfinished-races/${tracker}`,
        {
            headers: {
                authorization: secret,
            },
        }
    );
    const raceData = {
        unfinishedRaceIdsMap: {},
        forceScrapeRacesMap: {},
    };
    if (result?.data) {
        for (const raceOrigId in result.data) {
            const race = result.data[raceOrigId];
            if (race.forceScrape) {
                raceData.forceScrapeRacesMap[raceOrigId] = race;
            } else {
                raceData.unfinishedRaceIdsMap[raceOrigId] = race.id;
            }
        }
    }
    return raceData;
};

const cleanUnfinishedRaces = async (tracker, originalId) => {
    const secret = generateRawDataServerSecret();
    try {
        const result = await axios.post(
            `${RAW_DATA_SERVER_API}/api/v1/clean-unfinished-races/${tracker}`,
            {
                excludedOrigIds: originalId,
            },
            {
                headers: {
                    authorization: secret,
                },
            }
        );
        return result.data;
    } catch (err) {
        console.log(
            `Failed cleaning unfinished races for tracker ${tracker}`,
            err
        );
        return null;
    }
};

module.exports = {
    RAW_DATA_SERVER_API,
    generateRawDataServerSecret,
    createAndSendTempJsonFile,
    getExistingData,
    getExistingUrls,
    registerFailedUrl,
    getUnfinishedRaceData,
    cleanUnfinishedRaces,
};
