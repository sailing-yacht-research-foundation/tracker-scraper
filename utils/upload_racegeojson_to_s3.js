const { SearchSchema } = require('../tracker-schema/schema.js');
const { uuidv4 } = require('../tracker-schema/utils.js');

const AWS = require('aws-sdk');
const ID = 'AKIAU4MUOS3JD7YG3BXW';
const SECRET = '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';

const BUCKET_NAME = 'syrftracksgeojson-dev';

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
    // Uploading files to the bucket
    await uploadS3({
        Bucket: BUCKET_NAME,
        Key: lookupId + '.geojson', // File name you want to save as in S3
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
};
