const {TracTrac, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');




// Get all events.
( async () => {
    await connect()
    var existingObjects = await findExistingObjects(TracTrac)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const formatAndSaveRace = function(event, raceDetails){
        let racesToSave = []
        let classesToSave = []
        let raceClassesToSave = []
        let controlsToSave = []
        let controlPointsToSave = []
        let controlPointPositionsToSave = []
        let routesToSave = []

        let competitorsToSave = []
        let competitorPassingsToSave = []
        let competitorResultsToSave = []
        let competitorPositionsToSave = []
      

        let raceObj = instantiateOrReturnExisting(existingObjects, TracTrac.Race, raceDetails.race.id)
        let raceObjSave = raceObj.obj

        if(raceObj.shouldSave){
            // Default we expect event to be null because club races have clubs not events.
            raceObjSave.event = null
            raceObjSave.event_original_id = null
            raceObjSave.name = raceDetails.race.name
            raceObjSave.url = raceDetails.race.url_html
            raceObjSave.tracking_start = raceDetails.race.tracking_starttime
            raceObjSave.tracking_stop = raceDetails.race.tracking_endtime
            raceObjSave.race_start = raceDetails.race.race_starttime
            raceObjSave.race_end = raceDetails.assorted.endtime
            raceObjSave.status = raceDetails.race.status
            raceObjSave.lon = raceDetails.race.lon
            raceObjSave.lat = raceDetails.race.lat
            raceObjSave.calculated_start_time = raceDetails.assorted.calculated_start_time
            raceObjSave.race_handicap = raceDetails.assorted.p_race_handicap
        }else{
            console.log('Already saved so skipping.')
            return null
        }
        if(event !== null){
            raceObjSave.event = event.id
            raceObjSave.event_original_id = event.original_id
        }
        racesToSave.push(raceObjSave)
        let raceClassesByClassId = {}
        Object.values(raceDetails.assorted.classes).forEach(c => {
           
            let cl = instantiateOrReturnExisting(existingObjects, TracTrac.Class, c.UUID)
            if(cl.shouldSave){
                cl.obj.name = c.Name
                classesToSave.push(cl.obj)
            }
            let rc = {id:uuidv4(), race:raceObjSave.id, boat_class:cl.obj.id}
            raceClassesByClassId[cl.obj.id] = rc
            raceClassesToSave.push(rc)
        })
        
        raceDetails.assorted.routes.forEach(r => {
            let routeObj = instantiateOrReturnExisting(existingObjects, TracTrac.Route, r.route_id)
            let routeObjSave = routeObj.obj
            routeObjSave.race = raceObjSave.id
            routeObjSave.race_original_id = raceObjSave.original_id
            routeObjSave.name = r.route_name
            if(routeObj.shouldSave){
                routesToSave.push(routeObjSave)
            }
            

            r.controls.forEach( c => {
                let ctrl = instantiateOrReturnExisting(existingObjects, TracTrac.Control, c.original_id)
                let controlObjSave = ctrl.obj
                if(ctrl.shouldSave){
                    controlObjSave.race = raceObjSave.id
                    controlObjSave.race_original_id = raceObjSave.original_id
                    controlObjSave.name = c.name
                    controlObjSave.route = routeObjSave.id
                    controlObjSave.route_original_id = routeObjSave.original_id

                    controlsToSave.push(controlObjSave)


                    c.control_points.forEach(control_pt => {
                
                        let c_p = {id: uuidv4(), race: raceObjSave.id, race_original_id: raceObjSave.original_id, name: control_pt.control_name, route:routeObjSave.id, route_original_id: routeObjSave.original_id, 
                        control:controlObjSave.id, control_original_id: controlObjSave.original_id }
                        controlPointsToSave.push(c_p)

                        control_pt.positions.forEach(p => {
                            let ctlpt_position = {id: uuidv4(), race:raceObjSave.id, race_original_id:raceObjSave.original_id, route:routeObjSave.id, route_original_id:routeObjSave.original_id,
                                controlpoint:c_p.id, controlpoint_original_id:c_p.original_id, lat:p.latitude, lon:p.longitude, height:p.height, speed:p.speed, direction:p.direction, m:p.m, timestamp:p.timestamp, speed_avg:JSON.stringify(p.speedAvg)
                            }
                            controlPointPositionsToSave.push(ctlpt_position)
                        
                        })
        
                    })
                }
                
            })
        })


        raceDetails.competitors_params.forEach(c => {
          
            // This is created manually since the competitor original id is not unique.
            let competitor = {id: uuidv4(), original_id:c.uuid, race:null, race_original_id:null, 
                class:null,
                class_original_id:null,
                classrace_id:null,
                class_name:null,
                description:null,
                handicap:null,
                handicap_distance:null,
                start_time:null,
                finish_time:null,
                stop_time:null,
                status_original_id:null,
                status_full:null,
                status_time:null,
                first_name:null,
                last_name:null,
                name:null,
                short_name:null,
                name_alias:null,
                short_alias:null,
                nationality:null,
                non_competing:null,
                handicap_tod:null,
                handicap_tot:null}
            
            competitor.race = raceObjSave.id
            competitor.race_original_id = raceObjSave.original_id
            let cl = instantiateOrReturnExisting(existingObjects, TracTrac.Class, c.classId).obj
            competitor.class  = cl.id
            competitor.class_original_id = cl.original_id
            competitor.classrace_id = raceClassesByClassId[cl.id].id
            competitor.class_name = cl.name
            competitor.description = c.description 
            competitor.handicap = c.handicap
            competitor.handicap_distance = c.handicapDistance
            competitor.nationality = c.nationality
            competitor.non_competing = c.nonCompeting
            
            raceDetails.competitors_race.forEach(cr => {
                if(cr.id === competitor.original_id){

                    competitor.start_time = cr.startTime
                    competitor.finish_time = cr.finishTime
                    competitor.stop_time = cr.stopTime
                    competitor.status_original_id = cr.statusId
                    competitor.status_full = cr.statusFull
                    competitor.status_time = cr.statusTime
                    competitor.first_name = cr.firstName
                    competitor.last_name = cr.lastName
                    competitor.name = cr.name
                    competitor.short_name = cr.shortName
                    competitor.name_alias = cr.nameAlias
                    competitor.short_alias = cr.shortAlias
                    competitor.handicap_tod = cr.handicapToD
                    competitor.handicap_tot = cr.handicapToT
                }
            })

            competitorsToSave.push(competitor)
          
            let found = false
            raceDetails.team_position_data.forEach(tpd => {

                if(tpd.competitor_id === competitor.original_id && ! found){
                   found = true

                    let competitorResult = {
                        id:uuidv4(),
                        race: raceObjSave.id,
                        race_original_id: raceObjSave.original_id,
                        competitor: competitor.id,
                        competitor_original_id: competitor.original_id,
                        time_elapsed: tpd.time_elapsed,
                        start_time: tpd.start_time,
                        stop_time: tpd.stop_time,
                        finish_time: tpd.finish_time,
                        status: tpd.status.code,
                        team_name: tpd.team
                    }
                    competitorResultsToSave.push(competitorResult)

                    if(tpd.passings !== null && tpd.passings !== undefined){
                        tpd.passings.forEach(p => {
                           
                            
                            let ctl = instantiateOrReturnExisting(existingObjects, TracTrac.Control, p.controlId).obj


                            let passing = {id: uuidv4(), race: raceObjSave.id, race_original_id: raceObjSave.original_id, 
                                competitor:competitor.id, competitor_original_id: competitor.original_id, control:ctl.id, control_original_id:ctl.original_id, 
                                passing_time: p.passingTime, real_passing_time: p.realPassingTime, pos:p.pos, time_from_start:p.timeFromStart}

                            competitorPassingsToSave.push(passing)

                        })
                    }

                    if(tpd.positions !== null && tpd.positions !== undefined){

                        tpd.positions.forEach(pos => {
                            
                            let position = {id:uuidv4(), race: raceObjSave.id, race_original_id: raceObjSave.original_id, 
                            competitor:competitor.id, competitor_original_id:competitor.original_id, lat:pos.latitude, lon:pos.longitude, 
                            height: pos.height, speed: pos.speed, m:pos.m, direction:pos.direction, timestamp:pos.timestamp, speed_avg: JSON.stringify(pos.speedAvg) }

                            competitorPositionsToSave.push(position)

                        })
                    }
                   
                }
            })

        })


        return {
            racesToSave,
            classesToSave,
            raceClassesToSave,
            controlsToSave,
            controlPointsToSave,
            controlPointPositionsToSave,
            routesToSave,
            competitorsToSave,
            competitorPassingsToSave,
            competitorResultsToSave,
            competitorPositionsToSave
        }
    }

    const parseRace =  async function(race) { 
        console.log('w')
        let raceMeta = race
      
        /**
                 * race:
                 *  params_url:
   'http://event.tractrac.com/events/event_20201009_SwedishSLM/clientparams.php?event=event_20201009_SwedishSLM&race=a10e8b10-eb7f-0138-b48a-60a44ce903c3&random=1415477511',
  url_html:
   'https://live.tractrac.com/viewer/index.html?target=https://em.event.tractrac.com/events/d2a0e010-a320-0138-c48f-60a44ce903c3/races/a10e8b10-eb7f-0138-b48a-60a44ce903c3.json',
  url_mobile:
   'https://live.tractrac.com/viewer/count_down.html?event_id=d2a0e010-a320-0138-c48f-60a44ce903c3&event_name=Swedish SL- Mästarnas Mästare Marstrand&race_name=Grund  1&publish_time=&server_url=em.event.tractrac.com&web_id=1910&race_id=a10e8b10-eb7f-0138-b48a-60a44ce903c3&race_web_id=21',
  url_scheme:
   'tractrac://open.app/1910/a10e8b10-eb7f-0138-b48a-60a44ce903c3',
  params_json:
   'https://em.event.tractrac.com/events/d2a0e010-a320-0138-c48f-60a44ce903c3/races/a10e8b10-eb7f-0138-b48a-60a44ce903c3.json',
  id: 'a10e8b10-eb7f-0138-b48a-60a44ce903c3',
  name: 'Grund  1',
  tracking_starttime: '2020-10-10 09:15:47',
  tracking_endtime: '2020-10-10 09:35:38',
  race_starttime: '2020-10-10 09:16:00',
  expected_race_startdate: '2020-10-10',
  map_publication_time: null,
  initialized: '1',
  status: 'UNOFFICIAL',
  status_time: '2020-10-10 09:35:38',
  visibility: 'REPLAY',
  classes: 'J/70',
  classes_list:
   [ { id: 'cdbf3ff0-eb7d-0138-b252-60a44ce903c3', name: 'J/70' } ],
  results_url: '',
  rerun: '',
  has_replay: false,
  metadata: '' 
   CLUB RACES HAVE LON LAT
}
                 */

                let start_date = new Date(raceMeta.tracking_starttime.split(' ')[0]).getTime()
                let end_date = new Date(raceMeta.tracking_endtime.split(' ')[0]).getTime()

                if(start_date > (new Date()).getTime() || end_date > (new Date()).getTime()){
                    console.log('Future race so skip it.')
                    return
                }


                // If raceMeta.has_club then the event_id is actually the club? original id.

                // params_json could be null and replaced with params_url. In that case, it may be a .txt file.
                // sample http://club.tractrac.com/events/event_20140410_TarifaSurf/1f149da0-26cd-0136-d122-10bf48d758ce.txt
                //console.log(raceMeta)
                // url_html is the race url to view.

                
                if(raceMeta.params_json !== undefined){
                    console.log('x')
                    let raceParamsRequest = await axios.get(raceMeta.params_json)
                    // This is HUGE
                    //console.log(Object.keys(raceParamsRequest.data))

                    /**
                     * [ 'parameters',
                        'dataservers',
                        'maps',
                        'classes',
                        'teams',
                        'competitors',
                        'controlPoints',
                        'routes',
                        'splits',
                        'eventId',
                        'eventName',
                        'eventAnalyticsName',
                        'eventDb',
                        'eventStartTime',
                        'eventEndTime',
                        'eventType',
                        'enableNotifier',
                        'notifierClient',
                        'eventTimezone',
                        'generateKmls',
                        'dbReplicaEnabled',
                        'highLoadEnabled',
                        'multipleDataservers',
                        'event_key',
                        'eventJSON',
                        'webId',
                        'raceId',
                        'raceName',
                        'raceStartTime',
                        'raceTrackingStartTime',
                        'raceTrackingEndTime',
                        'initialized',
                        'raceDefaultRouteUUID',
                        'raceHandicapSystem',
                        'onlineStatus',
                        'status',
                        'course_area',
                        'raceTimeZone' ]
                     */
                }else{
                    console.log('x2')
                    let raceParamsRequest = await axios.get(raceMeta.params_url)
                    
                    // TODO: Do I need this?
                    let lines = raceParamsRequest.data.split('\n')
                    let values = {}
                    lines.forEach(l => {
                        let kv = l.split(':')
                        if(kv.length > 0){
                            values[kv[0]] = kv[1]
                            
                        }
                    })
                }

                try{
                    console.log('y')
                    await page.goto(raceMeta.url_html, {waitUntil: "networkidle2"});
                    await page.waitForSelector('#time-control-play')
                    await page.click('#time-control-play')
                    await page.waitForSelector('#contTop > div > section.race')
                    let wait_for_fully_loaded = 'document.querySelector("#time-slider > div") != null && document.querySelector("#time-slider > div").style["width"] === "100%"'
                    let skip = false;
                    console.log('z')
                    await page.waitForFunction(wait_for_fully_loaded, {timeout:60000} ).catch(e => {
                        
                        // TODO: save as failed race
                        console.log('Skipping')
                        console.log(raceMeta.url_html)
                        skip = true;
                    })
                    console.log('z2')
                    if(!skip){
                        console.log('Loaded race, beginning to parse from website.')
                        console.log(raceMeta.url_html)
                        let race_details = await page.evaluate(() => {
                           let context = document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]][Object.keys(document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]])[0]]["context"]
                           let race = context["$component"]["raceData"]["race"]
                           let name = race["name"]
                           let original_id = race["id"]
                           let calculated_start_time = race["calculatedStartTime"]
                           let start_time = race["raceStartTime"]
                           let end_time = race["raceEndTime"]
                           let tracking_start_time = race["trackingStartTime"]
                           let tracking_end_time = race["trackingEndTime"]
                           let extent = race["extent"]
                           let time_zone = race["parameterSet"]["parameters"]["eventTimezone"]
                           let race_date_s = race["readableDate"]
                           let race_date_timestamp = race["notReadableDate"]
                           let classes = race["parameterSet"]["parameters"]["classes"]
                           let params = race["parameterSet"]["parameters"]["parameters"]
                           let routes = Object.values(race["routes"]).map(route => {
                               let route_name = route.name
                               let route_id = route.id
                               let controls = []
                               route.controls.forEach(c => {
                                   let original_id = c.id
                                   let name = c.name
    
                                   let control_points = []
                                   c.controlPoints.forEach(cp => {
                                      
                                       let control_id = cp.control.id
                                       let control_name = cp.control.name
                                       let positions = cp.positions.positions
                                       control_points.push({control_id, control_name, positions})
                                   })
                                   controls.push({original_id, name, control_points})
                               })
                               return {route_name, route_id, controls}
                               // Legs are all derrived values I think.
                            //    let legs = []
                            //    route.legs.forEach(l => {
    
                            //    })
                           })
                           console.log('z3')
                          
                           let p_event_id = race["parameterSet"]["parameters"]["eventId"]
                           let p_event_st = race["parameterSet"]["parameters"]["eventStartTime"]
                           let p_event_et = race["parameterSet"]["parameters"]["eventEndTime"]
                           let p_race_handicap = race["parameterSet"]["parameters"]["raceHandicapSystem"]
                           let p_web_id = race["parameterSet"]["parameters"]["webId"]
                           let p_course_area = race["parameterSet"]["parameters"]["course_area"]
    
                           let assorted = {params, classes, routes, extent, end_time, calculated_start_time, p_event_id, p_event_st, p_event_et, p_web_id, p_course_area, p_race_handicap}
    
                           let competitors_params = Object.values(race["parameterSet"]["parameters"]["competitors"])
    
                            let competitors_race = []
                            Object.values(race["raceCompetitors"]).forEach(c =>{
                                competitors_race.push({'classId':c.competitorClass.id, 'className':c.competitorClass.name, 'description':c.description, 
                                'finishTime':c.finishTime, 'firstName':c.firstName, 'handicapToD':c.handicapToD, 'handicapToT':c.handicapToT,
                                'id':c.id, 'lastName':c.lastName, 'name':c.name, 'nameAlias':c.nameAlias, 'nationality':c.nationality, 'nonCompeting':c.nonCompeting,
                                'boatName':c.properties.boatName, 'boatId':c.properties.boatId, 'shortAlias':c.shortAlias, 'shortName':c.shortName, 
                                'standingPos':c.standingPos, 'startTime':c.startTime, 'statusId':c.status.id, 'statusCodePointAt':c.statusCodePointAt, 
                                'statusName':c.statusName, 'statusDescription':c.statusDesc, 'statusFull':c.status.full, 'statusTime':c.statusTime, 'stopTime':c.stopTime
                                })
                            });
    
                           let team_position_data = Object.values(context["$component"]["raceData"]["resultItems"]).map( resultItem => {
    
                                   let positions = resultItem["positions"]["positions"]
                                   let team = resultItem["team"]["id"]
                                   let competitor_id = resultItem["id"]
                                   let short_name = resultItem["shortName"]
                                   let time_elapsed = resultItem["timeElapsed"]
                                   let start_time = resultItem["startTime"]
                                   let stop_time = resultItem["stopTime"]
                                   let finish_time = resultItem["finishTime"]
                                   let status = resultItem["status"]
    
                                   let passings = null
                                   if(resultItem["controlPassings"] !== null){
                                    passings = resultItem["controlPassings"].map(p => { return {controlId:p.control.id, passingTime:p.passingTime, realPassingTime:p.realPassingTime, pos:p.pos, timeFromStart:p.timeFromStart}})
                                  
                                   }
                                   
                                 
                                   let group_leader = resultItem["groupLeader"]
                                   let course_time_handicap = resultItem["courseTimeHandicap"]
                                   let start_line_analysis = resultItem["startLineAnalysis"]
    
    
                                    return {group_leader, competitor_id, course_time_handicap, start_line_analysis, positions, team, short_name, time_elapsed, start_time, stop_time, finish_time, status, passings}
    
                            });
    
                            return {competitors_params, 
                                competitors_race,
                                team_position_data, 
                                assorted, 
                                race_date_timestamp, 
                                name, 
                                original_id, 
                                calculated_start_time, 
                                start_time, 
                                end_time, 
                                tracking_start_time, 
                                tracking_end_time,
                                time_zone, 
                                race_date_s, 
                                race_date_timestamp}
                        })
                        console.log('Finished parse.')
                        race_details.race = raceMeta
                        return race_details
                    }else{
                        return null
                    }
                }catch(err){
                    await TracTrac.FailedUrl.create({id:uuidv4(), error:err.toString(), url:JSON.stringify(raceMeta.url_html)})
                    return null
                }
                
    }


    // Events and clubs are basically the same in this schema. So we need to check all races associated with an event or a club.
   let allEventsRequest = await axios.get('http://live.tractrac.com/rest-api/events.json')
   let allEvents = allEventsRequest.data.events
   
   let allClubsRequest = await axios.get('http://live.tractrac.com/rest-api/clubs.json')
   let allClubs = allClubsRequest.data.events
   let found = false
  
//     for(eventIndex in allEvents){
//         //let eventIndexLast = allEvents.length - 5
//        let eventObject = allEvents[eventIndex]
       
//        if(eventObject.id === '97'){
//            found = true
//            console.log(eventObject)
//            console.log('Found')
//            console.log(eventObject.name)
//            continue
           

//        //
//        }

//        if(!found){
//          //  console.log('Continuing')
//            continue
//        }

//        /** evennt object
//         * 
//         * { id: '1957',
//   races_url:
//    'http://event.tractrac.com/events/event_20201110_classJapan/jsonservice.php',
//   database: 'event_20201110_classJapan',
//   name: '470 class Japan Championships 2020',
//   logo:
//    'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_small.png',
//   logo_large:
//    'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_large.png',
//   cover:
//    'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_cover.jpg',
//   type: 'Sailing',
//   startTime: '2020-11-11',
//   endTime: '2020-11-15',
//   country: 'JPN',
//   city: 'Enoshima',
//   lat: '35.300000000000',
//   lon: '139.500000000000',
//   sortOrder: '6',
//   map_visibility: 'past',
//   etype_icon: 'ico-sailing.png' }
//         */

   

//         // This has a bug I think.
//         let eventHasEnded = true
        
        
    
//         if(eventObject.type === 'Sailing' && eventHasEnded){
//             console.log("Attempting new event.")
//             let racesRequest = null
//             try{
//                 racesRequest = await axios.get(eventObject.races_url)
//             }catch(err){
//                 await TracTrac.FailedUrl.create({id:uuidv4(), error:err.toString(), url:JSON.stringify(eventObject)})
//                 console.log(err)
//                 continue
//             }
           
//            let eventDetails = racesRequest.data.event
//            let races = racesRequest.data.races

//            if(eventDetails === undefined){
//                continue 
//            }


//            let eventSave = instantiateOrReturnExisting(existingObjects, TracTrac.Event, eventDetails.id)
     
//            let eventSaveObj = eventSave.obj
          
//            //console.log(eventDetails)

//             /** event details
//              * 
//              * 
//              * { id: 'd2a0e010-a320-0138-c48f-60a44ce903c3',
//                 name: 'Swedish SL- Mästarnas Mästare Marstrand',
//                 database: 'event_20201009_SwedishSLM',
//                 starttime: '2020-10-09 22:00:00',
//                 endtime: '2020-10-11 21:00:00',
//                 type: 'a1b74ca0-fdd8-11dc-8811-005056c00008',
//                 enable_notifier: false,
//                 notifier_client_name: null,
//                 subscriber_service:
//                 'https://em.event.tractrac.com/api/v1/events/d2a0e010-a320-0138-c48f-60a44ce903c3/mobile_subscriptions',
//                 url_scheme: 'tractrac://open.app/1910',
//                 db_replica_enabled: false,
//                 high_load: false,
//                 web_url:
//                 'https://www.tractrac.com/event-page/event_20201009_SwedishSLM/1910',
//                 dataservers: { stored: [], live: [], ws: [] },
//                 sap_url:
//                 'https://swedishleague2020.sapsailing.com/sailingserver/api/v1/leaderboardgroups/Mastarnas%20Mastare',
//                 sap_event_url:
//                 'https://swedishleague2020.sapsailing.com/gwt/Home.html#/regatta/leaderboard/:eventId=https://swedishleague2020.sapsailing.com/sailingserver/api/v1/leaderboardgroups/Mastarnas%20Mastare',
//                 sap_leaderboard_name: 'Mästarnas Mästare Marstrand' }
//              * 
//              * 
//              */
//             if(eventSave.shouldSave){
              
//                 try{
//                     await page.goto(eventDetails.web_url)
//                     eventSaveObj.external_website = await page.evaluate(() => {
//                         return document.querySelector('#app > main > section > div > div.details > div:nth-child(3) > a').href
//                     })
//                 }catch(err){
//                     // NO EXTERNAL WEBSITE
//                 }

//                 eventSaveObj.name = eventDetails.name
//                 eventSaveObj.country = eventObject.country
//                 eventSaveObj.city = eventObject.city
//                 eventSaveObj.type = eventObject.type
//                 eventSaveObj.start = eventDetails.starttime
//                 eventSaveObj.end = eventDetails.endtime
//                 eventSaveObj.web_url = eventDetails.web_url
//                 eventSaveObj.sap_url = eventDetails.sap_url
//                 eventSaveObj.sap_event_url = eventDetails.sap_event_url
//                 eventSaveObj.sap_leaderboard_name = eventDetails.sap_leaderboard_name
//                 eventSaveObj.lat = eventObject.lat
//                 eventSaveObj.lon = eventObject.lon
//                 console.log('test')
//                 await TracTrac.Event.create(eventSaveObj,{fields:Object.keys(eventSaveObj)})
//                 console.log('untest')
//             }
           
//             console.log('Got race list. Going through each race now.')
//             for(raceIndex in races){   
//                 console.log('a')
                
//                 let raceObject = races[raceIndex]
//                 console.log('b')
//                 let details = await parseRace(raceObject)
//                 console.log('c')
//                 if(details !== null && details !== undefined){
//                     let thingsToSave = formatAndSaveRace(eventSaveObj, details)
                  
//                     console.log('d')

//                     try{
//                         console.log('Formatting objects.')
//                         if(thingsToSave!= null){
                          
//                             let newObjectsToSave = [
//                                 { objectType:TracTrac.Race, objects:thingsToSave.racesToSave},
//                                 { objectType:TracTrac.Control, objects:thingsToSave.controlsToSave},
//                                 { objectType:TracTrac.ControlPoint, objects:thingsToSave.controlPointsToSave},
//                                 { objectType:TracTrac.Class, objects:thingsToSave.classesToSave},
//                                 { objectType:TracTrac.RaceClass, objects:thingsToSave.raceClassesToSave},
//                                 { objectType:TracTrac.ControlPointPosition, objects:thingsToSave.controlPointPositionsToSave},
//                                 { objectType:TracTrac.Competitor, objects:thingsToSave.competitorsToSave},
//                                 { objectType:TracTrac.CompetitorPassing, objects:thingsToSave.competitorPassingsToSave},
//                                 { objectType:TracTrac.CompetitorResults, objects:thingsToSave.competitorResultsToSave},
//                                 { objectType:TracTrac.CompetitorPosition, objects:thingsToSave.competitorPositionsToSave},
//                                 { objectType:TracTrac.Route, objects:thingsToSave.routesToSave}
//                                 ]
//                                 console.log('Bulk saving objects.')
//                                 try{
//                                     await bulkSave(newObjectsToSave, TracTrac.FailedUrl, eventSaveObj.web_url)
//                                 }catch(err){
//                                     console.log(err)
//                                     await TracTrac.FailedUrl.create({id:uuidv4(), error: JSON.stringify(err.toString()), url: JSON.stringify(eventSaveObj)})
//                                 }
//                         }
             

                            
                            
                           
//                     }catch(err){
//                         console.log(err)
                        
//                     }
        
//                 }else{
//                     console.log('Already saved this race.')
//                 }
//             }
            
//         }
//     }
   
    for(clubIndex in allClubs){
       let clubObject = allClubs[clubIndex]
      
        //TODO: check if club exists.

        if(clubObject.name === 'Shantou JiaZheng Sports'){
            found = true
            continue
        }
        if(!found){
            continue
        }


        // TODO: There is a bug here for saving routes. 
        /**Club object
         * 
         * { id: '27',
            races_url:
            'https://club.tractrac.com/tracms/client/jsonserviceclubs.php?user=boyan.zlatarev@icloud.com',
            name: '1 Tarifa Sportlink/ Surfski Center',
            logo:
            'images/clubs/4ba84810-a2bc-0131-f55f-10bf48d758ce_small.PNG',
            type: 'Sailing',
            country: 'ESP',
            city: 'Tarifa',
            token_url: null }
         */
        clubObject.original_id = clubObject.id
        clubObject.id = uuidv4()
       
        clubObject.email = clubObject.races_url.split('user=')[1]
        console.log(clubObject.email)

        if(clubObject.email !== undefined){
            await TracTrac.Email.create({id:uuidv4(), email: clubObject.email, country: clubObject.country, source:'TracTrac'})
        }

      
      
        try{
           var clubRacesRequest = await axios.get(clubObject.races_url)
        }catch(err){
            console.log(err)
        
            // TODO: log failed url
        }
        
      

       
        for(raceIndex in clubRacesRequest.data.races){
           let raceObject = clubRacesRequest.data.races[raceIndex]
           /**
            * 
            * Race object
            * 
            * { database: 'event_20140410_TarifaSurf',
  url:
   'http://club.tractrac.com/events/event_20140410_TarifaSurf/index.php?raceid=58fee0b0-de58-0135-d464-101b0ec43d96',
  url_emb:
   'http://club.tractrac.com/events/event_20140410_TarifaSurf/58fee0b0-de58-0135-d464-101b0ec43d96.html',
  params_url:
   'http://club.tractrac.com/events/event_20140410_TarifaSurf/58fee0b0-de58-0135-d464-101b0ec43d96.txt',
  url_html:
   'https://live.tractrac.com/viewer/index.html?target=https://em.club.tractrac.com/events/782fb150-a2bb-0131-f556-10bf48d758ce/races/58fee0b0-de58-0135-d464-101b0ec43d96.json',
  event_id: '782fb150-a2bb-0131-f556-10bf48d758ce',
  event_name: 'Surfski Center Tarifa',
  event_type: 'Sailing',
  id: '58fee0b0-de58-0135-d464-101b0ec43d96',
  name: 'Surfski Center Tarifa - Test Paddle 16:00 h',
  tracking_starttime: '2018-01-18 14:47:31',
  tracking_endtime: '2018-01-18 17:18:56',
  race_starttime: '',
  expected_race_startdate: '2018-01-18',
  initialized: '1',
  status: 'ONLINE',
  visibility: 'REPLAY',
  classes: 'Tarifa',
  classes_list:
   [ { id: '1f351760-0919-0132-f4a2-10bf48d758ce', name: 'Tarifa' } ],
  rerun: '',
  lat: 36.02044505682507,
  lon: -5.619309594726587 }
            */
            raceObject.club = clubObject.id
            raceObject.club_original_id = clubObject.original_id
            raceObject.has_club = true
            raceObject.event_id = null

            if(raceObject.event_type === 'Sailing'){
                let details = await parseRace(raceObject)
            
               
                if(details !== null && details !== undefined){
                    let thingsToSave = formatAndSaveRace(null, details)
                  
                    

                    try{
                        if(thingsToSave != null){
                            console.log('Formatting objects.')
            
                        
                       
                        let newObjectsToSave = [
                            { objectType:TracTrac.Race, objects:thingsToSave.racesToSave},
                            { objectType:TracTrac.Control, objects:thingsToSave.controlsToSave},
                            { objectType:TracTrac.ControlPoint, objects:thingsToSave.controlPointsToSave},
                            { objectType:TracTrac.Class, objects:thingsToSave.classesToSave},
                            { objectType:TracTrac.RaceClass, objects:thingsToSave.raceClassesToSave},
                            { objectType:TracTrac.ControlPointPosition, objects:thingsToSave.controlPointPositionsToSave},
                            { objectType:TracTrac.Competitor, objects:thingsToSave.competitorsToSave},
                            { objectType:TracTrac.CompetitorPassing, objects:thingsToSave.competitorPassingsToSave},
                            { objectType:TracTrac.CompetitorResults, objects:thingsToSave.competitorResultsToSave},
                            { objectType:TracTrac.CompetitorPosition, objects:thingsToSave.competitorPositionsToSave},
                            { objectType:TracTrac.Route, objects:thingsToSave.routesToSave}
                            ]
                            console.log('Bulk saving objects.')
                            try{
                                await bulkSave(newObjectsToSave, TracTrac.FailedUrl, raceObject.url_html)
                            }catch(err){
                                console.log(err)
                                await TracTrac.FailedUrl.create({id:uuidv4(), error: JSON.stringify(err.toString()), url: JSON.stringify(raceObject.url_html)})
                            }
                        }
                        
                    }catch(err){
                        console.log(err)
                    }
        
                }
               
            }
            
            
        }
    }
    

})();