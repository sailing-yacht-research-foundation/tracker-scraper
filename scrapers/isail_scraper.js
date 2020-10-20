
const {iSail, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const FormData = require('form-data');
var AdmZip = require('adm-zip');
const exec = require('sync-exec');
const {gzip, ungzip} = require('node-gzip');
var parser = require('xml2json');

( async () => {
    var CONNECTED_TO_DB = connect()
    if(!CONNECTED_TO_DB){
        process.exit()
    }

    if(CONNECTED_TO_DB){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const existingEvents = await iSail.iSailEvent.findAll({ attributes: ['id', 'original_id', 'name', 'url']})
        const existingClassObjects = await iSail.iSailClass.findAll({ attributes: ['id', 'original_id', 'name']})
        const existingEventUrls  = []
        const existingClasses = {}
        const failedUrls = await iSail.iSailFailedUrl.findAll({attributes:['url']})
        const existingFailures = []
        for(urlIndex in failedUrls){
            var u = failedUrls[urlIndex]
      //      existingFailures.push(u)
        }
        for(eventIndex in existingEvents){
            existingEventUrls.push(existingEvents[eventIndex].url)
        }

        for(classIndex in existingClassObjects){
            var c = existingEventUrls[classIndex]
            existingClasses[c.original_id] = c.id
        }

        var counter = 1
        var maximum = 500
        while(counter < maximum){
            console.log('Getting new event.')
            var url = 'http://app.i-sail.com/eventDetails/' + counter

            if(existingEventUrls.includes(url) || existingFailures.includes(url)){
                counter += 1
                continue;
            }
           
            try{
                var result = await page.goto(url, {timeout: 0, waitUntil: "networkidle2"});
  
                if(result.status() === 404){
                    console.log('Error loading page so skipping.');
                    counter += 1
                    continue
                }
                var didError = false
                let all_event_data = await page.evaluate(() => {
    
                    race_json = JSON.parse(document.getElementsByName('raceJSON')[0]['content'])
                    idx = 0
                    races = []
                    while(idx < race_json.length){
                        var race = race_json[idx]
                        var name = race['name']
                      
                        race['url'] = 'http://app.i-sail.com' + Routing.generate('race_details', {id:race['event'], race:race['name']})
                        idx += 1
                    }
                    
                    event_json = JSON.parse(document.getElementsByName('eventJSON')[0]['content'])
                    participant_json = JSON.parse(document.getElementsByName('participantJSON')[0]['content'])
                    track_json = JSON.parse(document.getElementsByName('trackJSON')[0]['content'])
                    course_mark_json = JSON.parse(document.getElementsByName('courseMarkJSON')[0]['content'])
                    mark_json = JSON.parse(document.getElementsByName('markJSON')[0]['content'])
                    startline_json = JSON.parse(document.getElementsByName('startlineJSON')[0]['content'])
                    rounding_json = JSON.parse(document.getElementsByName('roundingJSON')[0]['content'])
                    result_json = JSON.parse(document.getElementsByName('resultJSON')[0]['content'])
    
                    return { race_json, event_json, participant_json, track_json, course_mark_json, mark_json, startline_json, rounding_json, result_json }
            
                }).catch(error =>{
                    console.log(error)
                    didError = true
                })
                
                if(all_event_data === null || didError){
                    counter += 1
                    continue
                }
                // Check start time and end time of event.
                var eventJSON = all_event_data.event_json[counter.toString()]
                
                var startDate = new Date(eventJSON.startDate.date)
                var endDate = new Date(eventJSON.endDate.date)
                var todaysDate = new Date()
    
                if(todaysDate < startDate || todaysDate < endDate || all_event_data.race_json.length == 0 || all_event_data.track_json['ids'].length == 0){
                    console.log('Skipping this event because it is not over yet.')
                    counter += 1
                    continue
                }
                console.log('Saving event because it is new and over.')
            
                var event = {
                    id: uuidv4(),
                    original_id: eventJSON.id,
                    name: eventJSON.name,
                    start_date: eventJSON.startDate.date,
                    start_timezone_type: eventJSON.startDate.timezone_type,
                    start_timezone: eventJSON.startDate.timezone,
                    stop_date: eventJSON.endDate.date,
                    stop_timezone_type: eventJSON.endDate.timezone_type,
                    stop_timezone: eventJSON.endDate.timezone,
                    club: eventJSON.club,
                    location: eventJSON.location,
                    url: url
                }
    
                var classes = Object.values(eventJSON.classes)
                var new_classes = []
                for(classIndex in classes){
                    var c = classes[classIndex]
                    if(existingClasses[c.id] === null || existingClasses[c.id] === undefined){
                        var newC = {id: uuidv4(), original_id: c.id, name: c.name}
                        new_classes.push(newC)
                        existingClasses[newC.original_id] = newC.id
                    }
                }
    
                // Participants are per event not race
                var participants = []
                // Open question: is the participant id unique to name? Or is it just an id for this name race combo?
                var participantJSON = all_event_data.participant_json
                var participantIdMap = {}
                participantJSON.forEach(p => {
                    var participant = {
                        id: uuidv4(),
                        original_id: p.id,
                        class: existingClasses[p.classId],
                        original_class_id: p.classId,
                        class_name: p.className,
                        sail_no: p.sailNumber,
                        event: event.id,
                        original_event_id: p.eventId,
                        name: p.name
                    }
                    participantIdMap[p.id] = participant.id
                    participants.push(participant)
                })
    
                var courseMarkJSON = all_event_data.course_mark_json
                var markJSON = all_event_data.mark_json
                var startlineJSON = all_event_data.startline_json
                
                var resultJSON = all_event_data.result_json
                var raceJSON = all_event_data.race_json
    
                var raceExtras = []
                var courseMarkIdMap = {}
                raceJSON.map((race,k)=> {
                    var r = {
                        id: uuidv4(),
                        original_id: race.id,
                        event: event.id,
                        original_event_id: race.event,
                        name: race.name,
                        start: race.startTime,
                        stop: race.stopTime,
                        wind_direction: race.windDirection,
                        url: race.url
                    }
                    
                    var courseMarks = []
                    var marks = []
                    var startlines = []
                    var results = []
                    var raceExtra = { 
                        raceObject: r,
                        courseMarks: courseMarks,
                        marks: marks,
                        startlines: startlines,
                        results: results
                    }
                    
                    var markIdMap = {}
                    markJSON.forEach( v => {
                        if(v.raceId === race.id){
                            var m = {
                                id: uuidv4(),
                                original_id: v.id,
                                event: event.id,
                                original_event_id: event.original_id,
                                race: r.id,
                                original_race_id: r.original_id,
                                name: v.name,
                                lon: v.lon,
                                lat: v.lat,
                            }
                            markIdMap[m.original_id] = m.id
                            marks.push(m)
                        }
                    })
    
                    var startlineIdMap = {}
                    startlineJSON.forEach(v => {
                        if(v.raceId === race.id){
                            var startline = {
                                id: uuidv4(),
                                original_id: v.id,
                                event: event.id,
                                original_event_id: event.original_id,
                                race: r.id,
                                original_race_id: r.original_id,
                                name: v.name,
                                lon_1: v.lon1,
                                lat_1: v.lat1,
                                lon_2: v.lon2,
                                lat_2: v.lat2
                            }
                            startlineIdMap[v.id] = startline.id,
                            startlines.push(startline)
                        }
                    })
    
                    courseMarkJSON.forEach( v => {
                        if(v.raceId === race.id){
                            var cm = {
                                id: uuidv4(),
                                original_id: v.id,
                                event: event.id,
                                original_event_id: event.original_id,
                                race: r.id,
                                original_race_id: r.original_id,
                                position: v.position,
                                mark: markIdMap[v.markId],
                                original_mark_id: v.markId,
                                startline: startlineIdMap[v.startlineId],
                                original_startline_id: v.startlineId
                            }
                            courseMarks.push(cm)
                            courseMarkIdMap[cm.original_id] = cm.id
                        }
                    })
    
                    resultJSON.forEach(v => {
                        if(v.raceId === race.id){
                            var result = {
                                id: uuidv4(),
                                original_id: v.id,
                                event: event.id,
                                original_event_id: event.original_id,
                                race: r.id,
                                original_race_id: r.original_id,
                                name: v.rName,
                                points: v.points,
                                time: v.fTime,
                                finaled: v.finaled,
                                participant: participantIdMap[v.participantId],
                                original_participant_id: v.participantId
                            }
                            results.push(result)
                        }
                    })
                    raceExtras.push(raceExtra)
                })
    
                var trackJSON = all_event_data.track_json
               
                var trackData = {
                    id: uuidv4(),
                    event: event.id,
                    original_event_id: event.original_id,
                    min_lon: trackJSON.coords.minLon,
                    max_lon: trackJSON.coords.maxLon,
                    min_lat: trackJSON.coords.minLat,
                    max_lat: trackJSON.coords.maxLat,
                    start_time: trackJSON.startTime,
                    stop_time: trackJSON.stopTime
                }
    
                var tracks = []
                var positions = []
                var roundings = []
    
                /**
                 * Each track id value has the following keys:
                 * id, name, user.name, user.id, participant.sailnumber, participant.name, participant.id, participant.classEntity, startTime, stopTime, points = []
                 */
    
                var track_ids = trackJSON['ids']
                var url_suffix = ''
    
                track_ids.forEach(id => {
                    url_suffix = url_suffix + 'trackIds%5B%5D=' + id + '&'
                })
    
                var result = await axios.get('http://app.i-sail.com/ajax/getPoints?' + url_suffix)
        
                var positionData = result.data
                var trackIdMap = {}
                // Positions are keyed by track ids. ['track_id'] = [{position, time, speed, heading, distance}]
                track_ids.forEach(id => {
                    var t = trackJSON[id]
                    var track_positions = positionData[id]
                    var track = {
                        id: uuidv4(),
                        original_id: t.id,
                        event: event.id,
                        original_event_id: event.original_id,
                        track_data: trackData.id,
                        participant: participantIdMap[t.participant.id],
                        original_participant_id: t.participant.id,
                        class: existingClasses[t.participant.classEntity.id],
                        original_class_id: t.participant.classEntity.id,
                        original_user_id: t.user.id,
                        user_name: t.user.name,
                        start_time: t.startTime,
                        stop_time: t.stopTime
                    }
                    trackIdMap[id] = track.id
                    tracks.push(track)
    
                    track_positions.forEach(p => {
                        var position = {
                            id: uuidv4(),
                            event: event.id,
                            original_event_id: event.original_id,
                            track_data: trackData.id,
                            track: track.id,
                            original_track_id: t.id,
                            participant: participantIdMap[t.participant.id],
                            original_participant_id: t.participant.id,
                            class: existingClasses[t.participant.classEntity.id],
                            original_class_id: t.participant.classEntity.id,
                            time: p.t,
                            speed: p.s,
                            heading: p.h,
                            distance: p.d,
                            lon: p.lon,
                            lat: p.lat
                        }
                        positions.push(position)
                    })
    
                })
    
                // roundingJSON is an array
                var roundingJSON = all_event_data.rounding_json
                if(roundingJSON.length > 0){
                    roundingJSON.forEach(r => {
                        var rounding = {
                            id: uuidv4(),
                            original_id: r.id,
                            event: event.id,
                            original_event_id: event.original_id,
                            track: trackIdMap[r.trackId],
                            original_track_id: r.trackId,
                            course_mark: courseMarkIdMap[r.courseMarkId],
                            original_course_mark_id: r.courseMarkId,
                            time: r.time,
                            time_since_last_mark: r.timeSinceLastMark,
                            distance_since_last_mark: r.distanceSinceLastMark,
                            rst: r.rst,
                            rsd: r.rsd,
                            max_speed: r.maxSpeed
                        }
                        roundings.push(rounding)
                    })
                }
    
                var new_races = []
                var new_course_marks = []
                var new_marks = []
                var new_startlines = []
                var new_results = []
                
                raceExtras.forEach(raceExtra => {
                    var race = raceExtra.raceObject
                    new_races.push(race)
                    new_course_marks = new_course_marks.concat(raceExtra.courseMarks)
                    new_marks = new_marks.concat(raceExtra.marks)
                    new_startlines = new_startlines.concat(raceExtra.startlines)
                    new_results = new_results.concat(raceExtra.results)
                })
                var t = await sequelize.transaction()
                try{
                    await iSail.iSailEvent.create(event, Object.keys(event))
                    if(new_classes.length > 0){
                        await iSail.iSailClass.bulkCreate(new_classes, {fields: Object.keys(new_classes[0])})
                    }
                    if(participants.length > 0){
                        await iSail.iSailEventParticipant.bulkCreate(participants, {fields: Object.keys(participants[0])})
                    }
                    if(new_races.length > 0){
                        await iSail.iSailRace.bulkCreate(new_races, {fields: Object.keys(new_races[0])})
                    }
                    await iSail.iSailEventTracksData.create(trackData, {fields: Object.keys(trackData)})
        
                    if(tracks.length > 0){
                        await iSail.iSailTrack.bulkCreate(tracks,{fields: Object.keys(tracks[0])})
                    }
        
                    if(positions.length > 0){
                        await iSail.iSailPosition.bulkCreate(positions,{fields: Object.keys(positions[0])})
                    }
        
                    if(new_marks.length > 0){
                        await iSail.iSailMark.bulkCreate(new_marks,{fields: Object.keys(new_marks[0])})
                    }
                    if(new_startlines.length > 0){
                        await iSail.iSailStartline.bulkCreate(new_startlines,{fields: Object.keys(new_startlines[0])})
                    }
                    if(new_course_marks.length > 0){
                        await iSail.iSailCourseMark.bulkCreate(new_course_marks,{fields: Object.keys(new_course_marks[0])})
                    }
                    if(new_results.length > 0){
                        await iSail.iSailResult.bulkCreate(new_results,{fields: Object.keys(new_results[0])})
                    }
        
                    if(roundings.length > 0){
                        await iSail.iSailRounding.bulkCreate(roundings,{fields: Object.keys(roundings[0])})
                    }
                    t.commit()
                }catch(err){
                    t.rollback()
                    console.log(err)
                    await iSail.iSailFailedUrl.create({id:uuidv4(), url:url, error:err.toString()}, {fields:['id', 'url', 'error']})
                }

            }catch(err){
                console.log(err)
                await iSail.iSailFailedUrl.create({id:uuidv4(), url:url, error:err.toString()}, {fields:['id', 'url', 'error']})
            }
          
            
            counter += 1
        }
        await browser.close();
        
    } else {
        console.log('Unable to connect to DB.')
    }
    process.exit()
})();
