const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env'),
});

const AWS = require('aws-sdk');
const { SearchSchema } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');

const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.GEOJSON_S3_BUCKET;

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

exports.uploadGeoJsonToS3 = async function (
    raceId,
    geojson,
    source,
    transaction
) {
    const obj = await SearchSchema.TrackLookup.findOne({
        where: {
            id: raceId,
        },
    });
    if (obj) {
        return;
    }

    const lookupId = uuidv4();
    const file = lookupId + '.geojson';
    // Uploading files to the bucket
    await uploadS3({
        Bucket: BUCKET_NAME,
        Key: file, // File name you want to save as in S3
        Body: geojson,
    });
    await SearchSchema.TrackLookup.create(
        {
            id: raceId,
            source,
            s3_id: lookupId,
        },
        { transaction }
    );
    // console.log({ geojsonFile: file });
    return file;
};
