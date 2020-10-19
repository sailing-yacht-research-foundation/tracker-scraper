const {Bluewater, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');

( async () => {
    var CONNECTED_TO_DB = connect()
 

      if(CONNECTED_TO_DB){
        
        const bluewaterMetadata = await Bluewater.BluewaterMetadata.findOne({ attributes: ['last_update_time', 'base_url', 'base_referral_url']})
        const bluewaterRaces = await Bluewater.BluewaterRace.findAll({attributes: ['original_id', 'name', 'referral_url', 'id']})
        const bluewaterBoats = await Bluewater.BluewaterBoat.findAll({attributes: ['original_id', 'id']})

        var existingRaces = []
        bluewaterRaces.forEach(r => {
          existingRaces.push(r.original_id)
        })

        var boatOriginalIdToNewId = {}
        bluewaterBoats.forEach(b=>{
          boatOriginalIdToNewId[b.original_id] = b.id
        })

        // Visit the Bluewater Home Page and look for new URLS.
        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // await page.goto(BLUEWATER_TRACKS_HOME_PAGE, {waitUntil: "networkidle2", timeout: 300000});
        // const raceUrls = await page.evaluate(() => Array.from(document.querySelectorAll('#races > div > div > table > tbody > tr > td:nth-child(1) > a'), element => element.href));
        
        // Get URLs from API:
        var today = new Date()
        var todayPlusMonth = new Date();
        todayPlusMonth.setMonth(todayPlusMonth.getMonth() + 1);
        var raceListApiUrl = 'https://api.bluewatertracks.com/api/racelist/' + bluewaterMetadata.last_update_time + '/' + todayPlusMonth.toISOString()
        console.log(raceListApiUrl)
        var result = await axios.get(raceListApiUrl)
        var races = result.data.raceList
        
        var baseUrl = bluewaterMetadata.base_url
        
        
        
        for(index in races){
            var raceObj = races[index]
            var raceUrl = baseUrl+raceObj.slug
            var result = await axios.get(raceUrl)
            var resultData = result.data
            
            var positions = resultData.positions
            var race = resultData.race

            var trackTimeStart = race.trackTimeStart
            var trackTimeFinish = race.trackTimeFinish
            var startTimestamp = new Date(trackTimeStart).getTime()
            var endTimestamp = new Date(trackTimeFinish).getTime()

            var nowTimestamp = new Date().getTime()
            if( (startTimestamp > nowTimestamp) || (endTimestamp === null) || (endTimestamp > nowTimestamp) ){
              console.log('future race')
              continue
            }
            
            if(positions.length === 0 || existingRaces.includes(raceObj._id)){
              continue
            }

            // Each race is it's own transaction:
            var t = await sequelize.transaction()
            try {
              var boats = race.boats
              var map = race.map
  
              var raceName = race.raceName
              var raceStartTime = race.raceStartTime
              var timezone = race.timezone
              var finishTimzone = race.finishTimezone
              var sponsor = race.sponsor
              var accountName = race.accountName
              var accountWebsite = race.accountWebsite
              var announcement = race.announcement
              var calculation = race.calculation
              var raceOriginalId = raceObj._id
              var raceNewId = uuidv4()
  
              // Create the Race
              var currentRace = await Bluewater.BluewaterRace.create({
                  name: raceName,
                  referral_url: bluewaterMetadata.base_referral_url + raceObj.slug,
                  start_time: raceStartTime,
                  timezone_location: timezone.location,
                  timezone_offset: timezone.offset,
                  finish_timezone_location: finishTimzone.location,
                  finish_timezone_offset: finishTimzone.offset,
                  track_time_start: trackTimeStart,
                  track_time_finish: trackTimeFinish,
                  account_name: accountName,
                  account_website: accountWebsite,
                  calculation: calculation,
                  slug: raceObj.slug,
                  original_id: raceOriginalId,
                  id: raceNewId
                }, { fields: ['name', 'referral_url', 'start_time', 'timezone_location','timezone_offset', 'finish_timezone_location', 'finish_timezone_offset', 
              'track_time_start','track_time_finish','account_name','account_website','calculation','slug','original_id','id'
              ] });
  
              
              // Create Announcement
              if(announcement !== null && announcement !== undefined){
                var currentAnnouncement = await Bluewater.BluewaterAnnouncement.create({
                  html: announcement.html,
                  time: announcement.time,
                  race: raceNewId,
                  id: uuidv4(),
                }, { fields: ['html', 'time', 'race', 'id']})
              }
             
  
  
              // Map
              var center_lon = map.center[0]
              var center_lat = map.center[1]
              const currentMap = await Bluewater.BluewaterMap.create({
                  id: uuidv4(),
                  race: currentRace.id,
                  center_lon: center_lon,
                  center_lat: center_lat,
                  start_line: JSON.stringify(map.startLine.geometry.coordinates),
                  finish_line: JSON.stringify(map.finishLine.geometry.coordinates),
                  course: JSON.stringify(map.course.geometry.coordinates),
                  regions: JSON.stringify(map.regions)
               }, { fields: ['id','race', 'center_lon','center_lat','start_line','finish_line', 'course', 'regions']
              });
  
            
           
            for(boatIndex in boats){
                  var boat = boats[boatIndex]
                     
                  var boatOriginalId = boat.boat_id
                  var boatNewId = uuidv4()
                 
                  var boatName = boat.boatName
                  var mmsi = boat.mmsi
                  var skipper = boat.skipper
                  var sailNo = boat.sailNo
                  var design = boat.design
                  var length = boat.length
                  var width = boat.width
                  var units = boat.units
                  var draft = boat.draft
                  var type = boat.type
                  var bio = boat.bio
                  var countryName = boat.country.name
                  var countryCode = boat.country.code
                  var finishTime = boat.finishTime
                  var status = boat.status
                  var message = boat.message
                  
                  await Bluewater.BluewaterBoat.create({
                    original_id: boatOriginalId,
                    id: boatNewId,
                    name: boatName,
                    mmsi: mmsi,
                    skipper: skipper,
                    sail_no: sailNo,
                    design: design,
                    length: length,
                    width: width,
                    units: units,
                    draft: draft, 
                    type: type,
                    bio: bio,
                    country_name: countryName,
                    country_code: countryCode,
                    finish_time: finishTime,
                    status: status,
                    race: raceNewId,
                    race_original_id: raceOriginalId,
                    message: message
                  }, {
                    fields: ['original_id', 'id', 'name', 'mmsi', 
                  'skipper', 'sail_no', 'design', 'length', 'width', 'units', 'draft', 'type',
                  'bio', 'country_name', 'country_code', 'finish_time', 'status', 'race', 'race_original_id', 'message']
                  })
                  
                  for(crewIndex in boat.crews) {
                    var crew = boat.crews[crewIndex]
                    var firstName = crew.firstName
                    var lastName = crew.lastName
                    var imageUrl = crew.imageURL
                    var bio = crew.bio
                    var country = crew.country
                    var c_code = null
                    var c_name = null
                    if(country !== undefined){
                      c_code = crew.country.code
                      c_name = crew.country.name
                    }
            
                    var role = crew.crewRole
                    var crewId = uuidv4()
                 
                    await Bluewater.BluewaterCrew.create({ 
                      first_name: firstName,
                      last_name: lastName,
                      image_url: imageUrl,
                      bio: bio,
                      country_code: c_code,
                      country_name: c_name,
                      boat: boatNewId,
                      boat_original_id: boatOriginalId,
                      race: raceNewId,
                      race_original_id: raceOriginalId,
                      id: crewId,
                      role: role
                    },{ fields: ['first_name','last_name','image_url','bio','country_name','country_code','boat',
                        'boat_original_id', 'race', 'race_original_id', 'id', 'role']})
                      
  
                    for(crewSmIndex in crew.socialMedia){
                      var crewSocialMedia = crew.socialMedia[crewSmIndex]
                      var crewSmIcon = crewSocialMedia.icon
                      var crewSmUrl = crewSocialMedia.url
                      
                      await Bluewater.BluewaterCrewSocialMedia.create({
                        crew: crewId,
                        url: crewSmUrl,
                        id: uuidv4()
                      }, {fields: ['crew', 'url', 'id']})
  
                    }
  
  
                  }
  
                  for(handicapIndex in boat.handicaps) {              
                    var hc = boat.handicaps[handicapIndex]
                    var name = hc.name
                    var rating = hc.rating
                    var division = hc.division
                    var hc_id = hc.handicaps_id
                 
                    await Bluewater.BluewaterBoatHandicap.create({
                      id: uuidv4(),
                      name: name,
                      rating: rating,
                      division: division,
                      original_id: hc_id,
                      boat: boatNewId,
                      boat_original_id: boatOriginalId
                    }, {fields:['id', 'name', 'rating', 'division', 'original_id', 'boat', 'boat_original_id']})
  
                  }
            
                  
                  for( smIndex in boat.socialMedia) {
                    var sm = boat.socialMedia[smIndex]
  
                    var icon = sm.icon
                    var url = sm.url
                    await Bluewater.BluewaterBoatSocialMedia.create({
                      boat: boatNewId,
                      boat_original_id: boatOriginalId,
                      icon: icon,
                      url: url,
                      race: raceNewId,
                      race_original_id: raceOriginalId,
                      id: uuidv4()
                    }, {
                      fields:['boat', 'boat_original_id', 'icon', 'url', 'race', 'race_original_id', 'id']
                    })
                  }
             }
             var limit = 100000
             var current = 1
             var positionEntries = []
             for(positionIndex in positions){
  
               var position = positions[positionIndex]
               var geometry_type = position.geometry.type
              
               var coord_0 = position.geometry.coordinates[0]
               var coord_1 = position.geometry.coordinates[1]
               var coord_2 = position.geometry.coordinates[2]
  
               var boatOriginalId = position.properties.boat_id
               var boatName = position.properties.boatName
           
               var cog = position.properties.cog
               var date = position.properties.date
               var deviceId = position.properties.deviceId
               var sog = position.properties.sog
               var source = position.properties.source
              
               var position = {
                 geometry_type: geometry_type,
                 coordinate_0: coord_0,
                 coordinate_1: coord_1,
                 coordinate_2: coord_2,
                 race: raceNewId,
                 race_original_id: raceOriginalId,
                 boat_original_id: boatOriginalId,
                 boat_name: boatName,
                 cog: cog,
                 date: date,
                 device_id: deviceId,
                 sog: sog, 
                 source: source,
                 id: uuidv4()
               }
               
               positionEntries.push(position)
  
               current += 1
               if(current > limit){
            
                 Bluewater.BluewaterPosition.bulkCreate(positionEntries, {
                   fields:['geometry_type', 'coordinate_0', 'coordinate_1', 'coordinate_2', 'race',
                  'race_original_id', 'boat_original_id', 'boat_name', 'cog', 'date', 'device_id', 'sog', 'source', 'id'],
                  hooks: false,
  
                 }).then(()=>{
                   console.log('100K Positions Inserted!')
                 })
                 current = 1
                 positionEntries = []
               }
               
             }
             Bluewater.BluewaterPosition.bulkCreate(positionEntries, {
              fields:['geometry_type', 'coordinate_0', 'coordinate_1', 'coordinate_2', 'race',
             'race_original_id', 'boat_original_id', 'boat_name', 'cog', 'date', 'device_id', 'sog', 'source', 'id'],
             hooks: false,
  
              }).then(()=>{
                console.log('Positions Inserted!')
              })
              
              await Bluewater.BluewaterSuccessfulUrl.create({
                id: uuidv4(),
                date_attempted: today.toISOString(),
                url: raceUrl
              }, {fields: ['id', 'date_attempted', 'url']})
              await t.commit()
            } catch (error) {
              console.log('ERROR IN TRANSACTION')
              console.log(error)
              await t.rollback()
              await Bluewater.BluewaterFailedUrl.create({
                id: uuidv4(),
                date_attempted: today.toISOString(),
                url: raceUrl
              }, {fields: ['id', 'date_attempted', 'url']})
            }
        }
        await sequelize.close()
        process.exit(0);
      } else {
          // Not connected to db.

      }      
})()
