// 36th Americas cup 2021 scraper
const puppeteer = require('puppeteer');
const axios = require('axios');
const {
    overwriteInitJs,
} = require('../bundled-scripts/americascup2021_script');
const { uploadS3 } = require('../utils/upload_racegeojson_to_s3');

(async () => {
    const BUCKET_NAME = 'americas-cup-raw-data';
    const americasCupUrl = 'https://dx6j99ytnx80e.cloudfront.net';
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    try {
        // Get App Config
        const appConfigUrl = `${americasCupUrl}/appconfig.json`;
        const appConfigResponse = await axios.get(appConfigUrl);
        const appConfig = appConfigResponse.data;

        const watchPreviousSel =
            '#root > div > div > div.buttonRow > div.playbackbutton.cursor-pointer.active-opacity > div > div.buttonTitleMed';
        const loadingBarSel = '.progress-div';
        await page.goto(americasCupUrl, {
            timeout: 0,
            waitUntil: 'networkidle0',
        });
        console.log(
            'Waiting for first watch previous selector',
            watchPreviousSel
        );
        await page.waitForSelector(watchPreviousSel);

        console.log('Injecting global variable');
        // Inject global variable to access decoded data
        await page.evaluate(overwriteInitJs);
        console.log('Waiting for loading bar');
        await page.waitForSelector(loadingBarSel);
        console.log('Waiting for watch previous selector');
        await page.waitForSelector(watchPreviousSel);

        console.log('Clicking Previous Events');
        // Navigate to race
        await page.click(watchPreviousSel);
        const eventListSel =
            '#root > div > div.racePickerBackground > div > div.racePickerHeaderRow';
        await page.waitForSelector(eventListSel);
        const eventListTemp = await page.$$(eventListSel);
        let eventListIndex = 0;
        await eventListTemp.reduce(async (prevEventPromise, _) => {
            await prevEventPromise;
            const eventListHandle = await page.$$(eventListSel); // Need to re evaluate since page changes to differnt dom on every iteration
            const eventHandle = eventListHandle[eventListIndex];
            const eventName = await eventHandle.evaluate(
                (node) => node.innerText
            );
            console.log(`Clicking event header ${eventName}`);
            await eventHandle.click();

            const raceListSel =
                '#root > div > div.racePickerBackground > div > div.racePickerButtonRow > div';
            await page.waitForTimeout(2000); // Allow js to execute visible rows. Cannot use waitForSelector since it has the same selector
            const raceListTemp = await page.$$(raceListSel);
            let raceListIndex = 0;
            await raceListTemp.reduce(async (prevRacePromise, _) => {
                await prevRacePromise;
                const raceListHandle = await page.$$(raceListSel); // Need to re evaluate since page changes to differnt dom on every iteration
                const raceHandle = raceListHandle[raceListIndex];
                const raceName = await raceHandle.evaluate(
                    (node) => node.innerText
                );
                console.log(`Clicking race ${raceName}`);
                await raceHandle.click();

                console.log('Waiting for loading bar');
                await page.waitForSelector(loadingBarSel);
                console.log('Waiting for loading bar to finish');
                await page.waitForFunction(
                    () => !document.querySelector('.progress-div')
                );

                console.log(`SCRAPING event ${eventName} and race ${raceName}`);
                await page.waitForFunction(() => {
                    return (
                        window.pos &&
                        window.buoyList &&
                        window.windList &&
                        window.roundingTime
                    );
                });
                // The pos, buoyList and windList are already stored in window.race
                const race = await page.evaluate(() => {
                    function replacer(key, value) {
                        if (value instanceof Map) {
                            const obj = Object.create(null);
                            for (const [k, v] of value) {
                                obj[k] = v;
                            }
                            return obj;
                        } else {
                            return value;
                        }
                    }
                    return JSON.parse(JSON.stringify(window.race, replacer)); // Converts map to json
                });
                const jsonData = {
                    appConfig,
                    race,
                };
                const filename = `2021-${eventName.replace(
                    / /g,
                    '_'
                )}-${raceName.replace(/ /g, '_')}.json`;
                console.log(
                    `Uploading ${filename} file to s3 bucket named ${BUCKET_NAME}`
                );
                await uploadS3({
                    Bucket: BUCKET_NAME,
                    Key: filename,
                    Body: JSON.stringify(jsonData),
                });
                // Clear injected variables
                await page.evaluate(() => (window.buoyList = undefined));
                await page.evaluate(() => (window.windList = undefined));
                await page.evaluate(() => (window.roundingTime = undefined));

                const backSel =
                    '#root > div > div:nth-child(2) > div.racinghud > div.leaderboard > div > div:nth-child(1) > img';
                await page.waitForSelector(backSel);
                console.log('Clicking back selector');
                await page.click(backSel);
                console.log('Waiting for loading bar');
                await page.waitForSelector(loadingBarSel);

                console.log('Waiting for watch previous selector');
                await page.waitForSelector(watchPreviousSel);
                console.log('Clicking Previous Events');
                await page.click(watchPreviousSel);
                await page.waitForSelector(eventListSel);
                const eventListHandle = await page.$$(eventListSel);
                const eventHandle = eventListHandle[eventListIndex];
                await eventHandle.click();
                await page.waitForSelector(raceListSel);
                raceListIndex++;
            }, Promise.resolve());
            eventListIndex++;
        }, Promise.resolve());
        console.log('Finished All Events and Races');
        page.close();
        browser.close();
        process.exit();
    } catch (err) {
        console.log(err);
        page.close();
        browser.close();
        process.exit();
    }
})();
