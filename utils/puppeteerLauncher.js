const puppeteer = require('puppeteer');

async function launchBrowser() {
    return await puppeteer.launch({
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
