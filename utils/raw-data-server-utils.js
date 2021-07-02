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
    try {
        fs.writeFileSync(inputPath, JSON.stringify(data));
    } catch (err) {
        console.log('Failed writing file. Trying bulkStringify');
        const dataArr = bulkStringifyJson(data);
        fs.writeFileSync(inputPath, dataArr.splice(0, 1)[0]);
        while (dataArr.length > 0) {
            fs.appendFileSync(inputPath, dataArr.splice(0, 1)[0]);
        }
        console.log('Finished bulk saving');
    }

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
    console.log('Finished creating and sending temp file', inputPath);
    temp.cleanup();
};

// Stringify for large data to avoid RangeError on string. The function returns an array to prevent the string rangeError
const bulkStringifyJson = (data) => {
    const out = [];
    out.push('{');
    Object.keys(data).forEach((key) => {
        out.push(`${JSON.stringify(key)}:`);
        if (data[key] instanceof Array) {
            const arr = data[key];
            let arrStr = [];
            while (arr.length > 0) {
                // Chunk stringify large arrays to prevent RangeError
                arrStr.push(JSON.stringify(arr.splice(0, 100000)));
            }
            arrStr = arrStr.map((str, index) => {
                if (index !== 0) {
                    str = str.substr(1, str.length); // exclude the open bracket
                }
                if (index !== arrStr.length - 1) {
                    str = str.substr(0, str.length - 1) + ','; // exclude the close bracket
                }
                return str;
            });
            if (arrStr.length === 0) {
                out.push('[]');
            } else {
                out.push(...arrStr);
            }
        } else {
            out.push(JSON.stringify(data[key]));
        }
        out.push(',');
    });
    out.pop(); // remove last comma
    out.push('}');
    return out;
};

module.exports = {
    generateRawDataServerSecret,
    createAndSendTempJsonFile,
};
