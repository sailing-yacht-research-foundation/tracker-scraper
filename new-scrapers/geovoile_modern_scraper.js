/* eslint-disable camelcase */
/* eslint-disable no-undef */
const { launchBrowser } = require('../utils/puppeteerLauncher');
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
    const regexp = /<a href="archives_20\d{2}.asp">/g;
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
    // For testing purpose, you can return some urls only.
    // Uncomment the returned urls to scrape hard coded urls.
    // The prepared testing urls have multiple legs. Most races have one leg only.
    // So if the url has 4 legs, it means scraper has to scrape 4 pages instead of 1 page.
    // return [
    //     'http://defi-azimut.geovoile.com/2021/', // 2 legs
    //     'http://lasolitaire.geovoile.com/2021/tracker/', // 4  legs
    //     'http://transquadra.geovoile.com/2021/', // 2  legs
    //     'https://www.theoceanrace.com/fr/europe/racing/tracker', // 3  legs
    //     'http://defi-azimut.geovoile.com/2020/', // 2 legs
    //     'http://lasolitaire.geovoile.com/2020/tracker/', // 4 legs
    //     'http://lessables-lesacores.geovoile.com/2020/', // 3 legs
    //     'http://minitransat.geovoile.com/2019/', // 2 legs
    //     'http://defi-azimut.geovoile.com/2019/', // 2 legs
    //     'http://transgascogne.geovoile.com/2019/', // 2 legs
    //     'http://lessables-horta.geovoile.com/2019/', // 2 legs
    //     'http://defi-atlantique.geovoile.com/2019/', // 2 legs
    //     'http://niceultimed.geovoile.com/2018/race/', // 3 legs, but we can only scrape 1 leg
    // ];
    const archivePages = await getArchiveUrls();
    console.log('Getting all race urls from list of archives.');
    let raceUrls = [];
    for (const url of archivePages) {
        console.log(`Parsing new archive page ${url}`);
        const browser = await launchBrowser();
        const page = await browser.newPage();
        await page.goto(url, {
            timeout: 30000,
            waitUntil: 'networkidle0',
        });

        const scrapedUrls = await page.evaluate(() => {
            const allNodes = document.querySelectorAll(
                '.divArchive > a:nth-child(1)'
            );
            const results = [];
            for (const node of allNodes) {
                results.push(node.href);
            }
            return results;
        });
        raceUrls.push(...scrapedUrls);
    }

    // ensure no duplicated url is scraped
    const set = new Set(raceUrls);
    raceUrls = Array.from(set);
    console.log(`Total race urls = ${raceUrls.length}`);
    console.log(raceUrls);

    return raceUrls;
}

function getRootUrl(url) {
    return url.split('?')[0];
}
/**
 * Scrap geovoile data for specific race
 * @param {string} url
 * @returns scraped data
 */
async function scrapePage(url) {
    const browser = await launchBrowser();
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

        let isRedirect = false;
        page.on('response', (response) => {
            if (response.status() >= 300 && response.status() <= 399) {
                // flag to indicate redirect;
                isRedirect = true;
            }
        });

        await page.goto(url, {
            timeout: 30000,
            waitUntil: 'networkidle0',
        });

        const redirectUrl = redirects.pop();
        if (
            redirectUrl &&
            redirectUrl !== url &&
            // For some page, for example https://gitana-team.geovoile.com/tropheejulesverne/2021/
            // The page is still redirect to https://gitana-team.geovoile.com/tropheejulesverne/2021/tracker/
            // But the status is still 200. Maybe there are some redirect in client instead of from server
            // And all the direct of geovoile contain traker
            (isRedirect || redirectUrl.indexOf('tracker') > 0)
        ) {
            // in case there is redirection, wait until redirection finished
            console.log(`Page is redirect from ${url} to ${redirectUrl}`);
            await page.goto(redirectUrl, {
                timeout: 30000,
                waitUntil: 'networkidle0',
            });
        }

        await page.waitForFunction(
            'tracker && tracker._boats && tracker._boats.length && tracker._reports && tracker._reports.length'
        );

        console.log('Getting race information');
        const race = await page.evaluate(() => {
            return {
                legNum: tracker.legNum || 1,
                numLegs: tracker.nbLegs || 1,
                statusRacing: tracker.statusRacing,
                extras: tracker.extras || null,
                runsById: tracker._runsById || null,
                startTime: tracker.timeline._timeStart,
                endTime: tracker.timeline._timeEnd,
                raceState: tracker._raceState,
                eventState: tracker._eventState,
                prerace: tracker._prerace,
                name: tracker.name || document.title,
                isGame: tracker.isGame,
                url: document.URL,
                scrapedUrl: '',
            };
        });
        race.id = uuidv4();
        race.original_id = uuidv4();
        race.scrapedUrl = url;

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

        const marks = await page.evaluate(() => {
            const allMarks = [];
            document.querySelectorAll('#poiLayer g[rel="0"] g').forEach((i) => {
                const transformVal = i.getAttribute('transform');
                const name = i.querySelector('text').textContent;
                const type = i.getAttribute('class').trim();
                const xy = transformVal.match(/\d+.\d+ \d+.\d+/g)[0].split(' ');
                const lon = sig.getLng(xy[0], xy[1]);
                const lat = sig.getLat(xy[0], xy[1]);
                allMarks.push({
                    name,
                    type,
                    lon,
                    lat,
                    xy,
                });
            });

            return allMarks;
        });

        for (const mark of marks) {
            mark.race_original_id = race.original_id;
            mark.race_id = race.id;
        }

        console.log(
            `Finished scraping ${race.name}, total boats = ${boats.length}, total reports = ${reports.length}, legNum = ${race.legNum}, numberOfLegs = ${race.numLegs}`
        );
        return {
            geovoileRace: race,
            boats,
            sig,
            source: SOURCE,
            redirectUrl,
            marks,
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

    let urls;
    try {
        urls = await getScrapingUrls();
    } catch (err) {
        console.log('Failed getting race urls', err);
        process.exit();
    }

    const processedUrls = new Set();
    const rootUrlMap = new Map();
    let processedCount = 0;
    let failedCount = 0;
    console.log(urls);
    while (urls.length) {
        const url = urls.shift();
        if (processedUrls.has(url)) {
            console.log(`This url = ${url} is processed, move to next one`);
            continue;
        }
        let existingUrls;
        try {
            existingUrls = await getExistingUrls(SOURCE);
        } catch (err) {
            console.log('Error getting existing urls', err);
            process.exit();
        }

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
            failedCount++;
            continue;
        }
        if (!result || !result.geovoileRace) {
            console.log(`Failed to scrap data  for url ${url}`);
            failedCount++;
            await registerFailed(
                url,
                result?.redirectUrl,
                `Failed to scrap data  for url ${url}`
            );
            continue;
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

        processedUrls.add(result.geovoileRace.url);
        processedUrls.add(result.geovoileRace.scrapedUrl);
        const { geovoileRace } = result;

        // In case the race has more than one leg.
        if (result.geovoileRace.numLegs > 1) {
            // The should process flag is used for page that can not be used the path parameter or query parameter approach
            // For example: http://niceultimed.geovoile.com/2018/race/ has 3 legs
            // The default leg is 3. And we can't go to leg 1 or leg2 by query parameter
            // For example:  http://niceultimed.geovoile.com/2018/race/?leg=1
            // So if we use the query parameter approach, we will scrape leg=03 three times, which lead to duplicated data.
            // So we use the map to check if the leg num is exist, then we ignore this race.
            const rootUrl = getRootUrl(result.geovoileRace.url);
            console.log(`rootUrl = ${rootUrl}`);
            if (rootUrlMap.has(rootUrl)) {
                const rootUrlLegNum = rootUrlMap.get(rootUrl);
                // ignore the race
                if (rootUrlLegNum === result.geovoileRace.legNum) {
                    console.log(
                        `The url = ${result.geovoileRace.url} is ignored`
                    );
                    continue;
                }
            } else {
                rootUrlMap.set(rootUrl, result.geovoileRace.legNum);
            }
            // The url contains the params path
            // For example:
            // https://tracker.theoceanrace.com/leg01/en/index.html => leg01
            // https://tracker.theoceanrace.com/leg02/en/index.html => leg02
            const regex = /leg0\d{1}/g;
            if (geovoileRace.url.match(regex)) {
                for (let i = 1; i <= result.geovoileRace.numLegs; i++) {
                    if (i === geovoileRace.legNum) {
                        continue;
                    }
                    const newUrl = geovoileRace.url.replace(regex, `leg0${i}`);

                    if (!processedUrls.has(newUrl)) {
                        console.log(
                            `This race has multiple legs, adding new url by replacing path parameter = ${newUrl}`
                        );
                        urls.unshift(newUrl);
                    }
                }
            } else if (url.indexOf('?leg=') === -1) {
                // Normally, we will query the leg by query parameter.
                // http://lasolitaire.geovoile.com/2021/tracker/ has 4 legs
                // So we will have 4 urls
                // http://lasolitaire.geovoile.com/2021/tracker/?leg=1
                // http://lasolitaire.geovoile.com/2021/tracker/?leg=2
                // http://lasolitaire.geovoile.com/2021/tracker/?leg=3
                // http://lasolitaire.geovoile.com/2021/tracker/?leg=4
                for (let i = 1; i <= result.geovoileRace.numLegs; i++) {
                    if (i === geovoileRace.legNum) {
                        continue;
                    }
                    const newUrl = `${geovoileRace.scrapedUrl}?leg=${i}`;
                    if (!processedUrls.has(newUrl)) {
                        console.log(
                            `This race has multiple legs, adding new url by replacing query parameter = ${newUrl}`
                        );
                        urls.unshift(newUrl);
                    }
                }
            }
        }
        processedCount++;

        if (result.geovoileRace.url !== result.geovoileRace.scrapedUrl) {
            console.log(
                `Scraped url ${result.geovoileRace.scrapedUrl}, actual url: ${result.geovoileRace.url} `
            );
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

    console.log(
        `Finished scraping geovoile modern. Total processed urls = ${processedCount}, failed urls = ${failedCount}`
    );
    process.exit(0);
})();
