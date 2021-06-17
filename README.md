# tracker-index
Hosts the code that crawls all supported trackers, pulls down the data, and uploads it to the sources database.

# Running locally
1. Run `npm install`.
2. Initialize git submodule by running `git submodule init` and `git submodule update`.
3. Copy the tracker-schema config file in `tracker-index/tracker-schema/.env.sample` to `tracker-index/tracker-schema/.env`.
4. Set the correct database credentials and other environment variables.
5. Copy the tracker-index config file in `tracker-index/.env.sample` to `tracker-index/.env`.
6. Set the correct s3 bucket credentials and other environment variables
7. Run the script. Example `node scrapers/bluewater_scraper.js`

# Deploying in AWS ECR
Prerequsisite installations in deploying
1. docker cli
2. aws cli

To build and push the docker image, simply run `./deploy.sh`.

# Introduction
Each crawler must be schedulable and run daily as a job to pull in the latest races.
For each run, the general process is as follows:
1) Query the source DB for a list of existing races or events.
2) Crawl web, race list, mobile APIs to make a list of race urls.
3) For each race url, if the race was already scraped, ignore it.
4) If the race has not been scraped yet, check when it starts and ends.
5) If the race takes place some time within the next 24 hours, add it to the live race model.
6) If the race takes place more than 24 hours in the future, ignore it.
7) If the race has completed, save it to the sources database using the tracker data model (dependency).
8) Capture any timeouts, exceptions, and log them as failures.

# Scrapers scraping method
1. Bluewater - Uses API. Gets races from `https://api.bluewatertracks.com/api/racelist/<START_DATE>/<END_DATE>`. Eg. `https://api.bluewatertracks.com/api/racelist/2012-05-17T04:51:16.106Z/2021-07-17T04:51:16.106Z`
2. Estela       - Uses Puppeteer. Gets races from `https://www.estela.co/en?page=<PAGE_NUMBER>#races`.
3. Georacing    - Uses Puppeteer and API. Gets events using API `http://player.georacing.com/datas/applications/app_12.json` then gets the race info using Puppeteer.
4. iSail        - Uses Puppeteer. Gets events from `http://app.i-sail.com/eventDetails/<COUNTER>`
5. Kattack      - Uses API. Gets races from `http://kws.kattack.com/GEPlayer/GMPosDisplay.aspx?FeedID=<FEED_ID>`.
6. Kwindoo      - Uses API. Gets regattas by sending POST request to `https://api.kwindoo.com/api/regatta/all`.
7. Metasail     - Uses Puppeteer. Gets events from `https://www.metasail.it`.
8. RaceQs       - Uses API. Gets events from `https://raceqs.com/rest/meta?id=<EVENT_ID>`.
9. TackTracker  - Uses API. Gets regattas by sending POST request to `https://tacktracker.com/cloud/regattas/search` with a fixed list of words.
10. TracTrac    - Uses Puppeteer and API. Gets events from `http://live.tractrac.com/rest-api/events.json` then gets the race info using Puppeteer.
11. YachtBot    - Uses Puppeteer. Gets races from `http://www.yacht-bot.com/races/<RACE_ID`.
12. Yellowbrick - Uses API fallback to Puppeteer to get positions. Gets races from `https://app.yb.tl/App/Races?version=3`.

TODO:
1) Jobify
2) Add unit tests with known good races.
  * No duplicate original Ids.
  * No nulls of important fields.
  * Foreign key constraints make sense.
  * Accurately labeled data.
3) Add a "test mode".
4) Automate scraping to a brand new dev index vs scraping to staging or prod.
5) Retry logic for failures.
6) Status dashboard. I want to be able to see most recent runs, next runs, number of failures, etc.
7) Load time dashboard: I want to be able to see average load times per tracker company.
