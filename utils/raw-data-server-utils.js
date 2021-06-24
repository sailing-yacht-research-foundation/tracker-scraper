const crypto = require('crypto');
const temp = require('temp').track();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

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

const createAndSendTempJsonFile = async (api, data) => {
    console.log('Creating temp file');
    const dirPath = temp.mkdirSync('scraper_raw_data');
    const inputPath = path.join(
        dirPath,
        `scraper_raw_data_${new Date().getTime()}.json`
    );
    fs.writeFileSync(inputPath, JSON.stringify(data));

    console.log('Sending temp file');
    const formData = new FormData();
    formData.append('raw_data', fs.createReadStream(inputPath));

    const secret = generateRawDataServerSecret();
    await axios.post(api, formData, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            authorization: secret,
            'content-type': `multipart/form-data; boundary=${formData._boundary}`,
        },
    });
    console.log('Finished creating and sending temp file');
    temp.cleanup();
};

module.exports = {
    generateRawDataServerSecret,
    createAndSendTempJsonFile,
};
