const expect = require('chai').expect;
const { bulkStringifyJson } = require('../utils/zipFile');

describe('When calling bulkStringifyJson', () => {
    it('should return a json of strings that can be joined with same result as a JSON.stringify', async () => {
        const testJson = {
            a: 1,
            b: 2,
            c: 3,
            d: [11, 22, 33, 44],
            e: { f: 10, g: 20 },
        };
        const result = bulkStringifyJson(testJson);
        expect(result.join('')).to.equal(JSON.stringify(testJson));
    });
});
