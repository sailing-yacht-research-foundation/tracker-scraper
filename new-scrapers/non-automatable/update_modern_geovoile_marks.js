/* eslint-disable camelcase */
/* eslint-disable no-undef */
const { launchBrowser } = require('../../utils/puppeteerLauncher');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingData,
    registerFailedUrl,
} = require('../../utils/raw-data-server-utils');
const { v4: uuidv4 } = require('uuid');
const SOURCE = 'geovoile';

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
        console.log('Getting marks information');
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
            mark.id = uuidv4();
        }

        console.log(`Finished scraping ${url}`);
        return {
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

    const existingUrls = await getExistingData(SOURCE);
    const urlsMap = new Map();
    console.log(existingUrls);
    existingUrls.forEach((u) => {
        if (!u.original_id) {
            return;
        }
        urlsMap.set(u.original_id, u.url);
    });
    let processedCount = 0;
    let failedCount = 0;
    for (const raceOriginalId of urlsMap.keys()) {
        const url = urlsMap.get(raceOriginalId);
        let result;
        try {
            result = await scrapePage(url);
        } catch (e) {
            console.log(`Failed to scrap data for url ${url}`);
            await registerFailed(url, null, e.toString());
            failedCount++;
            continue;
        }
        if (!result.marks) {
            console.log(`Failed to scrap data for url ${url}`);
            failedCount++;
            continue;
        }
        try {
            console.log(`Sending json file to raw-data-server for url: ${url}`);
            await createAndSendTempJsonFile(
                {
                    ...result,
                    race: { original_id: raceOriginalId },
                },
                'api/v1/modern-geovoile'
            );
            processedCount++;
        } catch (err) {
            console.log(
                `Failed creating and sending temp json file for url ${url}`,
                err
            );
            continue;
        }
    }
    console.log(
        `Finished scraping geovoile modern. Total processed urls = ${processedCount}, failed urls = ${failedCount}`
    );
    process.exit(0);
})();
