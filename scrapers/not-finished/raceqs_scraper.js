const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const REGATTA_URL = 'https://raceqs.com/regattas/'
const BEGIN_COUNTING_AT = 72805


// the club:
document.querySelector('body > div > div.leftBlock.open > div.regattaLogo > div > a:nth-child(1)').href

// list all days:
document.querySelectorAll('body > div > div.leftBlock.open > div.regattaNavigation > div > ul > li > a')

// For a day this is all the races: gives event and start ids. One event id per list of many start ids.
document.querySelectorAll('body > div > div.regattaContainer > div.allStartsInfo > div > ul > li > a')[1].href


//https://raceqs.com/rest/meta?id=44160&v=53389239& use eventId
https://raceqs.com/rest/start?id= use startId


envString = "https://raceqs.com/rest/environment?" + time_string + lat_string + lon_string


               