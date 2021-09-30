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
const { v4: uuidv4 } = require('uuid');
const SOURCE = 'geovoile';

const MORDERN_SCRAPER_MIN_YEAR = 2016;
async function getPageResponse(url) {
    const pageResponse = await axios.get(url);
    return pageResponse.data.toString();
}
/**
 * Get archive urls for scrapper
 * Important note: the curr
 * @returns
 */
async function getArchiveUrls() {
    const rootUrl = 'http://www.geovoile.com/';
    const pageData = await getPageResponse(rootUrl);
    const regexp = /<a href="archives_20\d{2}.asp" id="aMenuArchives">/g;
    const matches = pageData.match(regexp);
    if (!matches.length) {
        throw new Error(
            `Geovoile modern scraper can not find any archive urls from ${rootUrl} please recheck the regex pattern for this page`
        );
    }
    // Sample match url ''<a href="archives_2017.asp" id="aMenuArchives">'
    // Split by ' ' will give return a list like that
    // ['<a', 'href="archives_2017.asp"', 'id="aMenuArchives">'] so we take the index 1
    // After that we split by ", and take the index 1 also.
    const firstArchivePageUrl = matches[0].split(' ')[1].split('"')[1];
    const rootArchiveUrl = `${rootUrl}/${firstArchivePageUrl}`;
    const archivePageData = await getPageResponse(rootArchiveUrl);
    const regexpArchivePage = /<a href="archives_20\d{2}.asp">/g;

    const archivePageMatches = archivePageData.match(regexpArchivePage);
    const results = new Set();

    results.add(rootArchiveUrl);
    for (const url of archivePageMatches) {
        const archiveUrl = url.split(' ')[1].split('"')[1];
        const yearRegex = /20\d{2}/g;
        const yearMatch = archiveUrl.match(yearRegex);
        if (+yearMatch >= MORDERN_SCRAPER_MIN_YEAR) {
            results.add(`${rootUrl}${archiveUrl}`);
        }
    }

    console.log('List of scraping urls:');
    console.log(Array.from(results));
    return Array.from(results);
}
/**
 * Get urls that need to be scraped
 * @returns string[]
 */
async function getScrapingUrls() {
    // For testing purpose, you can return some urls only
    // return ['http://defi-azimut.geovoile.com/2021/'];
    const archivePages = await getArchiveUrls();
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

    console.log('Race urls');
    console.log(raceUrls);
    return raceUrls;
}

/**
 * Scrap geovoile data for specific race
 * @param {string} url
 * @returns scraped data
 */
async function scrapePage(url) {
    const browser = await puppeteer.launch({
        args: [],
    });
    const page = await browser.newPage();
    try {
        console.log(`Start scraping ${url}`);

        const redirects = [];
        const client = await page.target().createCDPSession();
        await client.send('Network.enable');
        await client.on('Network.requestWillBeSent', (e) => {
            if (e.type !== 'Document') {
                return;
            }
            redirects.push(e.documentURL);
        });

        await page.goto(url, {
            timeout: 30000,
            waitUntil: 'networkidle0',
        });

        const redirectUrl = redirects.pop();
        // in case there is redirection, wait until redirection finished
        if (redirectUrl && redirectUrl !== url) {
            console.log(`page is redirect from ${url} to ${redirectUrl}`);
            await page.goto(redirectUrl, {
                timeout: 30000,
                waitUntil: 'networkidle0',
            });
        }

        await page.waitForFunction(
            'tracker && tracker._boats && tracker._boats.length && tracker._reports && tracker._reports.length'
        );

        console.log('Getting boat information');
        const boats = await page.evaluate(() => {
            return tracker._boats.map((boat) => {
                return {
                    original_id: boat.id,
                    name: boat.name,
                    short_name: boat.shortName,
                    sailors: (boat.sailors || []).map((sailor) => {
                        return {
                            first_name: sailor.fname,
                            last_name: sailor.lname,
                            nationality: sailor.nationality,
                            short_name: sailor.shortName,
                        };
                    }),
                    arrival: boat.arrival,
                    hullColor: boat.hullColor,
                    hullColors: boat.hullColors,
                    hulls: boat.hulls,
                    earthScale: boat._earthScale,
                    track: {
                        locations: boat.track.locations.map((position) => {
                            const timecode = position.timecode;
                            const lat = position.lat;
                            const lon = position.lng;
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
                                lon,
                                heading,
                                command,
                                crossing_antimeridian: crossingAntimeridian,
                                swapXSign,
                                d_lat: dLat,
                                d_lon: dLng,
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
        const raceId = uuidv4();
        const race = await page.evaluate(() => {
            return {
                original_id: null,
                legNum: tracker.legNum || 1,
                numLegs: tracker.nbLegs || 1,
                statusRacing: tracker.statusRacing,
                extras: tracker.extras || null,
                runsById: tracker._runsById || null,
                startTime: tracker.timeline._timeStart,
                endTime: tracker.timeline._timeEnd,
                challenger: tracker._challenger,
                raceState: tracker._raceState,
                eventState: tracker._eventState,
                prerace: tracker._prerace,
                name: tracker.name || document.title,
                isGame: tracker.isGame,
                url: document.URL,
            };
        });

        race.original_id = raceId;
        race.scrapedUrl = url;
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
            `Finished scraping ${race.name}, total boats = ${boats.length}, total reports = ${reports.length}`
        );
        return {
            geovoileRace: race,
            boats,
            sig,
            source: SOURCE,
            redirectUrl,
        };
    } catch (err) {
        console.log(err);
        console.log('Failed Url ' + url);
    } finally {
        browser.close();
    }
}
async function registerFailed(url, redirectUrl, err) {
    await registerFailedUrl(SOURCE, url, err);
    if (redirectUrl && redirectUrl !== url) {
        // In case scraped url is different from actual url due to redirection.
        // We should save 2 urls to ensure the check is
        console.log(`register failed url for redirect url also ${redirectUrl}`);
        await registerFailedUrl(SOURCE, redirectUrl, err);
    }
}
(async () => {
    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    const urls = await getScrapingUrls();

    for (const url of urls) {
        let existingUrls;
        try {
            existingUrls = await getExistingUrls(SOURCE);
        } catch (err) {
            console.log('Error getting existing urls', err);
            process.exit();
        }

        console.log('existingUrls');
        console.log(existingUrls);
        if (existingUrls.includes(url)) {
            console.log(`url: ${url} is scraped, ignore`);
            continue;
        }

        let result;
        try {
            result = await scrapePage(url);
        } catch (e) {
            console.log(`Failed to scrap data  for url ${url}`);
            await registerFailed(url, null, e.toString());
        }
        if (!result || !result.geovoileRace) {
            console.log(`Failed to scrap data  for url ${url}`);
            await registerFailed(
                url,
                result?.redirectUrl,
                `Failed to scrap data  for url ${url}`
            );
            continue;
        }

        if (result.geovoileRace.url !== result.geovoileRace.scrapedUrl) {
            console.log(
                `Scraped url ${result.geovoileRace.scrapedUrl}, actual url: ${result.geovoileRace.url} `
            );
        }

        if (
            !result ||
            (result.geovoileRace.eventState !== 'FINISH' &&
                result.geovoileRace.raceState !== 'FINISH')
        ) {
            console.log(
                `Race ${url} is not finished, current state = ${result.geovoileRace.raceState}, event state = ${result.geovoileRace.eventState}, temporary ignore this race`
            );
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
            await registerFailed(url, result?.redirectUrl, err.toString());
            continue;
        }
    }
    console.log('Finished scraping geovoile modern');
    process.exit(0);
})();
