const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env'),
});

const AWS = require('aws-sdk');

const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
});

const uploadS3 = (params) =>
    new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            console.log('File uploaded successfully.');
            resolve(data);
        });
    });

const deleteObjectInS3 = (params) =>
    new Promise((resolve, reject) => {
        s3.deleteObject(params, function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            console.log('File deleted successfully.');
            resolve(data);
        });
    });

module.exports = {
    uploadS3,
    deleteObjectInS3,
};
