# tracker-index
Hosts the code that crawls all supported trackers, pulls down the data, and uploads it to the sources database.

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
