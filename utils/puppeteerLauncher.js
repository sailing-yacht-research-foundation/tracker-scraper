const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function launchBrowser() {
    return await puppeteer.launch({
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
}

async function closePageAndBrowser({ page, browser }) {
    if (page) {
        await page.close();
    }
    if (browser) {
        await browser.close();
    }
}

module.exports = {
    launchBrowser,
    closePageAndBrowser,
};
