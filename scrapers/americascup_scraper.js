const puppeteer = require('puppeteer');
const axios = require('axios');
const { overwriteInitJs } = require('./bundled-scripts/americascup_script');

(async () => {
    const americasCupUrl = 'https://dx6j99ytnx80e.cloudfront.net/';
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    try {
        const appConfigUrl = `${americasCupUrl}appconfig.json`;
        const appConfig = await axios.get(appConfigUrl);
        console.log('appConfig', appConfig.data);
        const watchPreviousSel =
            '#root > div > div > div.buttonRow > div.playbackbutton.cursor-pointer.active-opacity > div > div.buttonTitleMed';
        const loadingBarSel = '.progress-div';
        await page.goto(americasCupUrl, {
            timeout: 0,
            waitUntil: 'networkidle0',
        });
        await page.waitForSelector(watchPreviousSel);
        await page.evaluate(overwriteInitJs);
        await page.waitForSelector(loadingBarSel);
        await page.waitForSelector(watchPreviousSel);
        await page.click(watchPreviousSel);
        const race1Sel =
            '#root > div > div.racePickerBackground > div > div.racePickerButtonRow > div:nth-child(1)';
        await page.waitForSelector(race1Sel);
        await page.click(race1Sel);
        await page.waitForFunction(() => {
            return window.pos !== null && window.pos !== undefined;
        });
        const positions = await page.evaluate(() => window.pos);
        console.log('first boat pos', positions[0]);
        console.log('second boat pos', positions[1]);
    } catch (err) {
        console.log(err);
    }
})();
