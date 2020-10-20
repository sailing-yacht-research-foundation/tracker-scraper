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

const DB_URL = process.env.DB_URL || 'regatta-data-map.cluster-cfiwyruwalfl.us-east-1.rds.amazonaws.com'
const DB_PW = process.env.DB_PW || 'loch-ova-pauper-premise'

const sequelize = new Sequelize('sources', 'administrator', DB_PW, {
    host: DB_URL,
    dialect: 'postgres'
});

const TackTrackerMetadata = sequelize.define('TackTrackerMetadata', {
    // Model attributes are defined here
    base_race_api_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    base_user_race_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    base_regatta_race_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    tableName: 'TackTrackerMetadatas',
    timestamps: false
});

const TackTrackerRegatta = sequelize.define('TackTrackerRegatta', {
    // Model attributes are defined here
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    original_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    tableName: 'TackTrackerRegattas',
    timestamps: false
});

const TackTrackerDefault = sequelize.define('TackTrackerDefault',{
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    lon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    trim: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: 'TackTrackerDefaults',
    timestamps: false
})

const TackTrackerFinish = sequelize.define('TackTrackerFinish',{
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    finish_mark_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_mark_lat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_mark_lon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_mark_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_pin_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_pin_lat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_pin_lon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_pin_type: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: 'TackTrackerFinishes',
    timestamps: false
})

const TackTrackerStart = sequelize.define('TackTrackerStart',{
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    start_mark_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_mark_lat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_mark_lon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_mark_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_pin_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_pin_lat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_pin_lon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_pin_type: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: 'TackTrackerStarts',
    timestamps: false
})

const TackTrackerMark = sequelize.define('TackTrackerMark', {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    lon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: 'TackTrackerMarks',
    timestamps: false
})

const TackTrackerRace = sequelize.define('TackTrackerRace', {
    // Model attributes are defined here
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    original_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    regatta: {
        type: DataTypes.UUIDV4,
        allowNull: true
    },
    user: {
        type: DataTypes.UUIDV4,
        allowNull: true
    },
    regatta_original_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_original_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    finish_at_start: {
        type: DataTypes.STRING,
        allowNull: true
    },
    span: {
        type: DataTypes.STRING,
        allowNull: true
    },
    course:  {
        type: DataTypes.STRING,
        allowNull: true
    },
    event_notes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    course_notes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    upload_params: {
        type: DataTypes.STRING,
        allowNull: true
    }
  }, {
    tableName: 'TackTrackerRaces',
    timestamps: false
});

const TackTrackerUser = sequelize.define('TackTrackerUser', {
    // Model attributes are defined here
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
  }, {
    tableName: 'TackTrackerUsers',
    timestamps: false
});

const TackTrackerPosition = sequelize.define('TackTrackerPosition',{
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    boat: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lon: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'TackTrackerPositions',
    timestamps: false
})

const TackTrackerBoat = sequelize.define('TackTrackerBoat', {
    // Model attributes are defined here
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: false
    },
    details: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unknown_1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unknown_2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unknown_3: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unknown_4: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unknown_5: {
        type: DataTypes.STRING,
        allowNull: true
    },
    unknown_6: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
  }, {
    tableName: 'TackTrackerBoats',
    timestamps: false
});

const TackTrackerSuccessfulUrl = sequelize.define('TackTrackerSuccessfulUrl', {
    // Model attributes are defined here
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    race: {
        type: DataTypes.UUIDV4,
        allowNull: true
    },
    regatta: {
        type: DataTypes.UUIDV4,
        allowNull: true
    },
    user: {
        type: DataTypes.UUIDV4,
        allowNull: true
    },
    date_attempted: {
        type: DataTypes.STRING,
        allowNull: false
    },
  }, {
    tableName: 'TackTrackerSuccessfulUrls',
    timestamps: false
});


( async() => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        CONNECTED_TO_DB = true;
    
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit()
    }

//     // Get "tracked urls". These usually use TackTracker for their tracking.

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
   
//     await page.goto("http://new.sailracer.org/ResultsEntry/Tracking", {timeout: 0, waitUntil: "networkidle0"})

//     var eventSites = await page.evaluate(() => {
//         var urls = []
//         document.querySelectorAll('body > div:nth-child(5) > div.large-12.medium-16.small-16.columns > div > div > div > p > a').forEach(v => {
//             urls.push(v.href)
//         })
//         return urls
//     })

//     console.log('Getting eventSites')
//     var tackTrackerUrls = []
   
//     for(eventSiteIndex in eventSites){
//         try{
//             var siteUrl = eventSites[eventSiteIndex]
//             await page.goto(siteUrl, { waitUntil: 'domcontentloaded'})
//             await page.waitForFunction("document.querySelector('#tracking > iframe') !== null", {timeout: 600000})
//             var tackTrackerUrl = await page.evaluate(() => {
//                 if(document.querySelector('#tracking > iframe') !== null && document.querySelector('#tracking > iframe') !== undefined){
//                     return document.querySelector('#tracking > iframe').src
//                 }else{
//                     return null
//                 }
//             })
            
//             if(tackTrackerUrl !== null){
//                 tackTrackerUrls.push(tackTrackerUrl)
//                 console.log(tackTrackerUrl)
//             }
//         }catch(err){
//             console.log(err)
//             console.log(eventSites[eventSiteIndex])
//         }
        
//     }

//     console.log('Getting eventSites 2')
//     var two_thousand = 2000
//     var year = 1
//     var eventIds = []
//     while(year <= 20){

//         var currentYear = two_thousand + year
//         await page.goto("http://new.sailracer.org/ResultsEntry/Event?pcode=&clss=Class&year=" + currentYear.toString(), {timeout: 0, waitUntil: "networkidle0"})

//         var eventIdSites = await page.evaluate(() => {
//             var urls = []
//             document.querySelectorAll('#searchresults > table > tbody > tr > td:nth-child(4) > a').forEach(v => {
//                 urls.push(v.href)
//             })
//             return urls
//         })

//         for(eventIndex in eventIdSites){
//             var str = eventIdSites[eventIndex]
//             eventIds.push(str.split('/')[5])
//         }

//         year += 1
//     }

//     console.log('Getting tracker sites')
//     for(eventIndex in eventIds){
//         try{
//             var eventId = eventIds[eventIndex]
//             await page.goto("http://selden.sailracer.org/eventsites/live-screen-tracking.asp?eventid=" + eventId, {waitUntil: 'domcontentloaded'})
//             var trackerUrls = await page.evaluate(() =>{
//                 var urls = []
//                 document.querySelectorAll('#StatusBar > li >  ul > li  > a').forEach(v=> {
//                     v.click()
//                     if(document.querySelector('#tracking > iframe') !== null && document.querySelector('#tracking > iframe') !== undefined){
//                         urls.push(document.querySelector('#tracking > iframe').src)
//                     }
//                 })

//                 return urls
//             })
//             tackTrackerUrls = tackTrackerUrls.concat(trackerUrls)
//         }catch(err){
//             console.log(err)
//             console.log(eventIds[eventIndex])
//         }
        
//     }   
    
//     tackTrackerUrls.forEach(u =>{
//         console.log(u)
//     })
//    // await page.goto("http://new.sailracer.org/ResultsEntry/Club", {timeout: 0, waitUntil: "networkidle0"})


//    page.close()
//    browser.close()
//    process.exit()
   
var race_ids = ["773219498",
"1471124150",
"1632051083",
"1900411994",
"1565185088",
"603350253",
"584272846",
"1873838595",
"1002318359",
"2073533030",
"2120285184",
"1317444858",
"2092476392",
"625611026",
"899392366",
"1962450594",
"823463000",
"2044268782",
"819741084",
"1533430374",
"1322301503",
"674779699",
"1339839263",
"2050847267",
"356970618",
"471997938",
"2062970313",
"128216540",
"609346498",
"10617943",
"1486936670",
"2039851694",
"259411906",
"538971056",
"1457954593",
"159486952",
"505728504",
"573542732",
"460935695",
"753661426",
"742387938",
"1991349842",
"372271790",
"842657140",
"1973000315",
"1099824243",
"337136081",
"1470789160",
"620422284",
"1541630037",
"1236395443",
"1103608931",
"1890186587",
"1575047336",
"1614812602",
"919393703",
"127525757",
"32033894",
"1777228",
"421704880",
"1550714804",
"1861138617",
"762387024",
"423347133",
"274196692",
"178829983",
"2080852901",
"344893306",
"1611438950",
"767755131",
"647933646",
"442325343",
"1001834396",
"1217158167",
"452259641",
"1401218772",
"275214165",
"1280846077",
"1753706639",
"36254910",
"70885085",
"1125685632",
"204359996",
"1657384412",
"330521773",
"183896030",
"709655106",
"740392419",
"724368379",
"1585029036",
"1740911354",
"2040737950",
"1556508669",
"1199174541",
"850173367",
"1077482410",
"1038626080",
"1761014011",
"178158087",
"1797408683",
"126914445",
"1798314350",
"181156130",
"1972382526",
"1467941833",
"704168472",
"867420250",
"2017975243",
"257486053",
"2108333754",
"821210446",
"1080669603",
"9220203",
"1043850784",
"1479548165",
"176309203",
"1850875957",
"239240213",
"1307194748",
"275739246",
"1490770537",
"805322705",
"1843901028",
"684983802",
"241684776",
"1311596647",
"793557734",
"1325091317",
"1807540781",
"732062952",
"1276380022",
"251634513",
"347588049",
"292154355",
"1698629626",
"1360807066",
"1670557369",
"171642044",
"790679114",
"1745828270",
"1754855722",
"1534129770",
"1354567113",
"1652095490",
"318268656",
"1611632043",
"1730501152",
"1622290114",
"1293234927",
"1337250596",
"564463302",
"1715150546",
"323571471",
"691945010",
"1608191330",
"1326708330",
"1555014797",
"791009257",
"838601824",
"380880780",
"1236101215"]
        
       
        console.log('Getting list of existing race ids..')
        var racesToIgnore = await TackTrackerRace.findAll({
            where: {
                original_id:{
                    [Sequelize.Op.in]:race_ids
                }
            }
        })

        var raceIdsToIgnore = []
        for(ignoreIndex in racesToIgnore){
            raceIdsToIgnore.push(racesToIgnore[ignoreIndex].original_id)
        }
        console.log('Finished getting list of existing race ids.')
        var todays_date = new Date()
        for(raceIdIndex in race_ids){
            console.log('Beginning parsing new race.')
            var race_id = race_ids[raceIdIndex]
            console.log(race_id)
            if(raceIdsToIgnore.includes(race_id)){
                console.log('This race was already scraped, so I\'ll skip it.')
                continue
            }
            try{
                var raceFormData = new FormData();
                raceFormData.append('raceId', race_id);
                raceFormData.append('viewer','web')

                var raceRequest = await axios({
                    method: 'post',
                    responseType: 'arraybuffer',
                    url: 'https://tacktracker.com/cloud/service/race_ttz/get',
                    data: 'raceid=' + race_id + '&viewer=web',
                    headers: {'Host': 'tacktracker.com',
                    'Accept': '*/*',
                    'Origin': 'https://tacktracker.com',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-encoding': 'gzip',
                    Cookie: 'tt8473=am6o0qdv2cq5vs6iq51mqld032e01irr; _ga=GA1.2.2066055595.1588439443; _gid=GA1.2.1935310269.1588439443; _gat=1',
                    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36'
                    }
                })
                console.log('Obtained race data.')
                var race_data_xml = await (await ungzip(raceRequest.data)).toString();
                var race_data_sanitized = race_data_xml.replace(/ & /g, 'and')
            
                var race_data_json = JSON.parse(parser.toJson(race_data_sanitized)).Ttx;
                console.log('Unzipped race data.')
                var creator = race_data_json.creator
                var version = race_data_json.version
                var trackCount = race_data_json.count
                var evtData = race_data_json.evtdata
            
                if(race_data_json.EventData === undefined){
                    continue
                }
                var eventData = race_data_json.EventData.TackTracker.Event
                var trackData = race_data_json.TrackData


                // Race data
                //race_id
                var raceUrl = "http://tacktracker.com/cloud/races/embedlive/" + race_id

                var newRaceId = uuidv4()

               

                // Races either belong to a regatta or a user.
                var userOriginalId = 'SailRacer'

                var start = eventData.Start
                var date = new Date(Date.parse(start))
                if(date >= todays_date){
                    console.log('We only want races that are over.')
                    continue;
                }
                var eventNotes = eventData.EventNotes
                var courseNotes = eventData.CourseNotes
                var uploadParams = eventData.UploadParms
                var state = race_data_json.state
                var eventName = race_data_json.event
                var type = eventData.Type
                var finishAtStart = eventData.FinishAtStart
                var span = eventData.Span
                var course = eventData.Course
    
                await TackTrackerRace.create({
                    id: newRaceId,
                    original_id: race_id,
                    url: raceUrl,
                    regatta: null,
                    user: null,
                    regatta_original_id: null,
                    user_original_id: userOriginalId,
                    start: start,
                    state: state,
                    name: eventName,
                    type: type,
                    finish_at_start: finishAtStart,
                    span: span,
                    course: JSON.stringify(course),
                    event_notes: JSON.stringify(eventNotes),
                    course_notes: JSON.stringify(courseNotes),
                    upload_params: JSON.stringify(uploadParams)

                },{
                    fields:['id', 'original_id', 'url', 'regatta', 'user', 'regatta_original_id', 'user_original_id', 'start', 'state', 'name', 'type', 'span', 'course', 'event_notes','course_notes', 'upload_params']
                })
                
                console.log('Added new race to DB.')

                var defaults = eventData.Defaults
                await TackTrackerDefault.create({
                    id:uuidv4(),
                    race: newRaceId,
                    lon: defaults.lon,
                    lat: defaults.lat,
                    color: defaults.color,
                    trim: defaults.trim
                })
                if(eventData.StartMark !== undefined){
                    var startMark = eventData.StartMark.Mark
                    var startPin = eventData.StartPin.Mark
                    await TackTrackerStart.create({
                        id: uuidv4(),
                        race: newRaceId,
                        start_mark_name: startMark.Name,
                        start_mark_lat: startMark.Lat,
                        start_mark_lon: startMark.Lon,
                        start_mark_type: startMark.Type,
                        start_pin_name: startPin.Name,
                        start_pin_lat: startPin.Lat,
                        start_pin_lon: startPin.Lon,
                        start_pin_type: startPin.Type
                    })
                }
                
                if(eventData.FinishMark !== undefined){
                    var finishMark = eventData.FinishMark.Mark
                    var finishPin = eventData.FinishPin.Mark
                    await TackTrackerFinish.create({
                        id: uuidv4(),
                        race: newRaceId,
                        finish_mark_name: finishMark.Name,
                        finish_mark_lat: finishMark.Lat,
                        finish_mark_lon: finishMark.Lon,
                        finish_mark_type: finishMark.Type,
                        finish_pin_name: finishPin.Name,
                        finish_pin_lat: finishPin.Lat,
                        finish_pin_lon: finishPin.Lon,
                        finish_pin_type: finishPin.Type
                    })
                }
    
                if(eventData.Marks !== undefined && eventData.Marks.Mark !== undefined){
                    var marks = eventData.Marks.Mark
                    var marks_array = []
                    for(marksIndex in marks){
                        var m = {
                            id:uuidv4(),
                            name: JSON.stringify(marks[marksIndex].Name),
                            race: newRaceId,
                            lon: marks[marksIndex].Lon,
                            lat: marks[marksIndex].Lat,
                            type: marks[marksIndex].Type
                        }

                        marks_array.push(m)
                    }
                
                    await TackTrackerMark.bulkCreate(marks_array,{
                        fields:['id', 'name', 'race', 'lon', 'lat', 'type']
                    })
                }
    
                if(eventData.Marks !== undefined && eventData.Marks.GateMark !== undefined ){
                    var marks = eventData.Marks.GateMark
                    var marks_array = []
                    // Annoyingly, this could be an array of dicts or a dict.
                    if(marks.constructor != Object){
                        for(marksIndex in marks){
                            // always 3
                            
                            var m0 = {
                                id:uuidv4(),
                                name: JSON.stringify((marks[marksIndex].Mark)[0].Name),
                                race: newRaceId,
                                lon: marks[marksIndex].Mark[0].Lon,
                                lat: marks[marksIndex].Mark[0].Lat,
                                type: marks[marksIndex].Mark[0].Type
                            }
                            var m1 = {
                                id:uuidv4(),
                                name: JSON.stringify(marks[marksIndex].Mark[1].Name),
                                race: newRaceId,
                                lon: marks[marksIndex].Mark[1].Lon,
                                lat: marks[marksIndex].Mark[1].Lat,
                                type: marks[marksIndex].Mark[1].Type
                            }
                            var m2 = {
                                id:uuidv4(),
                                name: JSON.stringify(marks[marksIndex].Mark[2].Name),
                                race: newRaceId,
                                lon: marks[marksIndex].Mark[2].Lon,
                                lat: marks[marksIndex].Mark[2].Lat,
                                type: marks[marksIndex].Mark[2].Type
                            }
        
                            marks_array.push(m0)
                            marks_array.push(m1)
                            marks_array.push(m2)
                        }
                    } else {
                        
                        var m0 = {
                            id:uuidv4(),
                            name: JSON.stringify((marks.Mark)[0].Name),
                            race: newRaceId,
                            lon: marks.Mark[0].Lon,
                            lat: marks.Mark[0].Lat,
                            type: marks.Mark[0].Type
                        }
                        var m1 = {
                            id:uuidv4(),
                            name: JSON.stringify(marks.Mark[1].Name),
                            race: newRaceId,
                            lon: marks.Mark[1].Lon,
                            lat: marks.Mark[1].Lat,
                            type: marks.Mark[1].Type
                        }
                        var m2 = {
                            id:uuidv4(),
                            name: JSON.stringify(marks.Mark[2].Name),
                            race: newRaceId,
                            lon: marks.Mark[2].Lon,
                            lat: marks.Mark[2].Lat,
                            type: marks.Mark[2].Type
                        }

                        marks_array.push(m0)
                        marks_array.push(m1)
                        marks_array.push(m2)
                    }
                    await TackTrackerMark.bulkCreate(marks_array,{
                        fields:['id', 'name', 'race', 'lon', 'lat', 'type']
                    })
                }
                
                for(dataIndex in trackData){
                    var track = trackData[dataIndex].gpx
                    if(track === undefined){
                    track = trackData[dataIndex]
                    }
                    var trackeeData = track.metadata.extensions.trackee.split('-')
                    
                    var boat_id = uuidv4();
                    await TackTrackerBoat.create({
                        id: boat_id,
                        race: newRaceId,
                        details: trackeeData[1],
                        color: trackeeData[2],
                        unknown_1: trackeeData[3],
                        unknown_2: trackeeData[4],
                        unknown_3: trackeeData[5],
                        unknown_4: trackeeData[6],
                        unknown_5: trackeeData[7],
                        unknown_6: trackeeData[8],
                        name: trackeeData[0]
                    },{
                        fields:['id', 'race','details','color', 'unknown_1','unknown_2','unknown_3', 'unknown_4', 'unknown_5', 'unknown_6', 'name']
                    })

            
                    var data = track.trk.trkseg.trkpt
                
                    var positions = []
                    for(positionIndex in data){
                        var positionData = data[positionIndex]
                        var position = {
                            id: uuidv4(),
                            boat: boat_id,
                            race: newRaceId,
                            time: positionData.time,
                            lat: positionData.lat,
                            lon: positionData.lon
                        }
                        positions.push(position)
                    }
                    await TackTrackerPosition.bulkCreate(positions,{
                        fields:['id', 'boat', 'race', 'time', 'lon', 'lat']
                    })
                }
            }catch(err){
                console.log(race_id)
                console.log(err)
            }
            
        }
    



})();