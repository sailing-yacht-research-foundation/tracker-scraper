const fs = require('fs');
const JSONStream = require('JSONStream');
const { createGzip } = require('zlib');

const doGzipObject = (data, destination) => {
    return new Promise((resolve, reject) => {
        const errorHandler = (err) => {
            reject(err);
        };
        try {
            const transformStream = JSONStream.stringifyObject('{', ',', '}');
            const outputStream = fs.createWriteStream(destination);
            const gzip = createGzip();
            const stream = transformStream.pipe(gzip).pipe(outputStream);
            Object.keys(data).forEach((key) => {
                transformStream.write([key, data[key]]);
            });
            transformStream.end();
            stream.on('finish', () => {
                resolve();
            });
            transformStream.on('error', errorHandler);
            outputStream.on('error', errorHandler);
            stream.on('error', errorHandler);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = doGzipObject;
