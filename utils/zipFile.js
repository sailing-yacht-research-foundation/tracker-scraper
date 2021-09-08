const fs = require('fs');
const { createGzip } = require('zlib');

const doGzipObject = (data, destination) => {
    return new Promise((resolve, reject) => {
        const errorHandler = (err) => {
            reject(err);
        };
        const inputPath = destination.substr(0, destination.length - 3); // remove .gz ext to get raw file name
        try {
            const dataArr = bulkStringifyJson(data);
            fs.writeFileSync(inputPath, dataArr.splice(0, 1)[0]);
            while (dataArr.length > 0) {
                fs.appendFileSync(inputPath, dataArr.splice(0, 1)[0]);
            }
            console.log('Succesfully created json file', inputPath);
            const transformStream = fs.createReadStream(inputPath);
            const outputStream = fs.createWriteStream(destination);
            const gzip = createGzip();
            const stream = transformStream.pipe(gzip).pipe(outputStream);
            stream.on('finish', () => {
                fs.unlinkSync(inputPath);
                console.log('Succesfully created gzip file', destination);
                resolve();
            });
            transformStream.on('error', errorHandler);
            outputStream.on('error', errorHandler);
            stream.on('error', errorHandler);
        } catch (err) {
            console.log('Failed bulkStringifyJson');
            fs.unlinkSync(inputPath);
            reject(err);
        }
    });
};

// Stringify for large data to avoid RangeError on string. The function returns an array to prevent the string rangeError
const bulkStringifyJson = (data) => {
    const out = [];
    out.push('{');
    Object.keys(data).forEach((key) => {
        out.push(`${JSON.stringify(key)}:`);
        if (data[key] instanceof Array) {
            const arr = [...data[key]]; // clone the array since splice mutates array
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
    doGzipObject,
    bulkStringifyJson,
};
