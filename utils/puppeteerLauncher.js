const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function launchBrowser(options = {}) {
    const defaultArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
    ];
    return await puppeteer.launch({
        ignoreDefaultArgs: ['--enable-automation'],
        args: defaultArgs.concat(options.args || []),
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
