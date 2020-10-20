/**
 * This is a scraper for the new (as of late 2020) PredictWind tracking product.
 * Unfortunately, as of now, this tracker does not have a search api, nor does it list all races/events anywhere. 
 * Consequently, this tracker relies on manual collection of URLs fitting the regex https://forecast.predictwind.com/tracking/race/{race_code}
 */

const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');

const knownUrls = [
    "https://forecast.predictwind.com/tracking/race/nzmyc",
    "https://forecast.predictwind.com/tracking/race/rayc",
    "https://forecast.predictwind.com/tracking/race/ssanz",
    "https://forecast.predictwind.com/tracking/race/SSANZTriple",
    "http://forecast.predictwind.com/tracking/race/OWA",
    "https://forecast.predictwind.com/tracking/race/tasman_bay_cruising_club",
    "https://forecast.predictwind.com/tracking/race/typbc",
    "https://forecast.predictwind.com/tracking/race/RPNYC",
    "https://forecast.predictwind.com/tracking/race/ryc",
    "http://forecast.predictwind.com/tracking/race/ISORA"
]



