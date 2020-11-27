const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');



// Get all events.
( async () => {
    axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 10});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var parseRace =  async function(race) { 
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
              //  console.log(raceMeta.classes_list)
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

                    //console.log(Object.keys(values))

                    // Red herring.
                    // let jsonUrl = lines[lines.length-2].split('EventJSON:')[1]
                    
                    // let raceJsonRequest = await axios.get(jsonUrl)
                    // // [ 'event', 'races', 'banners' ]
                    // console.log(Object.keys(raceJsonRequest.data.races[0]))
                    //console.log(raceParamsRequest.data.split('\n'))
                    //console.log(raceParamsRequest.data)
                }
                
                await page.goto(raceMeta.url_html, {waitUntil: "networkidle2"});

                await page.waitForSelector('#time-control-play')
                await page.click('#time-control-play')
                await page.waitForSelector('#contTop > div > section.race')
                let wait_for_fully_loaded = 'document.querySelector("#time-slider > div") != null && document.querySelector("#time-slider > div").style["width"] === "100%"'
                let skip = false;
                await page.waitForFunction(wait_for_fully_loaded, {timeout:60000} ).catch(e => {
                    
                    // TODO: save as failed race
                    console.log('Skipping')
                    skip = true;
                })

                if(!skip){
                    console.log('Loaded race, beginning to parse from website.')
                    let race_details = await page.evaluate(() => {
                       let context = document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]][Object.keys(document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]])[0]]["context"]
                       let race = context["$component"]["raceData"]["race"]
                  
                    //    let result_lists = context["$component"]["raceData"]["resultLists"]


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
                       let routes = race["parameterSet"]["parameters"]["routes"]
                       let control_points = race["parameterSet"]["parameters"]["controlPoints"]
                       let p_event_id = race["parameterSet"]["parameters"]["eventId"]
                       let p_event_st = race["parameterSet"]["parameters"]["eventStartTime"]
                       let p_event_et = race["parameterSet"]["parameters"]["eventEndTime"]
                       let p_web_id = race["parameterSet"]["parameters"]["webId"]
                       let p_course_area = race["parameterSet"]["parameters"]["course_area"]

                       let assorted = {params, classes, routes, control_points, extent, p_event_id, p_event_st, p_event_et, p_web_id, p_course_area}

                       let competitors_params = race["parameterSet"]["parameters"]["competitors"]

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
                               let short_name = resultItem["shortName"]
                               let time_elapsed = resultItem["timeElapsed"]
                               let start_time = resultItem["startTime"]
                               let stop_time = resultItem["stopTime"]
                               let finish_time = resultItem["finishTime"]
                               let status = resultItem["status"]

                               let passings = resultItem["controlPassings"].map(p => { return {controlId:p.control.id, passingTime:p.passingTime, realPassingTime:p.realPassingTime, pos:p.pos, timeFromStart:p.timeFromStart}})
                               let id = resultItem["id"]
                               let group_leader = resultItem["groupLeader"]
                               let course_time_handicap = resultItem["courseTimeHandicap"]
                               let start_line_analysis = resultItem["startLineAnalysis"]


                                return {id, group_leader, course_time_handicap, start_line_analysis, positions, team, short_name, time_elapsed, start_time, stop_time, finish_time, status, passings}

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
  
                    
                    // TODO: Go through race_details object and other objects and save them to DB in a transaction. 1 Transaction per race.
                    // TODO: wrap in try catch.
                }
                
    }


    // Events and clubs are basically the same in this schema. So we need to check all races associated with an event or a club.
   let allEventsRequest = await axios.get('http://live.tractrac.com/rest-api/events.json')
   let allEvents = allEventsRequest.data.events
   
   let allClubsRequest = await axios.get('http://live.tractrac.com/rest-api/clubs.json')
   let allClubs = allClubsRequest.data.events
   
    
//     for(clubIndex in allClubs){
//        let clubObject = allClubs[clubIndex]
      
//         //TODO: check if club exists.


//         /**Club object
//          * 
//          * { id: '27',
//             races_url:
//             'https://club.tractrac.com/tracms/client/jsonserviceclubs.php?user=boyan.zlatarev@icloud.com',
//             name: '1 Tarifa Sportlink/ Surfski Center',
//             logo:
//             'images/clubs/4ba84810-a2bc-0131-f55f-10bf48d758ce_small.PNG',
//             type: 'Sailing',
//             country: 'ESP',
//             city: 'Tarifa',
//             token_url: null }
//          */
//         clubObject.original_id = clubObject.id
//         clubObject.id = uuidv4()
       
//         clubObject.email = clubObject.races_url.split('user=')[1]
      
//         try{
//            var clubRacesRequest = await axios.get(clubObject.races_url)
//         }catch(err){
//             console.log(err)
//             console.log(clubObject)
//             // TODO: log failed url
//         }
        
//         // TODO Save email

       
//         for(raceIndex in clubRacesRequest.data.races){
//            let raceObject = clubRacesRequest.data.races[raceIndex]
//            /**
//             * 
//             * Race object
//             * 
//             * { database: 'event_20140410_TarifaSurf',
//   url:
//    'http://club.tractrac.com/events/event_20140410_TarifaSurf/index.php?raceid=58fee0b0-de58-0135-d464-101b0ec43d96',
//   url_emb:
//    'http://club.tractrac.com/events/event_20140410_TarifaSurf/58fee0b0-de58-0135-d464-101b0ec43d96.html',
//   params_url:
//    'http://club.tractrac.com/events/event_20140410_TarifaSurf/58fee0b0-de58-0135-d464-101b0ec43d96.txt',
//   url_html:
//    'https://live.tractrac.com/viewer/index.html?target=https://em.club.tractrac.com/events/782fb150-a2bb-0131-f556-10bf48d758ce/races/58fee0b0-de58-0135-d464-101b0ec43d96.json',
//   event_id: '782fb150-a2bb-0131-f556-10bf48d758ce',
//   event_name: 'Surfski Center Tarifa',
//   event_type: 'Sailing',
//   id: '58fee0b0-de58-0135-d464-101b0ec43d96',
//   name: 'Surfski Center Tarifa - Test Paddle 16:00 h',
//   tracking_starttime: '2018-01-18 14:47:31',
//   tracking_endtime: '2018-01-18 17:18:56',
//   race_starttime: '',
//   expected_race_startdate: '2018-01-18',
//   initialized: '1',
//   status: 'ONLINE',
//   visibility: 'REPLAY',
//   classes: 'Tarifa',
//   classes_list:
//    [ { id: '1f351760-0919-0132-f4a2-10bf48d758ce', name: 'Tarifa' } ],
//   rerun: '',
//   lat: 36.02044505682507,
//   lon: -5.619309594726587 }
//             */
//             raceObject.club = clubObject.id
//             raceObject.club_original_id = clubObject.original_id
//             raceObject.has_club = true
//             raceObject.event_id = null

//             if(raceObject.event_type === 'Sailing'){
//                 await parseRace(raceObject)

//             }
            
            
//         }
//     }



        
    for(eventIndex in allEvents){
        let eventIndexLast = allEvents.length - 5
       let eventObject = allEvents[eventIndex]

       /** evennt object
        * 
        * { id: '1957',
  races_url:
   'http://event.tractrac.com/events/event_20201110_classJapan/jsonservice.php',
  database: 'event_20201110_classJapan',
  name: '470 class Japan Championships 2020',
  logo:
   'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_small.png',
  logo_large:
   'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_large.png',
  cover:
   'images/events/aad5a9f0-e680-0138-8d2c-60a44ce903c3_cover.jpg',
  type: 'Sailing',
  startTime: '2020-11-11',
  endTime: '2020-11-15',
  country: 'JPN',
  city: 'Enoshima',
  lat: '35.300000000000',
  lon: '139.500000000000',
  sortOrder: '6',
  map_visibility: 'past',
  etype_icon: 'ico-sailing.png' }
        */

       //console.log(eventObject)
        // If event isn't in future, or doesn't already exist, save it.
        // TODO

     
       let eventHasEnded = new Date(eventObject.endTime).getTime() < new Date().getTime()

     
        

        if(eventObject.type === 'Sailing' && eventHasEnded){
            console.log("Attempting new event.")
           let racesRequest = await axios.get(eventObject.races_url)
           let eventDetails = racesRequest.data.event
           let races = racesRequest.data.races

           //console.log(eventDetails)

            /** event details
             * 
             * 
             * { id: 'd2a0e010-a320-0138-c48f-60a44ce903c3',
                name: 'Swedish SL- Mästarnas Mästare Marstrand',
                database: 'event_20201009_SwedishSLM',
                starttime: '2020-10-09 22:00:00',
                endtime: '2020-10-11 21:00:00',
                type: 'a1b74ca0-fdd8-11dc-8811-005056c00008',
                enable_notifier: false,
                notifier_client_name: null,
                subscriber_service:
                'https://em.event.tractrac.com/api/v1/events/d2a0e010-a320-0138-c48f-60a44ce903c3/mobile_subscriptions',
                url_scheme: 'tractrac://open.app/1910',
                db_replica_enabled: false,
                high_load: false,
                web_url:
                'https://www.tractrac.com/event-page/event_20201009_SwedishSLM/1910',
                dataservers: { stored: [], live: [], ws: [] },
                sap_url:
                'https://swedishleague2020.sapsailing.com/sailingserver/api/v1/leaderboardgroups/Mastarnas%20Mastare',
                sap_event_url:
                'https://swedishleague2020.sapsailing.com/gwt/Home.html#/regatta/leaderboard/:eventId=https://swedishleague2020.sapsailing.com/sailingserver/api/v1/leaderboardgroups/Mastarnas%20Mastare',
                sap_leaderboard_name: 'Mästarnas Mästare Marstrand' }
             * 
             * 
             */

        //    await page.goto(eventSave.url)

            // eventSave.external_url = await page.evaluate(() => {
            //     return document.querySelector('#app > main > section > div > div.details > div:nth-child(3) > a').href
            // })

            console.log('Got race list. Going through each race now.')
            for(raceIndex in races){
                
                let raceObject = races[raceIndex]
               
                await parseRace(raceObject)

                
            }

           
        }
    }
    
    

})();