const {Kwindoo, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');


( async () => {
    connect()
    var existingObjects = await findExistingObjects(Kwindoo)
  
    var regattaListRequest = await axios({
        method:'post',
        url:'https://api.kwindoo.com/api/regatta/all'
    })
    var now = new Date().getTime()
    var regattas = regattaListRequest.data.response.regattas
    
    for(regattaIndex in regattas){

        let currentRegatta = regattas[regattaIndex]

        if(new Date(currentRegatta.last_end_time).getTime() > now){
            console.log('Live or future race.')
            continue
        }
        
        console.log('new regatta')
        let currentRegattaState = instantiateOrReturnExisting(existingObjects, Kwindoo.Regatta, currentRegatta.id)
        
        let regattaIsNew = currentRegattaState.shouldSave
        let newOrExistingRegatta = currentRegattaState.obj
        
        if(regattaIsNew){
            let ownerState = instantiateOrReturnExisting(existingObjects, Kwindoo.RegattaOwner, currentRegatta.owner_id)
            
            if(!ownerState.shouldSave){
                newOrExistingRegatta.owner = ownerState.obj.id
                newOrExistingRegatta.owner_original_id = ownerState.obj.original_id
            }else{
                ownerState.obj.regatta = newOrExistingRegatta.id
                ownerState.obj.regatta_original_id = newOrExistingRegatta.original_id
                ownerState.obj.first_name = currentRegatta.owner.first_name
                ownerState.obj.last_name = currentRegatta.owner.last_name
                ownerState.obj.email = currentRegatta.owner.email
                ownerState.obj.facebook_user_id = currentRegatta.owner.facebook_user_id
                await Kwindoo.RegattaOwner.create(ownerState.obj)
            }

            let homeportState = instantiateOrReturnExisting(existingObjects, Kwindoo.HomeportLocation, currentRegatta.homeport_location.id)
            homeportState.obj.country = currentRegatta.homeport_location.country
            homeportState.obj.state = currentRegatta.homeport_location.state
            homeportState.obj.city = currentRegatta.homeport_location.city
            homeportState.obj.address = currentRegatta.homeport_location.address
            homeportState.obj.zip = currentRegatta.homeport_location.zip
            homeportState.obj.notice = currentRegatta.homeport_location.notice
            homeportState.obj.lat = currentRegatta.homeport_location.lat
            homeportState.obj.lon = currentRegatta.homeport_location.lon
            homeportState.obj.regatta = newOrExistingRegatta.id
            homeportState.obj.regatta_original_id = newOrExistingRegatta.original_id
            await Kwindoo.HomeportLocation.create(homeportState.obj)
            
            // viewable url = https://www.kwindoo.com/tracking/7233-wvfyci-mittwochsregatta?race_id=20378


            // Running group?
            
            newOrExistingRegatta.owner = ownerState.obj.id
            newOrExistingRegatta.owner_original_id = ownerState.obj.original_id
            newOrExistingRegatta.name = currentRegatta.name
            newOrExistingRegatta.timezone = currentRegatta.timezone
            newOrExistingRegatta.public = currentRegatta.public
            newOrExistingRegatta.private = currentRegatta.private
            newOrExistingRegatta.sponsor = currentRegatta.sponsor
            newOrExistingRegatta.display_waypoint_pass_radius = currentRegatta.display_waypoint_pass_radius
            newOrExistingRegatta.name_slug = currentRegatta.name_slug
            newOrExistingRegatta.first_start_time = currentRegatta.first_start_time
            newOrExistingRegatta.last_end_time = currentRegatta.last_end_time
            newOrExistingRegatta.updated_at_timestamp = currentRegatta.updated_at_timestamp
            newOrExistingRegatta.regatta_logo_path = currentRegatta.regatta_logo_path        
        }

        let detailsRequest = await axios({
            method:'get',
            url:'https://api.kwindoo.com/api/regatta/get-details?regatta_id=' + currentRegatta.id
        })

        let regattaDetails = detailsRequest.data.response.regatta
      
        if(regattaIsNew){

            for(poiIndex in regattaDetails.pois){
                let poi = regattaDetails.pois[poiIndex]
                Kwindoo.POI.create({id:uuidv4(), original_id:poi.id, regatta: newOrExistingRegatta.id, regatta_original_id: newOrExistingRegatta.original_id, 
                 name:poi.name, lat:poi.lat, lon:poi.lon, link:poi.link, description:poi.description})
            }   
            for(videoStreamIndex in regattaDetails.video_streams){
                let stream = regattaDetails.video_streams[videoStreamIndex]
                Kwindoo.VideoStream.create({id:uuidv4(), original_id:stream.id, regatta:newOrExistingRegatta.id, regatta_original_id:newOrExistingRegatta.original_id,
                source:stream.source, video_id: stream.video_id, start_time: stream.start_time, end_time: stream.end_time, start_timestamp: stream.start_timestamp, end_timestamp:stream.end_timestamp})
            }
            newOrExistingRegatta.name_slug = regattaDetails.name_slug
            newOrExistingRegatta.featured_background_path = regattaDetails.featured_background_path
            newOrExistingRegatta.sponsor_logo_path = regattaDetails.sponsor_logo_path
            await Kwindoo.Regatta.create(newOrExistingRegatta)
        }
        
 /** 
  pois:
   [ { id: 104,
       regatta_id: 15891,
       name: 'Stone Man',
       lat: '47.59449005',
       lon: '-122.48060095',
       image_url: 'poi-image-104-e2413a785e7de31cad80bf9179322a132ee074f9.jpg',
       image_size: 30,
       link:
        'https://mynorthwest.com/27662/artist-behind-mysterious-sculpture-off-bainbridge-island-comes-clean/',
       description: 'Blakely Rock Stone Man Scupture',
       background_color: '#ededed',
       path:
        'https://cdn.kwindoo.com/uploads/regattas/pois/poi-image-104-e2413a785e7de31cad80bf9179322a132ee074f9.jpg',
       click_url: 'https://api.kwindoo.com/metrics/poi/104/click' } ],
  video_streams:
   [ { id: 155,
       regatta_id: 15891,
       video_source: 'youtube',
       video_id: 'UCWbNT9CfFkJYT9LYehM25Eg',
       position: 'primary',
       start_time: '2020-06-11 00:45:00',
       end_time: '2020-06-11 04:00:00',
       deleted: 0,
       start_timestamp: 1591836300,
       end_timestamp: 1591848000 } ],
         */
        
        // TODO: save regatta if necessary.

        for(raceIndex in regattaDetails.races){
            let currentRace = regattaDetails.races[raceIndex]
            let raceState = instantiateOrReturnExisting(existingObjects, Kwindoo.Race, currentRace.id)
            if(!raceState.shouldSave){
                console.log('Skipping existing race.')
                continue
            }

            let newRace = raceState.obj
            let newBoatObjects = []
            let newPOIObjects = []
            let newMIAObjects = []
            let newWaypointObjects = []
            let newCommentObjects = []
            let newMarkerObjects = []
            let newPositionsObjects = []
            
       //     console.log(currentRace)
       //     console.log(newRace)

            let boatDataRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/api/regatta/get-boat-data?raceId=' + newRace.original_id
            })
            let boatDetails = boatDataRequest.data.response.users
           
            boatDetails.forEach(boat => {
              
                let b = {
                    id: uuidv4(),
                    original_id: boat.id,
                    regatta:newOrExistingRegatta.id,
                    regatta_original_id: newOrExistingRegatta.original_id,
                    race:newRace.id,
                    race_original_id: newRace.original_id,
                    first_name:boat.first_name,
                    last_name:boat.last_name,
                    email:boat.email,
                    boat_name: boat.boat_data.boat_name,
                    sail_number: boat.boat_data.sail_number,
                    race_number: boat.boat_data.race_number,
                    handycap: boat.boat_data.handycap,
                    helmsman: boat.boat_data.helmsman,
                    owner_name: boat.boat_data.owner_name,
                    registry_number: boat.boat_data.registry_number,
                    not_racer: boat.boat_data.not_racer,
                    homeport: boat.boat_data.homeport,
                    boat_type_name: boat.boat_data.boat_type.name,
                    boat_type_alias: boat.boat_data.boat_type.alias,
                    class: boat.boat_data.class
                }
                newBoatObjects.push(b)
            })

            let markersRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/ajax/race-office/track-editor/get-markers-by-race?raceId=' + newRace.original_id
            })
            let markers = markersRequest.data.response
            
            // Are these the same as above?
            // let poiRequest =  await axios({
            //     method:'get',
            //     url:'https://api.kwindoo.com/tracking/get-pois?regattaId=' + newOrExistingRegatta.original_id
            // })
            // let pois = poiRequest.data.response
            
            let miaRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/tracking/get-mias?regattaId=' + newOrExistingRegatta.original_id + '&raceId=' + newRace.original_id
            })
            let mias = miaRequest.data.response

            // https://api.kwindoo.com/ajax/tracking/get-waypoints-by-race?raceId=20377
            let waypointRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/ajax/tracking/get-waypoints-by-race?raceId=' + newRace.original_id
            })
            let waypoints = waypointRequest.data.response.data.waypoints

            let commentsDataRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/api/tracking/get-comments?raceId=' + newRace.original_id
            })
            let comments = commentsDataRequest.data.response.comments

            let fromTimestamp = currentRace.start_timestamp
            let toTimestamp = currentRace.end_timestamp 
       
            let posUrl = 'https://api.kwindoo.com/tracking/get-locations?stream=archive&fromTimestamp=' + fromTimestamp.toString() + '&raceId=' + newRace.original_id + '&toTimestamp=' + toTimestamp
            let positionsDataRequest = await axios({
                method:'get',
                headers: { Accept:'*/*', 'User-Agent':'KwindooLive/3.6 (iPhone; iOS 13.7; Scale/3.00)'},
                url:posUrl
            })
            let positions = positionsDataRequest.data.response.tracking_locations   
        }

        
    }
})();


