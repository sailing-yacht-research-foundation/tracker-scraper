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
  metadata: '' }
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
                console.log(raceMeta)
                if(raceMeta.params_json !== undefined){
                    var raceParamsRequest = await axios.get(raceMeta.params_json)
                    // This is HUGE
                    //  console.log(raceParamsRequest.data)
                }else{

                }
                
                
                await page.goto(raceMeta.url_html, {waitUntil: "networkidle2"});

                await page.waitForSelector('#time-control-play')
                await page.click('#time-control-play')
                await page.waitForSelector('#contTop > div > section.race')
                var wait_for_fully_loaded = 'document.querySelector("#time-slider > div") != null && document.querySelector("#time-slider > div").style["width"] === "100%"'
                var skip = false;
                await page.waitForFunction(wait_for_fully_loaded, {timeout:60000} ).catch(e => {
                    
                    // TODO: save as failed race
                    console.log('Skipping')
                    skip = true;
                })

                if(!skip){
                    console.log('Loaded race, beginning to parse from website.')
                    var race_details = await page.evaluate(() => {
                        var context = document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]][Object.keys(document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]])[0]]["context"]
                        var race = context["$component"]["raceData"]["race"]
                        var name = race["name"]
                        var original_id = race["id"]
                        var calculated_start_time = race["calculatedStartTime"]
                        var start_time = race["raceStartTime"]
                        var end_time = race["raceEndTime"]
                        var tracking_start_time = race["trackingStartTime"]
                        var tracking_end_time = race["trackingEndTime"]
                        var extent = race["extent"]
                        var time_zone = race["parameterSet"]["parameters"]["eventTimezone"]
                        var race_date_s = race["readableDate"]
                        var race_date_timestamp = race["notReadableDate"]
                        var classes = race["parameterSet"]["parameters"]["classes"]
                        var params = race["parameterSet"]["parameters"]["parameters"]
                        var routes = race["parameterSet"]["parameters"]["routes"]
                        var control_points = race["parameterSet"]["parameters"]["controlPoints"]
                        var p_event_id = race["parameterSet"]["parameters"]["eventId"]
                        var p_event_st = race["parameterSet"]["parameters"]["eventStartTime"]
                        var p_event_et = race["parameterSet"]["parameters"]["eventEndTime"]
                        var p_web_id = race["parameterSet"]["parameters"]["webId"]
                        var p_course_area = race["parameterSet"]["parameters"]["course_area"]

                        var assorted = {params, classes, routes, control_points, extent, p_event_id, p_event_st, p_event_et, p_web_id, p_course_area}

                        var competitors_params = race["parameterSet"]["parameters"]["competitors"]
                        var competitors_race = Object.keys(Object.values(race["raceCompetitors"])[0])
                        var competitors_event = Object.keys(Object.values(race["event"]["competitors"])[0])

                        var team_position_data = Object.values(context["$component"]["raceData"]["resultItems"]).map( resultItem => {

                                var positions = resultItem["positions"]["positions"]
                                var team = resultItem["team"]["id"]
                                var short_name = resultItem["shortName"]
                                var time_elapsed = resultItem["timeElapsed"]
                                var start_time = resultItem["startTime"]
                                var stop_time = resultItem["stopTime"]
                                var finish_time = resultItem["finishTime"]
                                var status = resultItem["status"]
                                return {positions, team, short_name, time_elapsed, start_time, stop_time, finish_time, status}

                        });

                        return {competitors_params, 
                            competitors_race,
                            competitors_event,
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
                    
                     //   console.log(race_details.team_position_data[0].positions[0])
                    
                    // TODO: Go through race_details object and other objects and save them to DB in a transaction. 1 Transaction per race.
                    // TODO: wrap in try catch.
                }
                
    }


    var allEventsRequest = await axios.get('http://live.tractrac.com/rest-api/events.json')
    var allEvents = allEventsRequest.data.events

    var allClubsRequest = await axios.get('http://live.tractrac.com/rest-api/clubs.json')
    var allClubs = allClubsRequest.data.events
   
    
    for(clubIndex in allClubs){
        var clubObject = allClubs[clubIndex]
        //TODO: check if club exists.
        clubObject.original_id = clubObject.id
        clubObject.id = uuidv4()
       
        clubObject.email = clubObject.races_url.split('user=')[1]
      
        try{
            var clubRacesRequest = await axios.get(clubObject.races_url)
        }catch(err){
            console.log(err)
            console.log(clubObject)
            // TODO: log failed url
        }
        
        // TODO Save club

       

        for(raceIndex in clubRacesRequest.data.races){
            var raceObject = clubRacesRequest.data.races[raceIndex]
            raceObject.club = clubObject.id
            raceObject.club_original_id = clubObject.original_id
            raceObject.has_club = true
            raceObject.event_id = null

            if(raceObject.event_type === 'Sailing'){
              //  await parseRace(raceObject)

            }
            
            
        }
    }



        
    for(eventIndex in allEvents){
        var eventObject = allEvents[eventIndex]

        // If event isn't in future, or doesn't already exist, save it.
        // TODO

     
        var eventHasEnded = new Date(eventObject.endTime).getTime() < new Date().getTime()

        var eventSave = {
            id: uuidv4(),
            small_original_id: eventObject.id,
            name: eventObject.name,
            start: eventObject.startTime,
            end: eventObject.endTime,
            country: eventObject.country,
            city: eventObject.city,
            lon: eventObject.lon,
            lat: eventObject.lat
        }

        

        if(eventObject.type === 'Sailing' && eventHasEnded){
            console.log("Attempting new event.")
            var racesRequest = await axios.get(eventObject.races_url)
            var eventDetails = racesRequest.data.event
            var races = racesRequest.data.races

            /**
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

            eventSave.large_original_id = eventDetails.id
            eventSave.type = eventDetails.type
            eventSave.url = eventDetails.web_url
            eventSave.sap_url = eventDetails.sap_url
            eventSave.sap_event_url = eventDetails.sap_event_url
            eventSave.sap_leaderboard_name = eventDetails.sap_leaderboard_team

            await page.goto(eventSave.url)

            eventSave.external_url = await page.evaluate(() => {
                return document.querySelector('#app > main > section > div > div.details > div:nth-child(3) > a').href
            })

            console.log('Got race list. Going through each race now.')
            for(raceIndex in races){
                

    
                var raceObject = races[raceIndex]
                raceObject.event = eventSave.id
                raceObject.event_small_original_id = eventSave.small_original_id
                raceObject.event_large_original_id = eventSave.large_original_id
                await parseRace(raceObject)

                
            }

           
        }
    }
    
    

})();