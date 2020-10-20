// get config
// Request URL: http://legacy.data.swiftsure.net/APIv1.0/FetchLandmarks?EventToken=6eab0c5ae631741dcc0a88a8bdb7f5ec&Callback=_jqjsp&_1601566473313=


// 


const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
var AdmZip = require('adm-zip');
const exec = require('sync-exec');
const {gzip, ungzip} = require('node-gzip');
var parser = require('xml2json');
var fs = require('fs');
const { notStrictEqual } = require('assert');
const legacyUrls = [
    "http://legacy.tracker.swiftsure.org/?token=91cab9b1b2d194981dc0def1d8058ab2",
    "http://legacy.tracker.swiftsure.org/?token=0785d8103b089b62d1aa7707bfe7c0db",
    "http://legacy.tracker.swiftsure.org/?token=3b5d49236aec013ab0f0c129b21b29e5",
    "http://legacy.tracker.swiftsure.org/?token=2da9e44d05139461ce8e1f0456bf2d05",
    "http://legacy.tracker.swiftsure.org/?token=3f16174a75b9f14fef080a0ead2ff37c",
    "http://legacy.tracker.swiftsure.org/?token=6eab0c5ae631741dcc0a88a8bdb7f5ec"
];
// "http://2011.swiftsure.org", offline
// "http://2012.swiftsure.org", offline
const nonLegacyUrls = [
    "http://tracker.swiftsure.org/",
    "http://tracker.southernstraits.ca/",
    "http://tracker.r2ak.com/",
    "http://leg1.r2ak.com/",
    "http://leg2.r2ak.com/",
    "http://tracker.vanisle360.com/",
    "http://rvyc-cruising.swiftsure.org/",
    "http://tracker.seventy48.com/",
    "http://northerncentury.swiftsure.org",
    "http://oregonoffshore.swiftsure.org",
    "http://tracker.patosislandrace.com",
    "http://2018leg1.r2ak.com/",
    "http://2018leg2.r2ak.com/",
];

const DB_URL = process.env.DB_URL || 'regatta-data-map.cluster-cfiwyruwalfl.us-east-1.rds.amazonaws.com'
const DB_PW = process.env.DB_PW || 'loch-ova-pauper-premise'

const sequelize = new Sequelize('sources', 'administrator', DB_PW, {
    host: DB_URL,
    dialect: 'postgres'
});



const SwiftsureBoat = sequelize.define('SwiftsureBoat', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    boat_name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    api_2_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    team_name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    division: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    boat_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    yacht_club: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    make: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    loa: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    home_port: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    skipper: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    skipper_email: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fbib: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    race_sort: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_time: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    num_crew: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    scoring: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'SwiftsureBoats',
    timestamps: false
});

const SwiftsureLine = sequelize.define('SwiftsureLine', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lat1: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lon1: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lat2: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lon2: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},{
    tableName: 'SwiftsureLines',
    timestamps: false
});

const SwiftsureLink = sequelize.define('SwiftsureLink', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lon: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'SwiftsureLinks',
    timestamps: false
});

const SwiftsureMark = sequelize.define('SwiftsureMark', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lon: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'SwiftsureMarks',
    timestamps: false
});

const SwiftsurePoint = sequelize.define('SwiftsurePoint', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lon: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'SwiftsurePoints',
    timestamps: false
});

const SwiftsureSponsor = sequelize.define('SwiftsureSponsor', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    lon: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'SwiftsureSponsors',
    timestamps: false
});

const SwiftsureRace = sequelize.define('SwiftsureRace', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    welcome: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    race_start: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    course_bounds_n: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    course_bounds_s: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    course_bounds_e: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    course_bounds_w: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    home_bounds_n: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    home_bounds_s: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    home_bounds_e: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    home_bounds_w: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fin_bounds_n: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fin_bounds_s: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fin_bounds_e: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fin_bounds_w: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timezone: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    track_type: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    event_type: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    update_interval: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tag_interval: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    default_facebook: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'SwiftsureRaces',
    timestamps: false
});

const SwiftsurePosition = sequelize.define('SwiftsurePosition', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    boat: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    boat_original_id: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lat: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lon: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    speed: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    heading: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    stat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dtg: {
        type: DataTypes.TEXT,
        allowNull: true
    }

},{
    tableName: 'SwiftsurePositions',
    timestamps: false
});
// ( async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     const allRaceData = {}
//     for(urlIndex in legacyUrls){
//         var currentRaceUrl = legacyUrls[urlIndex]

//         await page.goto(currentRaceUrl, {timeout: 0, waitUntil: "networkidle0"})

//         var config = await page.evaluate(() => {
            
//             return config})

//             console.log('a')
//         var landmarkUrl = 'http://legacy.data.swiftsure.net/APIv1.0/FetchLandmarks?EventToken={$EVENTTOKEN$}&Callback=x&_1601566473313='.replace('{$EVENTTOKEN$}', config.eventToken)
//         var landmarkRequest = await axios.get(landmarkUrl)
//         var temp0 = landmarkRequest.data.substring(2)
//         var landmarkResult = JSON.parse(temp0.substring(0, temp0.length - 2))
//         config.landmarks = landmarkResult
//         config.raceUrl = currentRaceUrl
//         console.log(landmarkResult)
//         console.log('b')
//         var transponderUrl = 'http://legacy.data.swiftsure.net/APIv1.0/FetchEventTransponders?EventToken={$EVENTTOKEN$}&Callback=x&_1601566473327='.replace('{$EVENTTOKEN$}', config.eventToken)
//         var transponderRequest = await axios.get(transponderUrl)
      
//         var temp1 = transponderRequest.data.substring(2)
//         var result = JSON.parse(temp1.substring(0, temp1.length - 2))
//         var payload = result.payload
//         var tracks = {}
//         console.log('c')
//         for(payloadIndex in payload){
//             var p = payload[payloadIndex]
//             var code = p.ESN
//             tracks[code] = p

//             var trackUrl = "http://legacy.data.swiftsure.net/APIv1.0/FetchEventTrack?EventToken={$EVENTTOKEN$}&Data=%5B%22{$DEVICE$}%22%2C%22level%22%5D&Callback=x&_1601566743335=".replace('{$DEVICE$}', code).replace('{$EVENTTOKEN$}', config.eventToken)
//             var trackRequest = await axios.get(trackUrl)
//             var temp2 = trackRequest.data.substring(2)
//             var trackResult = JSON.parse(temp2.substring(0, temp2.length - 2))
//             p.track = trackResult
           
//         }

//         config.tracks = tracks
//         allRaceData[config.eventToken] = config
//     }

    // for(urlIndex in nonLegacyUrls){
    //     var currentRaceUrl = nonLegacyUrls[urlIndex]
    //     console.log(currentRaceUrl)
    //     await page.goto(currentRaceUrl, {timeout: 0, waitUntil: "networkidle0"})

    //     var config = await page.evaluate(() => {
            
    //         return config})

    //     console.log('x')
    //     var landmarkUrl = "http://data.swiftsure.net/JsonP_APIv1/{$EVENTTOKEN$}/landmarks?Callback=x&_1601569106033=".replace('{$EVENTTOKEN$}', config.eventToken)
    //     console.log(landmarkUrl)
    //     var landmarkRequest = await axios.get(landmarkUrl)
    //     var temp0 = landmarkRequest.data.substring(2)
    //     var landmarkResult = JSON.parse(temp0.substring(0, temp0.length - 2))
    //     config.landmarks = landmarkResult
    //     config.raceUrl = currentRaceUrl
    //     console.log('y')
    //     var transponderUrl = "http://data.swiftsure.net/JsonP_APIv1/{$EVENTTOKEN$}/transponders?Callback=x&_1601569106038=".replace('{$EVENTTOKEN$}', config.eventToken)
    //     console.log(transponderUrl)
    //     var transponderRequest = await axios.get(transponderUrl)
      
    //     var temp1 = transponderRequest.data.substring(2)
    //     var result = JSON.parse(temp1.substring(0, temp1.length - 2))
    //     var payload = result.payload
    //     var tracks = {}
    //     console.log('z')
    //     for(payloadIndex in payload){
    //         var p = payload[payloadIndex]
    //         var code = p.id
    //         tracks[code] = p
            
    //         var trackUrl = "http://data.swiftsure.net/JsonP_APIv1/{$EVENTTOKEN$}/track?rid={$DEVICE$}&Callback=x&_1601569355232=".replace('{$DEVICE$}', code).replace('{$EVENTTOKEN$}', config.eventToken)
    //         var trackRequest = await axios.get(trackUrl)
    //         var temp2 = trackRequest.data.substring(2)
    //         var trackResult = JSON.parse(temp2.substring(0, temp2.length - 2))
    //         p.track = trackResult
    //     }

    //     config.tracks = tracks
    //     allRaceData[config.eventToken] = config
    // }


  //  fs.writeFileSync('./allSwiftsureRaces.json', JSON.stringify(allRaceData) , 'utf-8'); 
//     page.close()
//     browser.close()
//     process.exit()
// })();


( async() => {
    var CONNECTED_TO_DB = false;
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        CONNECTED_TO_DB = true;

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit()
    }
    var text = fs.readFileSync('./allSwiftsureRaces.json', 'utf-8'); 
    var d = JSON.parse(text)
    var boatIds = {}

    for(keyIndex in Object.keys(d)) {
        var k = Object.keys(d)[keyIndex]
        var eventId = k
        var config = d[k]
    
        var thisRace = uuidv4()

        if(config.finBounds !== undefined){
            var fBN = config.finBounds.n
            var fBS = config.finBounds.s
            var fBE = config.finBounds.e
            var fBW = config.finBounds.w
        }else{
            var fBN = null
            var fBS = null
            var fBE = null
            var fBW = null
        }

        var newRace = {
            id: thisRace,
            original_id: eventId,
            default_facebook: config.defaultFacebook,
            welcome: config.welcome,
            race_start: config.raceStart,
            course_bounds_n: config.courseBounds.n,
            course_bounds_s: config.courseBounds.s,
            course_bounds_e: config.courseBounds.e,
            course_bounds_w: config.courseBounds.w,
            home_bounds_n: config.homeBounds.n,
            home_bounds_s: config.homeBounds.s,
            home_bounds_e: config.homeBounds.e,
            home_bounds_w: config.homeBounds.w,
            fin_bounds_n: fBN,
            fin_bounds_s: fBS,
            fin_bounds_e: fBE,
            fin_bounds_w: fBW,
            timezone: config.timeZone,
            track_type: config.trackType,
            event_type: config.eventType,
            update_interval: config.updateInterval,
            tag_interval: config.tagInterval,
            url: config.raceUrl
        }
    
        var sponsors = []
        var lines = []
        var marks = []
        var links = []
        var points = []
        for(lIndex in config.landmarks.payload){
            var l = config.landmarks.payload[lIndex]
            if (typeof l === 'string' || l instanceof String){
                var lm = JSON.parse(l)
            }else{
                var lm = l
            }
            
            if (typeof lm.data === 'string' || lm.data instanceof String){
                var data = JSON.parse(lm.data)
            
            }else{
                var data = lm.data
            }
            var id = uuidv4()
            var original_id = lm.id
            var name = lm.title
        
            if(data.type === 'point'){
                var point = {
                    id: id,
                    original_id: original_id,
                    race: thisRace,
                    race_original_id: k,
                    name: name,
                    lat: data.fix.lat,
                    lon: data.fix.lon
                }
                points.push(point)
            }

            if(data.type === 'mark'){
                if(data.fix !== undefined && data.fix!== null){
                    var mark = {
                        id: id,
                        original_id: original_id,
                        race: thisRace,
                        race_original_id: k,
                        name: name,
                        lat: data.fix.lat,
                        lon: data.fix.lon
                    }
                    marks.push(mark)
                }else{
                    var mark = {
                        id: id,
                        original_id: original_id,
                        race: thisRace,
                        race_original_id: k,
                        name: name,
                        lat: data.fix1.lat,
                        lon: data.fix1.lon
                    }
                    marks.push(mark)
                }
            }

            if(data.type === 'line'){
                var line = {
                    id: id,
                    original_id: original_id,
                    race: thisRace,
                    race_original_id: k,
                    name: name,
                    lat1: data.fix1.lat,
                    lon1: data.fix1.lon,
                    lat2: data.fix2.lat,
                    lon2: data.fix2.lon
                }
                lines.push(line)
            }

            if(data.type === 'sponsor'){
                if(data.fix !== undefined && data.fix!== null){
                    var sponsor = {
                        id: id,
                        original_id: original_id,
                        race: thisRace,
                        race_original_id: k,
                        name: name,
                        lat: data.fix.lat,
                        lon: data.fix.lon,
                        url: data.url
                    }
                    sponsors.push(sponsor)
                }else{
                    var sponsor = {
                        id: id,
                        original_id: original_id,
                        race: thisRace,
                        race_original_id: k,
                        name: name,
                        lat: data.fix1.lat,
                        lon: data.fix1.lon,
                        url: data.url
                    }
                    sponsors.push(sponsor)
                }
            
            }

            if(data.type === 'link'){
                var link = {
                    id: id,
                    original_id: original_id,
                    race: thisRace,
                    race_original_id: k,
                    name: name,
                    lat: data.fix1.lat,
                    lon: data.fix1.lon,
                    url: data.url
                }
                links.push(link)
            }
        }
    
        var boats = []
        var positions = []
        

        for(tkIndex in Object.keys(config.tracks)) {
            var tKey = Object.keys(config.tracks)[tkIndex]
            var boat = config.tracks[tKey]

            if(boat.ESN !== null && boat.ESN !== undefined) {

                var boat_meta = JSON.parse(boat.m) // data keys: yc, Make,  LOA, hp, sk, email
    
                if(boatIds[boat.ESN] === null || boatIds[boat.ESN] === undefined){
                    boatIds[boat.ESN] = uuidv4()
                }
              
                var newBoat = {
                    id: uuidv4(),
                    boat_id: boatIds[boat.ESN],
                    original_id: boat.ESN,
                    race: thisRace,
                    race_original_id: eventId,
                    boat_name: null,
                    api_2_id: null,
                    team_name: boat.nm,
                    division: boat.d,
                    yacht_club: boat_meta.yc,
                    make: boat_meta.Make,
                    loa: boat_meta.LOA,
                    home_port: boat_meta.hp,
                    skipper: boat_meta.sk,
                    skipper_email: boat_meta.email,
                    fbid: null,
                    race_sort: boat_meta.race_sort,
                    start_time: boat.race_start_time,
                    num_crew: null,
                    scoring: boat.scoring,
                    short_title: boat.short_title,
                    rate: boat.rate
                }

                boats.push(newBoat)


                boat.track.payload.forEach(pos => {
                    var position = {
                        id: uuidv4(),
                        race: thisRace,
                        race_original_id: eventId,
                        boat: newBoat.id,
                        boat_original_id: newBoat.original_id,
                        timestamp: pos.ts,
                        lat: pos.lt,
                        lon: pos.ln, 
                        speed: pos.s,
                        heading: pos.h,
                        stat: pos.stat,
                        dtg: pos.dtg
                    }
                    positions.push(position)
                })

            }else {
    
                
                if(boatIds[boat.uid] === null || boatIds[boat.uid] === undefined){
                    boatIds[boat.uid] = uuidv4()
                }
                var boat_meta = boat.reg_meta
     
                var newBoat = {
                    id: uuidv4(),
                    boat_id: boatIds[boat.uid],
                    original_id: boat.uid,
                    race: thisRace,
                    race_original_id: eventId,
                    boat_name: boat_meta.vl_name,
                    api_2_id: boat.id,
                    team_name: boat.name,
                    division: boat.div,
                    yacht_club: boat_meta.yc,
                    make: boat_meta.make,
                    loa: boat_meta.loa,
                    home_port: null,
                    skipper: boat_meta.skipper,
                    skipper_email: boat_meta.email,
                    fbid: boat_meta.fbid,
                    race_sort: boat_meta.race_sort,
                    start_time: boat.race_start_time,
                    num_crew: boat_meta.no_crew,
                    scoring: boat.scoring,
                    short_title: boat.short_title,
                    rate: boat.rate
                }
                boats.push(newBoat)
                boat.track.payload.forEach(pos => {
                    var position = {
                        id: uuidv4(),
                        race: thisRace,
                        race_original_id: eventId,
                        boat: newBoat.id,
                        boat_original_id: newBoat.original_id,
                        timestamp: pos.ts,
                        lat: pos.lt,
                        lon: pos.ln, 
                        speed: pos.s,
                        heading: pos.h,
                        stat: pos.stat,
                        dtg: pos.dtg
                    }
                    positions.push(position)
                })
                
            }
        
        }

        var t = await sequelize.transaction()
        try{
            
         
            await SwiftsureRace.create(newRace, {fields:Object.keys(newRace)})
            if(boats.length > 0){
                await SwiftsureBoat.bulkCreate(boats, {fields:Object.keys(boats[0])})
            }
            if(lines.length > 0){
                await SwiftsureLine.bulkCreate(lines, {fields:Object.keys(lines[0])})
            }
            if(links.length > 0){
                await SwiftsureLink.bulkCreate(links, {fields:Object.keys(links[0])})
            }
            if(marks.length > 0){
                await SwiftsureMark.bulkCreate(marks, {fields:Object.keys(marks[0])})
            }
            if(points.length > 0){
                await SwiftsurePoint.bulkCreate(points, {fields:Object.keys(points[0])})
            }
            if(sponsors.length > 0){
                await SwiftsureSponsor.bulkCreate(sponsors, {fields:Object.keys(sponsors[0])})
            }
            if(positions.length > 0){
                await SwiftsurePosition.bulkCreate(positions, {fields:Object.keys(positions[0])})
            }
            
            await t.commit() 
        }catch(err){
            await t.rollback()
            console.log(err)
        }
    }

})();

