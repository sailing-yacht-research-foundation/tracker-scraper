/* eslint-disable camelcase */
/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const axios = require('axios');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');
/**
 * Get urls that need to be scrapped
 * @returns string[]
 */
async function getUrls() {
    // For testing purpose, you can return some urls only
    // return [
    //     'https://tracking2020.vendeeglobe.org/fr/?v=3',
    // ];
    const archivePages = [
        'http://www.geovoile.com/archives_2020.asp',
        'http://www.geovoile.com/archives_2019.asp',
        'http://www.geovoile.com/archives_2018.asp',
        'http://www.geovoile.com/archives_2017.asp',
        'http://www.geovoile.com/archives_2016.asp',
    ];
    console.log('Getting all race urls from list of archives.');
    const raceUrls = [];
    for (const url of archivePages) {
        console.log(`Parsing new archive page ${url}`);
        // eslint-disable-next-line no-useless-escape
        const regexp = /<a class=\"aBG aSuite\" href=\"https*:\/\/.*\" target=\"_blank">/g;
        // eslint-disable-next-line no-useless-escape
        const regexpUrl = /https*:\/\/.*\" target/g;
        const pageResponse = await axios.get(url);
        const pageData = pageResponse.data.toString();
        const matches = pageData.match(regexp);
        for (const matchIndex in matches) {
            const match = matches[matchIndex];
            const newUrl = match.match(regexpUrl)[0].split('" target').join('');
            raceUrls.push(newUrl);
        }
    }
    return raceUrls;
}

/**
 * Scrap geovoile data for specific race
 * @param {string} url
 * @returns scrapped data
 */
async function scrapPage(url) {
    const browser = await puppeteer.launch({
        args: [
            '--proxy-server=127.0.0.1:8888', // Or whatever the address is
        ],
    });
    const page = await browser.newPage();
    try {
        console.log(`Start scrapping ${url}`);
        await page.goto(url, {
            timeout: 30000,
            waitUntil: 'networkidle0',
        });

        await page.waitForFunction('tracker !== null && tracker !== undefined');

        console.log('Getting boat information');
        const boats = await page.evaluate(() => {
            return tracker._boats.map((boat) => {
                delete boat.track.firstLocation.next;
                delete boat.track.lastLocation.previous;
                return {
                    id: boat.id,
                    name: boat.name,
                    shortName: boat.shortName,
                    sailors: boat.sailors,
                    arrival: boat.arrival,
                    hullColor: boat.hullColor,
                    hullColors: boat.hullColors,
                    track: {
                        firstLocation: boat.track.firstLocation,
                        lastLocation: boat.track.lastLocation,
                        locations: boat.track.locations.map((position) => {
                            const timecode = position.timecode;
                            const lat = position.lat;
                            const lng = position.lng;
                            const heading = position.heading;
                            const command = position.command;
                            const crossingAntimeridian =
                                position.crossingAntimeridian;
                            const swapXSign = position.swapXSign;
                            const dLat = position._dLat;
                            const dLng = position._dLng;
                            const dt_a = position.dt_a;
                            const dt_b = position.dt_b;

                            return {
                                timecode,
                                lat,
                                lng,
                                heading,
                                command,
                                crossingAntimeridian,
                                swapXSign,
                                dLat,
                                dLng,
                                dt_a,
                                dt_b,
                            };
                        }),
                    },
                };
            });
        });

        console.log('Getting reports information');
        const reports = await page.evaluate(() => {
            return tracker._reports.map((t) => {
                const lines = t.lines.map((line) => {
                    delete line.report;
                    return { ...line };
                });
                return {
                    id: t.id,
                    offset: t.offset,
                    timecode: t.timecode,
                    lines,
                };
            });
        });

        console.log('Getting race information');
        const race = await page.evaluate(() => {
            return {
                legNum: tracker.legNum || 1,
                numLegs: tracker.nbLegs || 1,
                statusRacing: tracker.statusRacing,
                extras: tracker.extras || null,
                runsById: tracker._runsById || null,
                timecodeStart: tracker.timeline._timeStart,
                timecodeEnd: tracker.timeline._timeEnd,
                challenger: tracker._challenger,
                raceState: tracker._raceState,
                prerace: tracker._prerace,
                name: tracker.name || document.title,
                url,
            };
        });

        console.log('Getting sig data');

        const sig = await page.evaluate(() => {
            const mapBounds = sig.mapBounds;
            const mapArea = sig._mapArea;
            const route = sig.route;
            const rule = sig.rule;
            const sigBounds = sig.sigBounds;
            const projection = sig._projection;

            const raceAreas = sig._raceAreas;
            const raceGates = sig._raceGates;
            const shape = sig._shape;
            return {
                mapArea,
                mapBounds,
                route,
                rule,
                sigBounds,
                projection,
                raceAreas,
                raceGates,
                shape,
            };
        });

        console.log(
            `Finished scrapping ${race.name}, total boats = ${boats.length}, total reports = ${reports.length}`
        );
        return { race, reports, boats, sig };
    } catch (err) {
        console.log(err);
        console.log('Failed Url ' + url);
    } finally {
        browser.close();
    }
}

(async () => {
    const SOURCE = 'geovoile';
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }
    const urls = await getUrls();

    for (const url of urls) {
        let existingUrls;
        try {
            existingUrls = await getExistingUrls(SOURCE);
        } catch (err) {
            console.log('Error getting existing urls', err);
            process.exit();
        }

        if (existingUrls.includes(url)) {
            console.log(`url: ${url} is scrapped, ignore`);
            continue;
        }

        console.log(existingUrls);

        const result = await scrapPage(url);
        if (!result) {
            console.log(`Failed to scrap data  for url ${url}`);
            await registerFailedUrl(SOURCE, url, err.toString());
            continue;
        }
        try {
            console.log(`Sending json file to raw-data-server for url: ${url}`);
            await createAndSendTempJsonFile(result);
        } catch (err) {
            console.log(
                `Failed creating and sending temp json file for url ${url}`,
                err
            );
            await registerFailedUrl(SOURCE, url, err.toString());
            continue;
        }
    }
    console.log('Finished scraping geovoile modern');
    process.exit(0);
})();
