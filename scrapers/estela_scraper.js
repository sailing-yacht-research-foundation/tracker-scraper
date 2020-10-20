const {Estela, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const FormData = require('form-data');
var AdmZip = require('adm-zip');
const exec = require('sync-exec');
const {gzip, ungzip} = require('node-gzip');
var parser = require('xml2json');


// TODO: automate this limit.
const LIMIT = 270;
const ESTELA_RACE_PAGE_URL = 'https://www.estela.co/en?page={$PAGENUM$}#races';
const PAGENUM = '{$PAGENUM$}'
const NO_RACES_WARNING = 'No race still available';
( async() => {
    var CONNECTED_TO_DB = connect()
    if(! CONNECTED_TO_DB){
        console.log("Couldn't connect to db.")
        process.exit()
    }

    const existingFailureObjects = await Estela.EstelaFailedUrl.findAll({attributes:['url']})
    const existingRaceObjects = await Estela.EstelaRace.findAll({ attributes: ['id', 'original_id', 'url', 'name']})
    const existingClubObjects = await Estela.EstelaClub.findAll({attributes:['id', 'original_id']})
    const existingClubs = {}
    const existingFailures = []
    const existingRaces = []
    existingClubObjects.forEach(c => {
        existingClubs[c.original_id] = c.id
    })

    existingFailureObjects.forEach(f => {
        existingFailures.push(f.url)
    })
    existingRaceObjects.forEach(r => {
        existingRaces.push(r.url)
    })
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
   
   
    var allRaceUrls = [];

    // Pages increment by 1
    var counter = 1
    while(counter < LIMIT){
        // Get current list of races from page.
        console.log('Loading race list page number: ' + counter +'.')

        var pageUrl = ESTELA_RACE_PAGE_URL.replace(PAGENUM, counter.toString())
        try{
            await page.goto(pageUrl, {timeout: 0, waitUntil: "networkidle0"})

            var raceUrls = await page.evaluate( () => {
                var refs = document.querySelectorAll('body > div > div.container > section > div > div > div > div > div > a')
                var urls = []
                for(index in refs){
                    var ref = refs[index]
                    if(ref.href !== undefined){
                        var url = ref.href
                        var trackingUrl = url.replace('https://www.estela.co/en/race', 'https://www.estela.co/en/tracking-race')
                        urls.push(trackingUrl)
                    }
                }
                return urls
            })

            if(raceUrls.length === 0){
                console.log('No races associated with this event. Skipping.')
                counter += 1
                continue
            }
            

            raceUrls.forEach(u => {
                if(! existingFailures.includes(u) && ! existingRaces.includes(u)){
                    allRaceUrls.push(u)
                }
            })
            

        }catch(err){
            await Estela.EstelaFailedUrl.create({url: pageUrl, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
              
            console.log(err)
        }
        counter += 1
    }// Finished getting all race urls.

   
    console.log('Beginning to parse race list.')
    console.log(allRaceUrls.length)

    for(raceIndex in allRaceUrls){
        var currentRaceUrl = allRaceUrls[raceIndex]
        try{
            await page.goto(currentRaceUrl, {timeout: 0, waitUntil: "networkidle0"})
            if(existingRaces.includes(currentRaceUrl)){
                continue
            }
            console.log(currentRaceUrl)
            await page.waitForFunction(() => {
                return (playerConfig !== null && playerConfig !== undefined)
            })
            var raceInfo = await page.evaluate( () => {

                var club = playerConfig.club
                var dorsals = playerConfig.dorsals
                var initLat = playerConfig.initLat
                var initLon = playerConfig.initLng
                var marks = playerConfig.marks
                var results = playerConfig.results
                var r = playerConfig.race
                var bs = r.buoys


                var buoys = []

                bs.forEach(b => {
                    var l = b.layline
                    var layline = null;
                    if(l !== null && l !== undefined){
                        layline = {
                            angle: l.angle,
                            distance: l.distance
                        }
                    }
                    var a = null
                    var d = null
                    if(layline !== null){
                        a = layline.angle,
                        d = layline.distance
                    }
                    var buoy = {
                        anchored_at: b.anchored_at,
                        door: b.door,
                        focus: b.focus,
                        original_id: b.id,
                        index: b.index,
                        label: b.label,
                        lat: b.lat,
                        lon: b.lng,
                        name: b.name,
                        score: b.score,
                        updated_at: b.updated_at,
                        waypoint: b.waypoint,
                        layline_angle: a,
                        layline_distance: d
                    }
                    

                    if(b.nextSoringBuoy !== null && b.nextScoringBuoy!== undefined){
                        buoy.nextScoringBuoy = b.nextScoringBuoy.id
                    }

                    buoys.push(buoy)
                })


                var race = {
                    buoy_radius: r.buoy_radius,
                    buoys: buoys,
                    initLat: initLat,
                    initLon: initLon,
                    classes: r.classes,
                    end: r.end,
                    end_timestamp: r.end_timestamp,
                    ended_at: r.ended_at,
                    has_ended: r.has_ended,
                    has_started: r.has_started,
                    id: r.id,
                    initial_bounds: r.initial_bounds,
                    length: r.length,
                    name: r.name,
                    offset: r.offset,
                    onset: r.onset,
                    onset_timestamp: r.onset_timestamp,
                    players: r.players,
                    scheduled_timestamp: r.scheduled_timestamp,
                    start: r.start,
                    start_timestamp: r.start_timestamp,
                    winds: r.winds,
                    url: ""
                }

                return { race, results, marks, dorsals, club }
            })

            raceInfo.race.url = currentRaceUrl;

            if(raceInfo.race.start_timestamp > Date.now() || !raceInfo.race.has_ended){
                console.log('Future race, skipping.')
                continue
            }

            var baseUrl = currentRaceUrl.replace('https://www.estela.co/en/tracking-race/' , 'https://www.estela.co/races/')
           

            var gpxUrl = baseUrl + '/route.gpx?'
            var windsCsvUrl = baseUrl + '/winds.csv'
            var legWindUrl = baseUrl + '/legs-wind.csv'
            var resultsUrl = baseUrl + '/results.csv'
            
            var gpxRequest = await axios.get(gpxUrl)
            raceInfo.race.gpx = gpxRequest.data

            var windRequest = await axios.get(windsCsvUrl)
            raceInfo.race.wind = windRequest.data
            var legWindRequest = await axios.get(legWindUrl)
            raceInfo.race.legWind = legWindRequest.data
            var resultsRequest = await axios.get(resultsUrl)
            raceInfo.race.resultsData = resultsRequest.data  
          
            var HAS_POSITIONS = false
            var positions = {}
            var positionLimit = 100000
            try{
                var positionRequest = await axios.get('https://d22ymaefawl8oh.cloudfront.net/v2/races/' + raceInfo.race.id + '/positions/?limit=-1')
                var positions = positionRequest.data.data.positions
                HAS_POSITIONS = true
            }catch(error){
                var gotThemAll = false
                var timeParam = ''
                while(!gotThemAll){
                    positionRequest = await axios.get('https://d22ymaefawl8oh.cloudfront.net/v2/races/' + raceInfo.race.id + '/positions/?' + timeParam + '&limit=' + positionLimit.toString())
                    if(positionRequest.data.data.positions.length === 0 ){
                        gotThemAll = true
                    }else {
                        if(positionRequest.data.data.length < positionLimit){
                            gotThemAll = true
                        }
                        timeParam = 'start=' + positionRequest.data.data.last.t
                        console.log(timeParam)
                        Object.keys(positionRequest.data.data.positions).forEach(k => {
                            if(positions[k] === null || positions[k] === undefined){
                                positions[k] = positionRequest.data.data.positions[k]
                            }else{
                                positions[k] = positions[k].concat(positionRequest.data.data.positions[k])
                            }
                        })
                    }
                    
                }
                HAS_POSITIONS = true
            }
  
             var clubExtras = {}
             for(dorsalIndex in raceInfo.dorsals){
                 var d = raceInfo.dorsals[dorsalIndex]
                 var k = d.id
                 var tag = currentRaceUrl.replace('https://www.estela.co/en/tracking-race/' + raceInfo.race.id, '')
                 var boatTrackCsvUrl = 'https://www.estela.co/races/' + raceInfo.race.id + '/' + k + '/download' + tag + '/track.csv'

                 var boatTrackRequest = await axios.get(boatTrackCsvUrl)
                 d.trackCsv = boatTrackRequest.data

                 var clubPageRequest = await axios.get('https://www.estela.co/clubs?key=' + k)
                 var namePat = /<span class="panel-title">(.*)<\/span>/g;
                 var phonePat = /<small><i class="fa fa-phone"><\/i>([0-9\s]*)<\/small>/gm;
                 var emailPat = /<small>(.*)@(.*)<\/small><br>/gm;
                 var names = {}
                 var phones = {}
                 var emails = {}
                 var nameCounter = 0
                 if(clubPageRequest.data.match(namePat) !== null){
                    clubPageRequest.data.match(namePat).forEach(n => {
                        var name = n.match(/<span class="panel-title">(.*)<\/span>/)[1]
                        names[nameCounter.toString()] = name
                        nameCounter += 1
                    })
                 }
                
                 var phoneCounter = 0
                if(clubPageRequest.data.match(phonePat) !== null){
                    clubPageRequest.data.match(phonePat).forEach(n => {
                        var phone= n.match(/<small><i class="fa fa-phone"><\/i>([0-9\s]*)<\/small>/)[1]
                        phones[phoneCounter.toString()]= phone.trim()
                        phoneCounter += 1
                    })
                }
             
                var emailCounter = 0
                if(clubPageRequest.data.match(emailPat) !== null){
                    clubPageRequest.data.match(emailPat).forEach(n => {
                        var matches = n.match(/<small>(.*)@(.*)<\/small><br>/)
                        var email= matches[1] + '@' + matches[2]
                        emails[emailCounter.toString()] = email
                        emailCounter += 1
                    })
                }
                
               
                for(nameIndex in Object.keys(names)){
                    var k = Object.keys(names)[nameIndex]
                    var n = names[k]
                    var c = {
                        name: n,
                        phone: phones[k],
                        email: emails[k]
                    }
                    clubExtras[n] = c
                }
             }
             
             if(raceInfo.club !== undefined && clubExtras[raceInfo.club.name] !== undefined){
                raceInfo.club.phone = clubExtras[raceInfo.club.name].phone
                raceInfo.club.email = clubExtras[raceInfo.club.name].email

                 // Create new club.
                if(existingClubs[raceInfo.club.id] === null || existingClubs[raceInfo.club.id] === undefined){
                    var newClub = {
                    id: uuidv4(),
                    original_id: raceInfo.club.id,
                    user_id: raceInfo.club.user_id,
                    name: raceInfo.club.name,
                    lon: raceInfo.club.lng,
                    lat: raceInfo.club.lat,
                    timezone: raceInfo.club.timezone,
                    website: raceInfo.club.website,
                    address: raceInfo.club.address,
                    twitter: raceInfo.club.twitter_account,
                    api_token: raceInfo.club.api_token,
                    phone: raceInfo.club.phone,
                    email: raceInfo.club.email
                    }

                    await Estela.EstelaClub.create(newClub, {fields: Object.keys(newClub)})
                    existingClubs[newClub.original_id] = newClub.id
                }
             } 
            
             if(raceInfo.club !== undefined){
                raceInfo.newClubId = existingClubs[raceInfo.club.id]
                raceInfo.clubOriginalId = raceInfo.club.id
             }

            

      

             var newRace = {
                id: uuidv4(),
                original_id: raceInfo.race.id,
                initLon: raceInfo.race.initLon,
                initLat: raceInfo.race.initLat,
                end: raceInfo.race.end,
                end_timestamp: raceInfo.race.end_timestamp,
                ended_at: raceInfo.race.ended_at,
                has_ended: raceInfo.race.has_ended,
                has_started: raceInfo.race.has_started,
                length: raceInfo.race.length,
                name: raceInfo.race.name,
                offset: raceInfo.race.offset,
                onset: raceInfo.race.onset,
                onset_timestamp: raceInfo.race.onset_timestamp,
                scheduled_timestamp: raceInfo.race.scheduled_timestamp,
                start: raceInfo.race.start,
                start_timestamp: raceInfo.race.start_timestamp,
                url: raceInfo.race.url,
                gpx: raceInfo.race.gpx,
                winds_csv: raceInfo.race.wind,
                leg_winds_csv: raceInfo.race.legWind,
                results_csv: raceInfo.race.resultsData,
                club: raceInfo.newClubId,
                club_original_id: raceInfo.clubOriginalId
             }

             var buoyIds = {}
             raceInfo.race.buoys.forEach(b => {
                 b.radius = raceInfo.race.buoy_radius
                 b.id = uuidv4(),
                 b.race = newRace.id,
                 b.race_original_id = newRace.original_id
                 buoyIds[b.original_id] = b.id
             })

             var newDorsals = []
             var dorsalIds = {}
             
             raceInfo.dorsals.forEach(dor => {
              
                var c_id = null
                var c_original_id = null
                if(dor.pivot !== undefined){
                    c_id = existingClubs[dor.pivot.club_id]
                    c_original_id = dor.pivot.club_id
                }
            
                var dorsal = {
                    id: uuidv4(),
                    original_id: dor.id,
                    race: newRace.id,
                    race_original_id: newRace.original_id,
                    name: dor.name,
                    model: dor.model,
                    committee: d.committee,
                    number: dor.number,
                    mmsi: d.mmsi,
                    pivot_club_id: c_id,
                    pivot_club_original_id: c_original_id,
                    class: dor.class,
                    active: dor.active,
                    track_csv: dor.trackCsv
                }
       
                newDorsals.push(dorsal)
                dorsalIds[dor.id] = dorsal.id
             })

             var newPlayers = []
             raceInfo.race.players.forEach( ply => {
                var player = {
                    id: uuidv4(),
                    original_id: ply.id,
                    dorsal: dorsalIds[ply.dorsal_id],
                    dorsal_original_id: ply.dorsal_id,
                    class: ply.class,
                    name: ply.name,
                    number: ply.number,
                    committee: ply.committee,
                    race: newRace.id,
                    race_original_id: newRace.original_id
                }
             
                newPlayers.push(player)
             })
             
             var newResults = []
             raceInfo.results.forEach(res => {
                var result = {
                    id: uuidv4(),
                    race: newRace.id,
                    race_original_id: newRace.original_id,
                    dorsal: dorsalIds[res.dorsal_id],
                    dorsal_original_id: res.dorsal_id,
                    buoy: buoyIds[res.buoy_id],
                    buoy_original_id: res.buoy_id,
                    laravel_through_key: res.laravel_through_key,
                    timestamp: res.timestamp
                }
               
                newResults.push(result)
             })

             var newPositions = []

             if(HAS_POSITIONS){
                 var keys = Object.keys(positions)
                 keys.forEach( k => {
                     var pos = positions[k]
                     var lastTime = ''
                    pos.forEach(p => {
                        var position = {
                            id: uuidv4(),
                            race: newRace.id,
                            race_original_id: newRace.original_id,
                            dorsal: dorsalIds[k],
                            dorsal_original_id: k,
                            lon: p.n,
                            lat: p.a,
                            timestamp: p.t,
                            s: p.s,
                            c: p.c,
                            p: p.p,
                            w: p.w,
                            y: p.y
                        }
                        if(p.t !== lastTime){
                            lastTime = p.t
                            newPositions.push(position)
                        }
                        
                    })
                 })
             }

            var t = await sequelize.transaction()
            try{
                await Estela.EstelaRace.create(newRace, {fields:Object.keys(newRace)})
                if(raceInfo.race.buoys.length > 0){
                    await Estela.EstelaBuoy.bulkCreate(raceInfo.race.buoys, {fields: Object.keys(raceInfo.race.buoys[0])})
                }

                if(newDorsals.length > 0){
                    await Estela.stelaDorsal.bulkCreate(newDorsals, {fields: Object.keys(newDorsals[0])})
                }

                if(newPlayers.length > 0){
                    await Estela.EstelaPlayer.bulkCreate(newPlayers, {fields: Object.keys(newPlayers[0])})
                }

                if(newResults.length > 0){
                    await Estela.EstelaResult.bulkCreate(newResults, {fields: Object.keys(newResults[0])})
                }


                if(newPositions.length > 0){
                    var tempPositions = []

                    var posIndex = 0
                    for(newPositionsIndex in newPositions){
                        posIndex += 1
                        tempPositions.push(newPositions[newPositionsIndex])
                        if(posIndex === 10000){
                            posIndex = 0
                            await Estela.EstelaPosition.bulkCreate(tempPositions, {fields: Object.keys(newPositions[0])})
                            tempPositions = []
                        }
                    }
                    if(posIndex > 0){
                        await Estela.EstelaPosition.bulkCreate(tempPositions, {fields: Object.keys(newPositions[0])})
                    }
                }
                t.commit()
                console.log('Finished scraping race.')
            }catch(err){
                t.rollback()
                await Estela.EstelaFailedUrl.create({url: currentRaceUrl, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
                console.log(err)
            }
            // This seems to be unused.
             var newMarks = []
             raceInfo.marks.forEach( m => {
                console.log(m)
             })
          

             
             // buoys, players, winds, race, dorsals, results, marks, positions,  initial_bounds then done!
            

        

        }catch(err){
        
            await Estela.EstelaFailedUrl.create({url: currentRaceUrl, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
            console.log(err)
        }
    }
 
    page.close()
    browser.close()
    process.exit()

})();

