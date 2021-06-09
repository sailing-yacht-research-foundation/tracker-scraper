const puppeteer = require('puppeteer');

async function launchBrowser() {
    return await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
}

module.exports = {
    launchBrowser,
};
