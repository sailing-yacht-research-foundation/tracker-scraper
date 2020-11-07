const {TackTracker, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const FormData = require('form-data');
var AdmZip = require('adm-zip');
const exec = require('sync-exec');
const {gzip, ungzip} = require('node-gzip');
var parser = require('xml2json');

// BUG! Why are almost no regattas saved?

// https://tacktracker.com/cloud/home/OshkoshYachtClub/races/
( async () => {
    var CONNECTED_TO_DB = connect()
    

    if(CONNECTED_TO_DB){
        console.log('Getting data from DB...')
        const tacktrackerMetadata = await TackTracker.TackTrackerMetadata.findOne({ attributes: ['base_race_api_url', 'base_user_race_url', 'base_regatta_race_url']})
        const regattas = await TackTracker.TackTrackerRegatta.findAll({ attributes: ['id', 'url', 'original_id']})
        const users = await TackTracker.TackTrackerUser.findAll({attributes:['id', 'name']})
        console.log('Finished getting data from DB.')
        var existing_regatta_ids = []
        var existing_regatta_map = {}
        var existing_users = []
        var existing_user_map = {}
        var url_to_user = {}
        var url_to_regatta = {}
        for(regattaIndex in regattas){
            existing_regatta_ids.push(regattas[regattaIndex].original_id)
            existing_regatta_map[regattas[regattaIndex].original_id] = regattas[regattaIndex].id
        }

        for(userIndex in users){
            existing_users.push(users[userIndex].name)
            existing_user_map[users[userIndex].name] = users[userIndex].id
        }
        console.log('Searching for all users...')
        var all_users_hash = {}
        // TODO: make a utility method that includes this list of search characters and loops through it making requests to reuse for all scrapers.
        // var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","q","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0","_"]
        // for(index in alphabet){
        //     var search = alphabet[index]
        //     var searchUrl = "https://tacktracker.com/cloud/service/matching_usernames?term=" + search

        //     var searchResult = await axios.get(searchUrl)
        //     var results  = searchResult.data
        //     for(resultIndex in results){
        //         var user = results[resultIndex]
        //         all_users_hash[user] = user
        //     }
        // }
        console.log('Finished getting all users. Searching for all regattas...')

        // All regattas: this is rough.

        const overflow = ['cup',
        'regatta',
        'series',
        'championship',
        'worlds',
        'race',
        'euros',
        'IRC',
        'Asia',
        'youth', 
        'class', 
        'national',
        'class', 
        'sail', 
        'race',
        'YC',
        'club',
        'yacht',
        'ys'];

        const overflow2 = ['cup',
        'regatta',
        'series',
        'championship',
        'worlds',
        'race',
        'euros',
        'IRC',
        'Asia',
        'youth', 
        'class', 
        'national',
        'class', 
        'sail', 
        'race',
        'YC',
        'club',
        'yacht',
        'ys'];
        
        
        
        const underflow = [
            'Winter',
            'Summer',
            'Fall',
            'Autumn',
            'Spring',
            'pacific',
            'champs',
            'etchell',
            '2020',
            '2019',
            '2018',
            '2017',
            '2016',
            '2015',
            '2014',
            '2013',
            '2012',
            '2011',
            '2010',
            '2009',
            '2008',
            '2007',
            '2006',
            '2005',
            '2004',
            '2003',
            '505',
            'dragon',
            '470',
            '49er FX',
            'RS:X',
            'Laser',
            'Nacra',
            'Laser Radial',
            '2.4mR',
            '49er',
            'Finn',
            'Skud',
            'Sonar',
            'T293',
            'open',
            'Perth',
            'Edinburgh',
            'Pacific',
            'Europa',
            'São Paulo',
            'Britain',
            'UK',
            'Shearwater',
            'Carsington',
            'Melbourne',
            'USA',
            'Brisbane',
            'Sydney',
            'Victoria',
            'Oslo',
            'Semana',
            'Italia',
            'dubai',
            'china',
            'international',
            'cowes',
            'ORR',
            'ORC',
            'bay', 
            'lake', 
            'harbour',
            'gulf', 
            'port', 
            'porti',
            'vice',
            'junior',
            'men',
            'women',
            'team',
            'solo',
            'memorial',
            'state',
            'great',
            'league',
            'round',
            'division',
            'international',
            'island',
            'round',
            'lighthouse',
            'commodore',
            'navigation',
            'fleet',
            'British',
            'Australian',
            'Danish',
            'French',
            'Italian',
            'prince',
            'distance',
            'racing',
            'st',
            'Lambay ',
            'contender',
            'holiday',
            'easter',
            'captain',
            'yacht club',
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        var allWords = [].concat(underflow)
        var alphabet1 = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","q","x","y","z"]
        var alphabet2 = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","q","x","y","z"]
        var alphabet3 = ["", "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","q","x","y","z"]
        alphabet1.forEach(letter => {
            alphabet2.forEach(letter2 => {
                var combo = letter + letter2 + "yc"
                allWords.push(combo)
            })
        })
    
        overflow.forEach(word => {
            overflow2.forEach( w => {
                var newWord = word + ' ' + w
                allWords.push(newWord)
            })
        })

        
        var all_regattas_hash = {}
        for(index in allWords){
            const regexp = /\/cloud\/regattas\/show\/[0-9]*/g;
            var search = allWords[index]
            var search = await axios({
                method: 'post',
                url: 'https://tacktracker.com/cloud/regattas/search',
                data: "search="+ search,
                headers: {'Content-Type': 'multipart/form-data',
                'Connection': 'keep-alive',
                'Accept': 'text/html, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://tacktracker.com',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://tacktracker.com/cloud/regattas/show',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'tt8473=a78ctrgrnt7o9ohd7ooq6mv4bg558s2v; _ga=GA1.2.1428073689.1598324711; _gid=GA1.2.921704798.1599683485' }
                })
            var searchResults = search.data
            console.log(searchResults)
            var array = searchResults.toString().match(regexp);
            if(array != null){
                for(resultIndex in array){
                    var regatta_url = array[resultIndex]
                    all_regattas_hash[regatta_url] = regatta_url
                }
            }
        }
        console.log('Finished getting all regattas.')
        console.log('Making new user objects.')
        var all_user_urls = []
        var all_regatta_urls = []
        var all_users = [].concat(Object.keys(all_users_hash))
        var all_regattas = [].concat(Object.keys(all_regattas_hash))
        for(userIndex in all_users){
            var user = all_users[userIndex]
            all_user_urls.push('https://tacktracker.com/cloud/home/' + user + '/races')
            url_to_user['https://tacktracker.com/cloud/home/' + user + '/races'] = user
            if(! existing_users.includes(user)){
                // save user, and insert id into list
                var new_user_id = uuidv4()
                existing_users.push(user)
                existing_user_map[user] = new_user_id
                await TackTracker.TackTrackerUser.create({
                    id: new_user_id,
                    name: user,
                },{fields:['id', 'name']})
            }
        }
        console.log('Making new regatta objects.')
        for(regattaIndex in all_regattas){
            var regatta = all_regattas[regattaIndex]
            var full_regatta_url = 'https://tacktracker.com' + regatta
            var regatta_original_id = full_regatta_url.split('https://tacktracker.com/cloud/regattas/show/')[1]         
            all_regatta_urls.push(full_regatta_url)
            console.log(regatta_original_id)
            url_to_regatta[full_regatta_url] = regatta_original_id
            if(! existing_regatta_ids.includes(regatta_original_id)){
                // save regatta, and insert id into list
                var new_regatta_id = uuidv4()
                existing_regatta_ids.push(regatta_original_id)
                existing_regatta_map[regatta_original_id] = new_regatta_id
                await TackTracker.TackTrackerRegatta.create({
                    id: new_regatta_id,
                    url: full_regatta_url,
                    original_id: regatta_original_id
                },{fields:['id', 'url', 'original_id']})
            }
        }
        console.log('Making list of all race ids...')

        // // race_id_hash stores id to url
        var race_id_hash = {}
        var users_to_races = {}
        var regattas_to_races = {}
        for(userUrlIndex in all_user_urls){
            var currentUrl = all_user_urls[userUrlIndex]
            var result = await axios.get(currentUrl)
            var resultData = result.data
            const regexp = /onclick="viewRace\('[0-9]*'/g;
        
            var matches = resultData.toString().match(regexp)
            var currentUser = url_to_user[currentUrl]
  
            if(users_to_races[currentUser] === undefined){
                users_to_races[currentUser] = []
            }
            if(matches !== null){
                for(matchIndex in matches){
                    var match = matches[matchIndex]
                    var regex2 = /[0-9]+/;
                    var race_id = match.match(regex2)[0]
                    race_id_hash[race_id] = currentUrl + '/' + race_id
                    users_to_races[currentUser].push(race_id)
                }
            }
        }

        for(regattaUrlIndex in all_regatta_urls){
            var currentUrl = all_regatta_urls[regattaUrlIndex]
            var result = await axios.get(currentUrl)
            var resultData = result.data
            const regexp = /onclick="viewRace\('[0-9]*'/g;
        
            var matches = resultData.toString().match(regexp)
            var currentRegatta = url_to_regatta[currentUrl]
         
            if(regattas_to_races[currentRegatta] === undefined){
                regattas_to_races[currentRegatta] = []
            }
            if(matches !== null){
                for(matchIndex in matches){
                    var match = matches[matchIndex]
                    var regex2 = /[0-9]+/;
                    var race_id = match.match(regex2)[0]
                    race_id_hash[race_id] = currentUrl
                    regattas_to_races[currentRegatta].push(race_id)
                }
            }
        }

        console.log('List of all race ids finished being populated.')

        var race_ids = Object.keys(race_id_hash)
        
       
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
                var raceUrl = race_id_hash[race_id]

                var newRaceId = uuidv4()

                var regattaOriginalId = url_to_regatta[raceUrl]
                var userOriginalId = url_to_user[raceUrl]

                // Races either belong to a regatta or a user.
                if(regattaOriginalId === undefined && userOriginalId === undefined){
                    if(raceUrl.includes('regattas')){
                        
                        regattaOriginalId = raceUrl.replace('https://tacktracker.com/cloud/regattas/show/', '')
                    } else {
                        userOriginalId = raceUrl.split('home/')[1].split('/races')[0]
                    }
                }
                var regatta = existing_regatta_map[regattaOriginalId]
                var user = existing_user_map[userOriginalId]


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
    
                await TackTracker.TackTrackerRace.create({
                    id: newRaceId,
                    original_id: race_id,
                    url: raceUrl,
                    regatta: regatta,
                    user: user,
                    regatta_original_id: regattaOriginalId,
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
                await TackTracker.TackTrackerDefault.create({
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
                    await TackTracker.TackTrackerStart.create({
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
                    await TackTracker.TackTrackerFinish.create({
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
                
                    await TackTracker.TackTrackerMark.bulkCreate(marks_array,{
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
                    await TackTracker.TackTrackerMark.bulkCreate(marks_array,{
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
                    await TackTracker.TackTrackerBoat.create({
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
                    await TackTracker.TackTrackerPosition.bulkCreate(positions,{
                        fields:['id', 'boat', 'race', 'time', 'lon', 'lat']
                    })
                }
            }catch(err){
                console.log(race_id)
                console.log(err)
            }
            
        }
    }else{
        console.log('not connected')
    }
})();
