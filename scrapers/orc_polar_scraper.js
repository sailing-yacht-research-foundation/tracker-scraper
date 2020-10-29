const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');
const fs = require('fs');

( async () => {


    var polarsRequest = await axios.get('http://aayaffe.github.io/orc-data/site/index.json')

    var polarsList = polarsRequest.data

    for(polarIndex in polarsList){
        var p = polarsList[polarIndex]
        var name = p[0].replace('/', '-')
        try{
            var polarDataRequest = await axios.get('http://aayaffe.github.io/orc-data/site/data/' + p[0] + '.json')

        }catch(err){
            
        }
        
        fs.writeFileSync(name + '.json', JSON.stringify(polarDataRequest.data))
    }
    process.exit()
})();