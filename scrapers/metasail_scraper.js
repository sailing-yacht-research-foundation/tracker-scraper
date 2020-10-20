
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const FormData = require('form-data');
var AdmZip = require('adm-zip');
const exec = require('sync-exec');
const {gzip, ungzip} = require('node-gzip');
var parser = require('xml2json');

const {Metasail, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')


const LIMIT = 200;
const METASAIL_EVENT_URL = 'https://www.metasail.it/past/';
const NO_RACES_WARNING = 'No race still available';
( async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const racePage = await browser.newPage();

    if(!connect()){
        process.exit()
    }

    const existingFailureObjects = await Metasail.MetasailFailedUrl.findAll({attributes:['url']})
    const existingRaceObjects = await Metasail.MetasailRace.findAll({ attributes: ['id', 'original_id', 'url']})
    const existingEventObjects = await Metasail.MetasailEvent.findAll({ attributes: ['id', 'original_id', 'url']})

    const existingEventIds = []
    const existingEventIdsMap = {}
    existingEventObjects.forEach(e => {
        existingEventIds.push(e.original_id)
        existingEventIdsMap[e.original_id] = e.id
    })

    const existingRaceIds = []
    existingRaceObjects.forEach(r => {
        existingRaceIds.push(r.original_id)
    })

    // Events increment by 1
    var counter = 159
    while(counter > 117){
        // Get Event
        console.log('Loading page for event ' + counter +'.')

        var eventUrl = METASAIL_EVENT_URL + counter.toString()
        try{
            await page.goto(eventUrl, {timeout: 0, waitUntil: "networkidle0"})

            var noRaceText = await page.evaluate( () => {
                return document.querySelector('#evento-single > div > div:nth-child(2) > div.col-sm-8 > div > h4').textContent
            })
            if(noRaceText === NO_RACES_WARNING){
                console.log('No races associated with this event. Skipping.')
                counter -= 1
                continue
            }
    
            var eventName = await page.evaluate(() => {
                return document.querySelector('#evento-single > div > div:nth-child(1) > div > div > h5').textContent
            })
            var eventOfficialWebsite = await page.evaluate(() => {
                if(document.querySelector('#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-site > a') !== null){
                    return document.querySelector('#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-site > a').href
                }else{
                    return null;
                }
                
            })
            var eventCategoryText = await page.evaluate(()=>{
                return document.querySelector('#evento-single > div > div:nth-child(2) > div.col-sm-4 > div.single-event-classi > div > dl').textContent
            })
    
            var eventDates = await page.evaluate(()=>{
                return document.querySelector('#evento-single > div > div:nth-child(1) > div > div > p').textContent
            })
    
           
            var first = eventDates.split(' - ')[0]
            var second = eventDates.split(' - ')[1]
            
            var startMonth = first.split(' ')[0]
            var startDay = first.split(' ')[1].replace('th', '').replace('nd', '').replace('st', '')
            var endMonth = startMonth
            var endDay = second.split(' ')[0].replace('th', '').replace('nd', '').replace('st', '')
            var year = second.split(' ')[1]
            if(second.split(' ').length > 2){
                endMonth = second.split(' ')[0]
                endDay = second.split(' ')[1].replace('th', '').replace('nd', '').replace('st', '')
                year = second.split(' ')[2]
            }
            var months = {
                'January':'01',
                'February':'02',
                'March':'03',
                'April':'04',
                'May':'05',
                'June':'06',
                'July':'07',
                'August':'08',
                'September':'09',
                'October':'10',
                'November':'11',
                'December':'12'
            }

            var single_digits = {
                '1': '01',
                '2': '02',
                '3': '03',
                '4': '04',
                '5': '05',
                '6': '06',
                '7': '07',
                '8': '08',
                '9': '09'
            }

            if(parseInt(startDay < 10)){
                startDay = single_digits[startDay]
            }
            if(parseInt(endDay < 10)){
                endDay = single_digits[endDay]
            }
        
            var startDate = new Date(year + '-' + months[startMonth] + '-' + startDay )
            var endDate = new Date(year + '-' + months[endMonth] + '-' + endDay )
            endDate.setHours(23)
            endDate.setMinutes(59)
            endDate.setSeconds(59)
            var now = (new Date()).getTime()
            if(startDate.getTime() > now || endDate.getTime() > now){
                console.log("Event starts or ends in future so skipping.")
                counter -= 1
                continue
            }

            var currentEvent = {
                id: uuidv4(),
                original_id: counter.toString(),
                name: eventName,
                external_website: eventOfficialWebsite,
                url: eventUrl,
                category_text: eventCategoryText,
                start: startDate.getTime()/1000,
                end: endDate.getTime()/1000,        
            }
            if(!existingEventIds.includes(counter.toString())){
                await Metasail.MetasailEvent.create(currentEvent, {fields:Object.keys(currentEvent)})
            }else{
                currentEvent.id = existingEventIdsMap[counter.toString()]
            }
            

            var tempRaceUrls = await page.evaluate(() => {
                var urls = []
                var refs = document.querySelectorAll('#evento-single > div > div:nth-child(2) > div.col-sm-8 > div > ul > li > div > p > a')
                
                for(index in refs){
                    var ref = refs[index]
                    if(ref.href !== undefined){
                        urls.push(ref.href)
                    }
                }
                return urls
            })
            
            // Only parse races that don't exist.
            var raceUrls = []
            tempRaceUrls.forEach(u => {
                var currentId = (u.split('&token=')[0]).replace('http://app.metasail.it/ViewRecordedRace2018.aspx?idgara=', '')
                if(!existingRaceIds.includes(currentId)){
                    raceUrls.push(u)
                }
            })

            console.log('Visiting race websites.')
            var allRaceExtrasForEvent = []
            for(urlIndex in raceUrls){
                var currentRaceUrl = raceUrls[urlIndex]
                console.log('Visiting website ' + currentRaceUrl)
                try{
                    await racePage.goto(currentRaceUrl, {timeout: 680000, waitUntil: "networkidle0"})
                }catch(err){
                    await Metasail.MetasailFailedUrl.create({url: currentRaceUrl, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
                    continue
                }
                
               
                var redirectedUrl = racePage.url()


                await racePage.evaluate(() => {
                    if(localStorage.getItem('emailAdded') === null){
                        localStorage.setItem("emailAdded", true);
                        location.reload();
                    }
                  
                })
              
                var unknownIdentifier = redirectedUrl.match(/http:\/\/app\.metasail\.it\/\(S\((.*)\)\)\/ViewRecordedRace2018New\.aspx\?idgara=([0-9]+)&token=(.*)/)[1]
                var idgara = redirectedUrl.match(/http:\/\/app\.metasail\.it\/\(S\((.*)\)\)\/ViewRecordedRace2018New\.aspx\?idgara=([0-9]+)&token=(.*)/)[2]
                var token = redirectedUrl.match(/http:\/\/app\.metasail\.it\/\(S\((.*)\)\)\/ViewRecordedRace2018New\.aspx\?idgara=([0-9]+)&token=(.*)/)[3]
                await racePage.waitForFunction(() => 'garaList' in window, {timeout: 300000});
                await racePage.waitForFunction('Object.keys(garaList).length > 0', {timeout: 300000})
                
                var raceData = await racePage.evaluate(()=>{
                    var bL
                    var bLP
                    if(boaList !== null && boaList !== undefined){
                        bL = boaList
                    }
    
                    if(boaListFuoriPercorso !== null && boaListFuoriPercorso !== undefined){
                        bLP = boaListFuoriPercorso
                    }

                    var name = document.querySelector('#menu-title-gara > span').textContent
                    return {buoyList: bL, buoyListOffCourse: bLP, buoyPasses: arrayPassaggiBoe, raceInfo: garaInfo, raceList: garaList, racePathList: racePathList, start:dtLStart, stop: dtLStop, raceName: name}
                }, {timeout: 680000})
           
                var newRaceId = uuidv4()
                var newGates = []
                var newBuoys = []
                var buoyIds = {}
                raceData.buoyList.forEach(b => {
                    if(b.seriale2 === '' || b.seriale2 === '-' || b.seriale2 === ' '){
                        var newMark = {
                            id: uuidv4(),
                            race:newRaceId,
                            race_original_id: idgara,
                            original_id: b.seriale1,
                            name: b.boa1,
                            initials: b.sigla1,
                            description: b.descrizione1,
                            lat: b.lat1,
                            lon: b.lng1,
                            lat_m: b.latM1,
                            lon_m: b.lngM1
                        }

                        buoyIds[b.seriale1] = newMark.id
                        newBuoys.push(newMark)
                    }else {
                        var newMark1 = {
                            id: uuidv4(),
                            race:newRaceId,
                            race_original_id: idgara,
                            original_id: b.seriale1,
                            name: b.boa1,
                            initials: b.sigla1,
                            description: b.descrizione1,
                            lat: b.lat1,
                            lon: b.lng1,
                            lat_m: b.latM1,
                            lon_m: b.lngM1
                        }

                        var newMark2 = {
                            id: uuidv4(),
                            race:newRaceId,
                            race_original_id: idgara,
                            original_id: b.seriale2,
                            name: b.boa2,
                            initials: b.sigla2,
                            description: b.descrizione2,
                            lat: b.lat2,
                            lon: b.lng2,
                            lat_m: b.latM2,
                            lon_m: b.lngM2
                        }
                        newBuoys.push(newMark1)
                        newBuoys.push(newMark2)
                        buoyIds[b.seriale1] = newMark1.id
                        buoyIds[b.seriale2] = newMark2.id

                        var newGate = {
                            id: uuidv4(),
                            race:newRaceId,
                            race_original_id: idgara,
                            buoy_1: newMark1.id,
                            buoy_1_original_id: newMark1.original_id,
                            buoy_2: newMark2.id,
                            buoy_2_original_id: newMark2.original_id
                        }

                        newGates.push(newGate)
                    }
                })

                var boatOldIdsToNewIds = {}
                var newBoats = []
                var boatIds = Object.keys(raceData.raceInfo)
                boatIds.forEach(serial => {
                    var b = raceData.raceInfo[serial]
                    var newBoat = {
                        id: uuidv4(),
                        original_id: b.idBarca,
                        race: newRaceId,
                        race_original_id: idgara,
                        serial: serial,
                        name: b.sigla,
                        description: b.descrizione,
                        sail_number: b.descrizione2,
                        is_dummy: b.is_dummy
                    }
                    if(buoyIds[newBoat.serial] === undefined || buoyIds[newBoat.serial] === null){
                        boatOldIdsToNewIds[newBoat.serial] = newBoat.id
                        newBoats.push(newBoat)
                    }
                    
                })
                
                              
                var statsRequest = await axios({
                    method: 'post',
                    url: 'http://app.metasail.it/(S($SOME_ID$))/MetaSailWS.asmx/getStatistiche'.replace('$SOME_ID$', unknownIdentifier),
                    data: 'idGara=$IDGARA$'.replace('$IDGARA$', idgara),
                    headers: {
                    'Host' : 'app.metasail.it',
                    'Referer': currentRaceUrl,
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin' : 'http://app.metasail.it',
                    'Pragma': 'no-cache',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36'
                    }
                })
    
                var zipFileResult = await axios({
                    method: 'get',
                    url: 'http://app.metasail.it/(S($SOME_ID$))/race_$IDGARA$.zip'.replace('$SOME_ID$', unknownIdentifier).replace('$IDGARA$', idgara),
                    responseType: 'arraybuffer'
                  })
    
                var zip = new AdmZip(zipFileResult.data);
                
                var zipEntries = zip.getEntries();
                   
                var zipTextRows = []
                for (var i = 0; i < zipEntries.length; i++) {
                    var file = zip.readAsText(zipEntries[i])
                    zipTextRows = zipTextRows.concat(file.split('\\'))
                }
    
     
                var allPointsForId = {}
                for(rowIndex in zipTextRows){
                    var row = zipTextRows[rowIndex]
                    var values = row.split('|')
    
                    var id = values[0]
                    if(allPointsForId[id] === undefined){
                        allPointsForId[id] = []
                    }

                    var allPoints = allPointsForId[id]
                    
                    var time = values[1]
                    var lon = values[2]
                    var lat = values[3]
    
                    var unknown_1 = values[4]
               
                    var unknown_2 = values[5]
                   
                    var unknown_14 = values[6]
                    var speed = values[7]
                  
                    var unknown_3 = values[8]
                    var unknown_4 = values[9]
                    var unknown_5 = values[10]
                    var unknown_6 = values[11]
                    var unknown_7 = values[12]
                    var unknown_8 = values[13]
                    var unknown_9 = values[14]
                    var unknown_10 = values[15]
                    var unknown_11 = values[16]
                    var unknown_12 = values[17]
                    var unknown_13 = values[18]
                    
                    var boat_id = ''
                    var boat_original_id = ''
                    var buoy_id = ''
                    var buoy_original_id = ''
                    if(buoyIds[id] !== undefined && buoyIds[id] !== null){
                        buoy_id = buoyIds[id]
                        buoy_original_id = id
                        boat_id = null
                        boat_original_id = null
                    } else {
                        buoy_id = null
                        buoy_original_id = null
                        boat_id = boatOldIdsToNewIds[id]
                        boat_original_id = id
                    }
   
                    var container = {
                        id: uuidv4(),
                        race: newRaceId,
                        race_original_id: idgara,
                        event: currentEvent.id,
                        event_original_id: currentEvent.original_id,
                        boat: boat_id,
                        boat_original_id: boat_original_id,
                        buoy: buoy_id,
                        buoy_original_id: buoy_original_id,
                        time: time,
                        lon: lon,
                        lat: lat,
                        speed: speed,
                        lon_metri_const: unknown_1,
                        lat_metri_const: unknown_2,
                        rank: unknown_3,
                        distance_to_first_boat: unknown_4,
                        wind_state: unknown_5,
                        wind_direction: unknown_6,
                        slope_rank_line: unknown_7,
                        end_time_difference: unknown_8,
                        begin_date_time: unknown_9,
                        crt_race_segment: unknown_10,
                        apply_wind: unknown_11,
                        vmc: unknown_12,
                        vmg: unknown_13,
                        orientation: unknown_14
                    }

                    if(time !== null && lon !== null && lat !== null && time !== '' && time !== undefined){
                        allPoints.push(container)
                    }

                    
                }
              
               
    
                var stats = statsRequest.data
         
                var newRace = {
                    id: newRaceId,
                    original_id: idgara,
                    name: raceData.raceName,
                    start: raceData.start,
                    stop: raceData.stop,
                    url: redirectedUrl,
                    stats: stats,
                    event: currentEvent.id,
                    event_original_id: currentEvent.original_id,
                    passings: JSON.stringify(raceData.buoyPasses)
                }

                var raceExtra = { allPointsForId, raceData, newRace, newBoats, newBuoys, newGates }
                
                var t = await sequelize.transaction()
                try{
                   
                    
                    await Metasail.MetasailRace.create(newRace, {fields: Object.keys(newRace)})
                
                    if(newBuoys.length > 0){
                        await Metasail.MetasailBuoy.bulkCreate(newBuoys, {fields: Object.keys(newBuoys[0]), hooks:false})
                    }
    
                    if(newGates.length > 0){
                        await Metasail.MetasailGate.bulkCreate(newGates, {fields: Object.keys(newGates[0]), hooks:false})
                    }
    
                    if(newBoats.length > 0){
                        await Metasail.MetasailBoat.bulkCreate(newBoats, {fields: Object.keys(newBoats[0]), hooks:false})
                    }
                    var positionKeys = Object.keys(allPointsForId)
                    for(keyIndex in positionKeys){
                        var key = positionKeys[keyIndex]
                        var allPositions = allPointsForId[key]
                        if(allPositions.length > 0){
                            await Metasail.MetasailPosition.bulkCreate(allPositions, {fields: Object.keys(allPositions[0]), hooks:false})
                        }
                    }
                    
                    await t.commit()
                    console.log('Finished scraping race.')
                }catch(err){
                    await t.rollback()
                    await Metasail.MetasailFailedUrl.create({url: currentRaceUrl, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
                    console.log(err)
                }



            } // End of visiting all races
            console.log('Finished visiting all race urls.')

           
               
           
        }catch(err){
            
            await Metasail.MetasailFailedUrl.create({url: eventUrl, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
             
            console.log(err)
        }
        counter -= 1
    }

    racePage.close()
    page.close()
    browser.close()
    process.exit()

})();

