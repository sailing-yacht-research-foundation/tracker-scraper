const {RaceQs, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');


( async () => {
    await connect()
    var existingObjects = await findExistingObjects(RaceQs)

    const BEGIN_COUNTING_AT = 100000
   
    var pageIndex = BEGIN_COUNTING_AT
        
    while(pageIndex > 0){
        
        let eventUrl = 'https://raceqs.com/tv-beta/tv.htm#eventId=' + pageIndex

        try{
            let eventId = pageIndex
            console.log('Getting new race.')
            console.log(eventUrl)
            let configRequest = await axios.get('https://raceqs.com/rest/meta?id=' + eventId)
            let config = configRequest.data
            
            if(config.events.length == 0){
                pageIndex--
                continue
            }
            let newRegattas = []
            let newEvents = []
            let newWaypoints = []
            let newDivisions = []
            let newRoutes = []
            let newStarts = []
            let newUsers = []
            let newPositions = []
            let checkRegatta = instantiateOrReturnExisting(existingObjects, RaceQs.Regatta, config.events[0].regattaId)
            if(checkRegatta.shouldSave){
                
                checkRegatta.obj.club_original_id = config.regattas[0].club,
                checkRegatta.obj.name = config.regattas[0].name,
                checkRegatta.obj.url = config.regattas[0].url,
                checkRegatta.obj.content = config.regattas[0].content,
                checkRegatta.obj.attach1 = config.regattas[0].attach1,
                checkRegatta.obj.attach2 = config.regattas[0].attach2,
                checkRegatta.obj.attach3 = config.regattas[0].attach3,
                checkRegatta.obj.attach4 = config.regattas[0].attach4,
                checkRegatta.obj.type = config.regattas[0].type,
                checkRegatta.obj.administrator = config.regattas[0].administrator,
                checkRegatta.obj.updated_at = config.regattas[0].updatedAt,
                checkRegatta.obj.contactor_name = config.regattas[0].ContactorName,
                checkRegatta.obj.contactor_email = config.regattas[0].ContactorEmail
                newRegattas.push(checkRegatta.obj)

            }
            
            
            let newEventStat = instantiateOrReturnExisting(existingObjects, RaceQs.Event, config.events[0].id)
          
            if(newEventStat.shouldSave){
    
                newEventStat.obj.regatta = checkRegatta.obj.id,
                newEventStat.obj.regatta_original_id = checkRegatta.obj.original_id,
                newEventStat.obj.name = config.events[0].name,
                newEventStat.obj.content = config.events[0].content,
                newEventStat.obj.from = config.events[0].fromDtm,
                newEventStat.obj.till = config.events[0].tillDtm,
                newEventStat.obj.tz = config.events[0].tz,
                newEventStat.obj.lat1 = config.events[0].lat1,
                newEventStat.obj.lon1 = config.events[0].lon1,
                newEventStat.obj.lat2 = config.events[0].lat2,
                newEventStat.obj.lon2 = config.events[0].lon2,
                newEventStat.obj.updated_at =  config.events[0].updatedAt,
                newEventStat.obj.url = eventUrl
              
                newEvents.push(newEventStat.obj)
                
                let wpts = {}

                config.waypoints.forEach(w => {
                    
                    let waypoint = {
                        id: uuidv4(),
                        original_id: w.id,
                        event: newEventStat.obj.id,
                        event_original_id: newEventStat.obj.original_id,
                        regatta: newEventStat.obj.regatta,
                        regatta_original_id: newEventStat.obj.regatta_original_id,
                        start: w.start,
                        finish: w.finish,
                        lat: w.lat,
                        lon: w.lon,
                        lat2: w.lat2,
                        lon2: w.lon2,
                        port_course: w.portCourse,
                        port_speed: w.portSpeed,
                        starboard_course: w.starboardCourse,
                        starboard_speed: w.starboardSpeed,
                        wind: w.wind,
                        tack: w.tack,
                        type: w.type,
                        v: w.v,
                        start_I: w.startI,
                        finish_I: w.finishI,
                        start_Z: w.startZ,
                        finish_Z: w.finishZ,
                        name: w.name,
                        race_type: w.race_type,
                        boat_model: w.boat_model
                    }
                    wpts[w.id] = waypoint.id
                    newWaypoints.push(waypoint)
                })
              
    
                let divs = {}
                config.divisions.forEach(d=>{
                    let division = {
                        id:uuidv4(),
                        original_id: d.id,
                        event: newEventStat.obj.id,
                        event_original_id: newEventStat.obj.original_id,
                        regatta: newEventStat.obj.regatta,
                        regatta_original_id: newEventStat.obj.regatta_original_id,
                        name: d.name,
                        avatar: d.avatar
                    }
                    divs[d.id] = division.id
                    newDivisions.push(division)
                })

                let starts = {}
                config.starts.forEach(s =>{
              
                    let start = {
                        id: uuidv4(),
                        original_id: s.id,
                        event: newEventStat.obj.id,
                        event_original_id: newEventStat.obj.original_id,
                        division: divs[s.divisionId],
                        division_original_id: s.divisionId,
                        from: s.fromDtm,
                        type: s.type,
                        wind: s.wind,
                        min_duration: s.minDuration
                    }
                    starts[s.id] = start.id
                    newStarts.push(start)
                })

                config.routes.forEach(r => {
                    let route = {
                        id: uuidv4(),
                        original_id: r.id,
                        event: newEventStat.obj.id,
                        event_original_id: newEventStat.obj.original_id,
                        start: starts[r.startId],
                        start_original_id: r.startId,
                        waypoint: wpts[r.waypointId],
                        waypoint_original_id: r.waypointId,
                        sqk: r.sqk,
                        wind_direction: r.windDirection,
                        wind_speed: r.windSpeed,
                        current_direction: r.currentDirection,
                        current_speed: r.currentSpeed
                    }
                    newRoutes.push(route)
                })

               
            }else{
                console.log('Skipping this race cause you already indexed it.')
                pageIndex--
                continue
            }
       
            // EVENTS is array of one object:
            
            let envUrls = []

            let timestring = ''

            config.events.forEach(e=>{
                let s = new Date(e.fromDtm).toISOString().split('.')[0] + e.tz
                let f = new Date(e.tillDtm).toISOString().split('.')[0] + e.tz
                let lat1 = e["lat1"]
                let lat2 = e["lat2"]
                let long1 = e["lon1"]
                let long2 = e["lon2"]
                let latString = "&lat=" + lat1 + ".." + lat2
                let lonString = "&lon=" + long1 + ".." + long2
                timestring = s + '..' + f
                let requestString = 'https://raceqs.com/rest/environment?dt=' + s + '..' + f + latString + lonString
                envUrls.push(requestString)
            })
        
            // let startUrls = []
            // config.starts.forEach(s=>{
            //     let startUrl = 'https://raceqs.com/rest/start?id=' + s.id
            //     startUrls.push(startUrl)
            // })

            // for(startUrlIndex in startUrls){
            //     let startUrl = startUrls[startUrlIndex]
            //     let startConfigRequest = await axios.get(startUrl)
            //     console.log(startConfigRequest.data)
            // }

            console.log('Getting user positions.')
            let userPositionUrls = []
            let users = {}
            for(envUrlIndex in envUrls){
                let requestString = envUrls[envUrlIndex]
    
                let environmentRequest = await axios.get(requestString)
               
                environmentRequest.data.forEach(u => {
                
                    let userPositionUrl = 'https://raceqs.com/rest/data?userId=' + u.userId + '&dt=' + timestring
                    userPositionUrls.push(userPositionUrl)

                    let user = {
                        id: uuidv4(),
                        original_id: u.userId,
                        event: newEventStat.obj.id,
                        event_original_id: newEventStat.obj.original_id,
                        boat: u.boat,
                        start: u.startDt,
                        finish: u.finishDt
                    }
                    users[u.userId] = user.id
                    newUsers.push(user)
                })
            }
        
            for(userPositionUrlIndex in userPositionUrls){
                let positionUrl = userPositionUrls[userPositionUrlIndex]
                
                let positionsRequest = await axios.get(positionUrl)
                let uid = positionUrl.split('userId=')[1].split('&')[0]

                let lines = new String(positionsRequest.data).split('\n')
                lines.shift()
                lines.forEach(line =>{
                    let tabs = line.split('\t')
                    let time = tabs[0]
                    let lat = tabs[1]
                    let lon = tabs[2]
                    let roll = tabs[3]
                    let pitch = tabs[4]
                    let heading = tabs[5]
                    let sow = tabs[6]
                    let wind_angle = tabs[7]
                    let wind_speed = tabs[8]
                    

                    let position = {
                        id: uuidv4(),
                        event: newEventStat.obj.id,
                        event_original_id: newEventStat.obj.original_id,
                        participant: users[uid],
                        participant_original_id: uid,
                        time: time,
                        lat: lat,
                        lon: lon,
                        roll: roll,
                        pitch: pitch,
                        heading: heading,
                        sow: sow,
                        wind_angle: wind_angle,
                        wind_speed: wind_speed
                    }
                    newPositions.push(position)
                });
            }

            let newObjectsToSave = [
                { objectType:RaceQs.Event, objects:newEvents},
                { objectType:RaceQs.Division, objects:newDivisions},
                { objectType:RaceQs.Waypoint, objects:newWaypoints},
                { objectType:RaceQs.Route, objects:newRoutes},
                { objectType:RaceQs.Start, objects:newStarts},
                { objectType:RaceQs.Participant, objects:newUsers},
                { objectType:RaceQs.Position, objects:newPositions},
                { objectType:RaceQs.Regatta, objects:newRegattas}]
            console.log('Bulk saving objects.')
            await bulkSave(newObjectsToSave, RaceQs.FailedUrl, eventUrl)
            console.log('Finished saving race. On to the next one.')


        }catch(err){
            console.log(err)
            await RaceQs.FailedUrl.create({id:uuidv4(), url: eventUrl, error: err.toString()})
        }
        
        pageIndex--
    }



})();

 