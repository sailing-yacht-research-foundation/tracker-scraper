const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');
const fs = require('fs');

( async () => {
 
    const browser = await puppeteer.launch({args: [
        '--proxy-server=127.0.0.1:8888', // Or whatever the address is 
       ]})
    const page = await browser.newPage();

   // data/race/leg3.tracks.kmz
    var urls = [
"http://trimaran-idec.geovoile.com/julesverne/2015/tracker/html/?leg=1",
"http://transquadra.geovoile.com/2014/tracker/?leg=2",
"http://transquadra.geovoile.com/2014/tracker/?leg=1",
"http://barcelonaworldrace.geovoile.org/2015/tracker/html/?leg=1",
"http://normandy-race.geovoile.com/2015/app/html/",
"http://lasolitaire.geovoile.com/2015/tracker/html/?leg=4",
"http://lasolitaire.geovoile.com/2015/tracker/html/?leg=3",
"http://lasolitaire.geovoile.com/2015/tracker/html/?leg=2",
"http://lasolitaire.geovoile.com/2015/tracker/html/?leg=1",
"http://lessables-horta.geovoile.com/2013/app/html/?leg=2",
"http://lessables-horta.geovoile.com/2013/app/html/?leg=1",
"http://lessables-horta.geovoile.com/2015/tracker/html/?leg=1",
"http://lessables-horta.geovoile.com/2015/tracker/html/?leg=2",
"http://transgascogne.geovoile.com/2015/tracker/html/?leg=1",
"http://transgascogne.geovoile.com/2015/tracker/html/?leg=2",
"http://tourdebretagnealavoile.geovoile.com/2015/tracker/html/?leg=5",
"http://tourdebretagnealavoile.geovoile.com/2015/tracker/html/?leg=4",
"http://tourdebretagnealavoile.geovoile.com/2015/tracker/html/?leg=3",
"http://tourdebretagnealavoile.geovoile.com/2015/tracker/html/?leg=2",
"http://tourdebretagnealavoile.geovoile.com/2015/tracker/html/?leg=1",
"http://generali-solo.geovoile.com/2015/tracker/html/?leg=1",
"http://generali-solo.geovoile.com/2015/tracker/html/?leg=2",
"http://trophee-azimut.geovoile.com/2015/tracker/html/?leg=1",
"http://gitana-team.geovoile.com/jacquesvabre/2015/tracker/?leg=1",
"http://minitransat.geovoile.com/2015/tracker/html/?leg=2",
"http://minitransat.geovoile.com/2015/tracker/html/?leg=1",
"http://oceanmasters-sbplf.geovoile.com/2015/tracker/html/?leg=1",
"http://transatag2r.geovoile.com/2014/app/html/",
"http://lasolitaire.geovoile.com/2012/app/html/?leg=3",
"http://lasolitaire.geovoile.com/2012/app/html/?leg=2",
"http://lasolitaire.geovoile.com/2012/app/html/?leg=1",
"http://en-avant-toute.geovoile.com/tourdumonde/2013/app/html/?leg=6",
"http://en-avant-toute.geovoile.com/tourdumonde/2013/app/html/?leg=5",
"http://en-avant-toute.geovoile.com/tourdumonde/2013/app/html/?leg=4",
"http://en-avant-toute.geovoile.com/tourdumonde/2013/app/html/?leg=3",
"http://en-avant-toute.geovoile.com/tourdumonde/2013/app/html/?leg=2",
"http://en-avant-toute.geovoile.com/tourdumonde/2013/app/html/?leg=1",
"http://trimaran-idec.geovoile.com/atlantiquenord/2013/app/html/",
"http://trimaran-idec.geovoile.com/routedeladecouverte/2013/app/html/",
"http://transat-bretagnemartinique.geovoile.com/2013/_gmap/",
"http://normandy-race.geovoile.com/2013/app/html/",
"http://lasolitaire.geovoile.com/2013/app/html/?leg=4",
"http://lasolitaire.geovoile.com/2013/app/html/?leg=3",
"http://lasolitaire.geovoile.com/2013/app/html/?leg=2",
"http://lasolitaire.geovoile.com/2013/app/html/?leg=1",
"http://trophee-azimut.geovoile.com/2013/app/html/",
"http://minitransat.geovoile.com/2013/app/html/?leg=2",
"http://minitransat.geovoile.com/2013/app/html/?leg=1",
"http://dongfengraceteam.geovoile.com/newport-lorient/2014/app/html/",
"http://trimaran-idec.geovoile.com/routedelamitie/2014/app/html/",
"http://dongfengraceteam.geovoile.com/sanya-auckland/2014/app/html/",
"http://transatag2r.geovoile.com/2014/app/html/",
"http://normandy-race.geovoile.com/2014/app/html/",
"http://oceanmasters-nytobcn.geovoile.com/2014/app/html/",
"http://lasolitaire.geovoile.com/2014/app/html/?leg=4",
"http://lasolitaire.geovoile.com/2014/app/html/?leg=3",
"http://lasolitaire.geovoile.com/2014/app/html/?leg=2",
"http://lasolitaire.geovoile.com/2014/app/html/?leg=1",
"http://transquadra.geovoile.com/2014/tracker/html/?leg=2",
"http://transquadra.geovoile.com/2014/tracker/html/?leg=1",
"http://artemischallenge.geovoile.com/2014/app/html/",
"http://lessables-lesacores.geovoile.com/2014/app/html/?leg=2",
"http://lessables-lesacores.geovoile.com/2014/app/html/?leg=1",
"http://trophee-azimut.geovoile.com/2014/app/html/",
"http://ramesguyane.geovoile.com/2014/app/html/",
"http://routedurhum.geovoile.com/2014/tracker/html/"]

    for(urlIndex in urls){
        console.log('New url')
        await page.goto(urls[urlIndex], {timeout: 0, waitUntil: "networkidle0"})
        try{
            await page.waitForFunction(() => 'raceInformation' in window);
            await page.waitForFunction('window.status === "ready"');
            var info = await page.evaluate(()=>{
                return raceInformation
            });
    
            var html = await axios.get(info.url)
            info.website_html = html.data
            console.log('Writing race')
            fs.writeFileSync(urlIndex.toString() + '.json', JSON.stringify(info))
        }catch(err){
            console.log(err)
            console.log('Failed Url ' + urls[urlIndex])
        }
  
       

    }


})();

