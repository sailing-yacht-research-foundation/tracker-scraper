# tracker-scraper
Hosts the code that crawls all supported trackers, pulls down the data, and uploads it to the sources database. Currently there are 13 scheduled scrapers and 6 sources that are scraped once.

---

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
  - [Automated](#automated)
  - [Manual](#manual)
- [Scheduled scrapers scraping method](#scheduled-scrapers-scraping-method)
- [Dashboard](#dashboard)
- [Non-automatable or one-offs scraped data](#non-automatable-or-one-offs-scraped-data)

# Introduction
Each scraper/crawler must be schedulable and run daily as a job to pull in the latest races.
For each run, the general process is as follows:
1) Call raw-data-server endpoint to get a list of existing races or events.
2) Crawl web, race list, mobile APIs to make a list of race urls.
3) For each race url, if the race was already scraped, ignore it.
4) If the race has not been scraped yet, check when it starts and ends.
5) If the race is live or scheduled in the future, scrape only the course info as unfinished race.
7) If the race has completed, scrape all info and call raw-data-server endpoint to save in database.
8) Capture any timeouts, exceptions, and log them as failures.

# Getting Started
When you run a scraper it will try to scrape all races which can have a lot of data. To test just for a few races, you need to edit each scraper code and add the race url or id list you want to scrape. There are variables on top of each code you can set to limit the races to scrape.
1. Run `npm install`.
2. Initialize git submodule by running `git submodule init` and `git submodule update`.
3. Set the correct database credentials and other environment variables.
4. Copy the config file in `./.env.sample` to `./.env`.
5. Set the correct s3 bucket credentials and other environment variables
6. Run the script. Example `node new-scrapers/bluewater_scraper.js`

# Deployment

## Automated
Pushing to develop or main branch will trigger the github workflows (.github/workflows) which will build and push docker images to ECR then it will use the terraform files in dev-deployment/app or prod-deployment/app to automatically create ECS task definitions and scheduled fargate tasks. The scheduled time for each scraper can be set on `main.tf` of the corresponding environment.

## Manual
(Optional) Alternatively you can manually build and push docker images to AWS ECR by using the deploy.sh script. This script only pushes docker images and does not create fargate scheduled tasks. This is just a way to manually push docker images to override the fargate tasks images.

Prerequisite in using the script are
1. AWS cli
2. Docker cli

To build and push the docker image
1. Configure AWS cli by following steps here https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
2. Check the variable in side the `deploy.sh` if it is correct, change it as needed before running the script
  AWS_ECR_REGISTRY=335855654610.dkr.ecr.us-east-1.amazonaws.com
  AWS_REGION=us-east-1
  ECR_REPO_NAME=raw-data-server
  ECR_TAG=latest

3. Run script `./deploy.sh`. This will build the docker image tag it and upload to AWS ECR.

# Scheduled scrapers scraping method
1. Bluewater - Uses API. Gets races from `https://api.bluewatertracks.com/api/racelist/<START_DATE>/<END_DATE>`. Eg. `https://api.bluewatertracks.com/api/racelist/2012-05-17T04:51:16.106Z/2021-07-17T04:51:16.106Z`
2. Estela       - (Currently disabled because website is blocking data center IP addresses) Uses Puppeteer. Gets races from `https://www.estela.co/en?page=<PAGE_NUMBER>#races`.
3. Georacing    - Uses Puppeteer and API. Gets events using API `http://player.georacing.com/datas/applications/app_12.json` then gets the race info using Puppeteer.
4. Geovoile (Modern) - Uses Puppeteer. Gets events from website http://www.geovoile.com/. Minimum year 2016 to be considered as modern.
5. iSail        - Uses Puppeteer. Gets events from `http://app.i-sail.com/eventDetails/<COUNTER>`
6. Kattack      - Uses API. Gets races from `http://kws.kattack.com/GEPlayer/GMPosDisplay.aspx?FeedID=<FEED_ID>`.
7. Kwindoo      - Uses API. Gets regattas by sending POST request to `https://api.kwindoo.com/api/regatta/all`.
8. Metasail     - Uses Puppeteer. Gets events from `https://www.metasail.it`.
9. RaceQs       - Uses API. Gets events from `https://raceqs.com/rest/meta?id=<EVENT_ID>`.
10. TackTracker  - Uses API. Gets regattas by sending POST request to `https://tacktracker.com/cloud/regattas/search` with a fixed list of words.
11. TracTrac    - Uses Puppeteer and API. Gets events from `http://live.tractrac.com/rest-api/events.json` then gets the race info using Puppeteer.
12. YachtBot    - Uses Puppeteer. Gets races from `http://www.yacht-bot.com/races/<RACE_ID`.
13. Yellowbrick - Uses API fallback to Puppeteer to get positions. Gets races from `https://app.yb.tl/App/Races?version=3`.

# Dashboard
Currently all scheduled scrapers are deployed on aws ECS us-east-1 for dev and us-east-2 for prod. You can see memory and CPU utilization of each scraper in production on https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#dashboards:name=scraper-runner-monitoring-prod;start=PT24H.

# Non-automatable or one-offs scraped data
There are 6 sources that were scraped once. Their raw data are stored on s3 bucket https://s3.console.aws.amazon.com/s3/buckets/databacklog?region=us-east-1&tab=objects and americas-cup-raw-data bucket.
These are
1. Americas Cup 2013 and 2016
2. Americas Cup 2021
3. Old Geovoile (Geovoile races before 2016)
4. Regadata
5. SAP
6. Swiftsure
