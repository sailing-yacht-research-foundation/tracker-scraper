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

const RAW_DATA_SERVER_API = process.env.RAW_DATA_SERVER_API;

const generateRawDataServerSecret = () => {
    const todayDate = new Date();
    // Example format: 2021 Jun 21, Mon
    const formattedTodayDate = `${todayDate.getUTCFullYear()} ${todayDate.toLocaleString(
        'en-US',
        { month: 'short' }
    )} ${todayDate.getUTCDate()}, ${todayDate.toLocaleString('en-US', {
        weekday: 'short',
    })}`;
    return generateSecret(formattedTodayDate);
};

const generateSecret = function (plainText) {
    return crypto.createHash('md5').update(plainText).digest('hex');
};

const createAndSendTempJsonFile = async (data) => {
    console.log('Creating temp file');
    const dirPath = temp.mkdirSync('scraper_raw_data');
    const filePath = path.join(
        dirPath,
        `scraper_raw_data_${new Date().getTime()}.json.gz`
    );
    await doGzipObject(data, filePath);

    console.log('Sending temp file');
    const formData = new FormData();
    formData.append('raw_data', fs.createReadStream(filePath));

    const secret = generateRawDataServerSecret();
    await axios.post(`${RAW_DATA_SERVER_API}/api/v1/upload-file`, formData, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            authorization: secret,
            'content-type': `multipart/form-data; boundary=${formData._boundary}`,
        },
    });
    console.log('Finished creating and sending temp file', filePath);
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

const checkExistingUrl = async (tracker, url) => {
    const secret = generateRawDataServerSecret();
    const result = await axios.post(
        `${RAW_DATA_SERVER_API}/api/v1/check-url`,
        {
            tracker,
            url,
        },
        {
            headers: {
                authorization: secret,
            },
        }
    );
    if (result.data?.error) {
        console.log(`Existing failed url ${url}. Check database for error`);
    }
    return result.data?.scraped;
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

module.exports = {
    RAW_DATA_SERVER_API,
    generateRawDataServerSecret,
    createAndSendTempJsonFile,
    getExistingData,
    getExistingUrls,
    checkExistingUrl,
    registerFailedUrl,
};
