const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');
const fs = require('fs');
const exec = require('sync-exec');

var AdmZip = require('adm-zip');
const {gzip, ungzip} = require('node-gzip');


( async () => {
 
    const browser = await puppeteer.launch({args: [
        '--proxy-server=127.0.0.1:8888', // Or whatever the address is 
       ]})
    const page = await browser.newPage();

    var leggedSites = [  "http://gitana-team.geovoile.com/campagne_pacifique/taipei-hongkong/",
    "http://gitana-team.geovoile.com/campagne_pacifique/qingdao-taipei/",
    "http://gitana-team.geovoile.com/campagne_pacifique/yokohama-dalian/",
    "http://gitana-team.geovoile.com/campagne_pacifique/sanfrancisco-yokohama/"]

 
var visited = []

    for(urlIndex in leggedSites){
        if(visited.includes(leggedSites[urlIndex])){
            continue
        }else{
            visited.push(leggedSites[urlIndex])
        }
        var formattedUrl = leggedSites[urlIndex]+'getXML.asp'
        console.log(leggedSites[urlIndex])
        var config = await axios.get(formattedUrl)

        exec('mkdir ' + urlIndex.toString() + '_data')
         var readme = {
            index: urlIndex,
            url: leggedSites[urlIndex]
        }
        fs.writeFileSync(urlIndex.toString() + '_data/data.xml', config.data.toString())
        fs.writeFileSync(urlIndex.toString() + '_data/readme.json', JSON.stringify(readme))
        // var baseUrl = leggedSites[urlIndex].split('?')[0]



        // var regex = /path=\"(.*\.hwz)\"/gm
        // var files = config.data.match(regex)
        // var readme = {
        //     index: urlIndex,
        //     url: leggedSites[urlIndex]
        // }
        // for(fileIndex in files){
        //     var fileName = files[fileIndex].replace('path=\"','').replace('\"', '')
        //     var newFileUrl = baseUrl + fileName
        //     var request = await axios.get(newFileUrl, {responseType: 'arraybuffer'})
        //    // var data_xml = await (await ungzip(request.data)).toString();

        //   //  var buf = new Buffer(request.data, 'base64');
        //     fs.writeFileSync(urlIndex.toString() + '_data/' + fileName.split('/')[fileName.split('/').length-1].replace('.hwz', '') + '.zip', request.data);

        // }

        // fs.writeFileSync(urlIndex.toString() + '_data/readme.json', JSON.stringify(readme))
        // await page.goto(urls[urlIndex], {timeout: 0, waitUntil: "networkidle0"})
        // try{
        //     await page.waitForFunction(() => 'raceInformation' in window);
        //     await page.waitForFunction('window.status === "ready"');
        //     var info = await page.evaluate(()=>{
        //         return raceInformation
        //     });
    
        //     var html = await axios.get(info.url)
        //     info.website_html = html.data
        //     console.log('Writing race')
        //     fs.writeFileSync(urlIndex.toString() + '.json', JSON.stringify(info))
        // }catch(err){
        //     console.log(err)
        //     console.log('Failed Url ' + urls[urlIndex])
        // }
  
       

    }


})();

