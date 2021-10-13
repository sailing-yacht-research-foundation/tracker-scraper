const sinon = require('sinon');
const expect = require('chai').expect;
const axios = require('axios');
const {
    RAW_DATA_SERVER_API,
    generateRawDataServerSecret,
    createAndSendTempJsonFile,
} = require('../utils/raw-data-server-utils');

describe('Testing raw-data-server-utils', () => {
    let fakeDate;
    beforeEach(() => {
        const dateString = '2021-01-22';
        const d = new Date(dateString);
        fakeDate = sinon.useFakeTimers(d);
    });
    afterEach(() => {
        fakeDate.restore();
    });
    describe('When calling generateRawDataServerSecret', () => {
        it('should return token as md5 hash of current date with format: yyyy MMM d, ddd', () => {
            const expectedHash = '251e8735a7d03a7f111b0f6091cbad51'; // hash of date 2021-01-22
            const token = generateRawDataServerSecret();
            expect(token).to.equal(expectedHash);
        });
    });

    describe('When calling createAndSendTempJsonFile', () => {
        it('should send a post request with the raw-data-server api', async () => {
            const postSpy = sinon.spy(axios, 'post');
            const testJson = { a: 1, b: 2, c: 3 };
            await createAndSendTempJsonFile(testJson);
            expect(
                postSpy.calledOnceWith(
                    `${RAW_DATA_SERVER_API}/api/v1/upload-file`
                )
            ).to.equal(true);
            postSpy.restore();
        });
    });
});
