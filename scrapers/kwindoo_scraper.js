const {Kwindoo, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
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
        try{
            let currentRegatta = regattas[regattaIndex]

            if(new Date(currentRegatta.last_end_time).getTime() > now){
                console.log('Live or future race.')
                continue
            }
            
            console.log('Checking status of regatta.')
            let currentRegattaState = instantiateOrReturnExisting(existingObjects, Kwindoo.Regatta, currentRegatta.id)
            
            let regattaIsNew = currentRegattaState.shouldSave
            let newOrExistingRegatta = currentRegattaState.obj
            
            if(regattaIsNew){
                console.log('Regatta is new.')
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
                console.log('Creating new POIs, Running Groups and Video Streams.')
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
               
                for(runningGroupIndex in currentRegatta.running_groups){
                    let rg = currentRegatta.running_groups[runningGroupIndex]
                    await Kwindoo.RunningGroup.create({id:uuidv4(), original_id: rg.id, regatta:newOrExistingRegatta.id, regatta_original_id:newOrExistingRegatta.original_id,
                    name: rg.name, description:rg.description})
                }
               
                newOrExistingRegatta.name_slug = regattaDetails.name_slug
                newOrExistingRegatta.featured_background_path = regattaDetails.featured_background_path
                newOrExistingRegatta.sponsor_logo_path = regattaDetails.sponsor_logo_path
                await Kwindoo.Regatta.create(newOrExistingRegatta)


                
            }
                
            console.log('Going through all races... ')

            for(raceIndex in regattaDetails.races){
                console.log('Beginning new race.')
                let currentRace = regattaDetails.races[raceIndex]
                let url = 'https://www.kwindoo.com/tracking/' + newOrExistingRegatta.original_id + '-' + newOrExistingRegatta.name_slug + '?race_id=' + currentRace.id
                try{
                    let raceState = instantiateOrReturnExisting(existingObjects, Kwindoo.Race, currentRace.id)
                    if(!raceState.shouldSave){
                        console.log('Skipping existing race.')
                        continue
                    }
                    
                    let newRace = raceState.obj
                
                    newRace.regatta = newOrExistingRegatta.id
                    newRace.regatta_original_id = newOrExistingRegatta.original_id
                    newRace.name = currentRace.name
                    newRace.start_time = currentRace.start_time
                    newRace.end_time = currentRace.end_time
                    newRace.start_timestamp = currentRace.start_timestamp
                    newRace.end_timestamp = currentRace.end_timestamp
                    newRace.running_group_ids = JSON.stringify(currentRace.running_group_ids)
                    newRace.url = url
                

                    let newBoatObjects = []
                    let newPOIObjects = []
                    let newMIAObjects = []
                    let newWaypointObjects = []
                    let newCommentObjects = []
                    let newMarkerObjects = []
                    let newPositionsObjects = []

                    console.log('Getting boat data.')
                    let boatDataRequest =  await axios({
                        method:'get',
                        url:'https://api.kwindoo.com/api/regatta/get-boat-data?raceId=' + newRace.original_id
                    })
                    let boatDetails = boatDataRequest.data.response.users
                
                    boatDetails.forEach(boat => {
                        let b = instantiateOrReturnExisting(existingObjects, Kwindoo.Boat, boat.id).obj
                        b.regatta = newOrExistingRegatta.id,
                        b.regatta_original_id = newOrExistingRegatta.original_id,
                        b.race = newRace.id,
                        b.race_original_id = newRace.original_id,
                        b.first_name = boat.first_name,
                        b.last_name = boat.last_name,
                        b.email = boat.email,
                        b.boat_name = boat.boat_data.boat_name,
                        b.sail_number = boat.boat_data.sail_number,
                        b.race_number = boat.boat_data.race_number,
                        b.handycap = boat.boat_data.handycap,
                        b.helmsman = boat.boat_data.helmsman,
                        b.owner_name = boat.boat_data.owner_name,
                        b.registry_number = boat.boat_data.registry_number,
                        b.not_racer = boat.boat_data.not_racer,
                        b.homeport = boat.boat_data.homeport,
                        b.boat_type_name = boat.boat_data.boat_type.name,
                        b.boat_type_alias = boat.boat_data.boat_type.alias,
                        b.class = boat.boat_data.class
                        
                        if(b.shouldSave){
                            newBoatObjects.push(b)
                        }
                    })


                    console.log('Getting markers.')
                    let markersRequest =  await axios({
                        method:'get',
                        url:'https://api.kwindoo.com/ajax/race-office/track-editor/get-markers-by-race?raceId=' + newRace.original_id
                    })
                    let markers = markersRequest.data.response.markers
                
                    markers.forEach(marker => {
                
                        let m = {
                            id: uuidv4(),
                            original_id: marker.id,
                            regatta: newOrExistingRegatta.id,
                            regatta_original_id: newOrExistingRegatta.original_id,
                            race: newRace.id,
                            race_original_id: newRace.original_id,
                            name: marker.name,
                            lon: marker.lon,
                            lat: marker.lat,
                            approach_radius: marker.approach_radius 
                        }
                        newMarkerObjects.push(m)
                    });
                    
                    // Are these the same as above?
                    // let poiRequest =  await axios({
                    //     method:'get',
                    //     url:'https://api.kwindoo.com/tracking/get-pois?regattaId=' + newOrExistingRegatta.original_id
                    // })
                    // let pois = poiRequest.data.response
                    console.log('Getting MIAs.')
                    let miaRequest =  await axios({
                        method:'get',
                        url:'https://api.kwindoo.com/tracking/get-mias?regattaId=' + newOrExistingRegatta.original_id + '&raceId=' + newRace.original_id
                    })
                    let mias = miaRequest.data.response.mias
                    mias.forEach(mia => {
                        let m = {
                            id: uuidv4(),
                            original_id: mia.id,
                            regatta: newOrExistingRegatta.id,
                            regatta_original_id: newOrExistingRegatta.original_id,
                            race: newRace.id,
                            race_original_id: newRace.original_id,
                            name: mia.name,
                            northeast_lat: mia.northeast_lat,
                            northeast_lon: mia.northeast_lon,
                            southwest_lat: mia.soutwest_lat,
                            southwest_lon: mia.southwest_lon,
                            rotation: mia.rotation
                        }
                        newMIAObjects.push(m)
                    })
                    
                    console.log('Getting waypoints.')
                    let waypointRequest =  await axios({
                        method:'get',
                        url:'https://api.kwindoo.com/ajax/tracking/get-waypoints-by-race?raceId=' + newRace.original_id
                    })
                    let waypoints = waypointRequest.data.response.data.waypoints
                    waypoints.forEach(waypoint => {
                        
                        let w = {
                            id: uuidv4(),
                            original_id: waypoint.id,
                            regatta: newOrExistingRegatta.id,
                            regatta_original_id: newOrExistingRegatta.original_id,
                            race: newRace.id,
                            race_original_id: newRace.original_id, 
                            primary_marker_id: waypoint.primary_marker_id,
                            secondary_marker_id: waypoint.secondary_marker_id,
                            type: waypoint.type,
                            role: waypoint.role,
                            order_number: waypoint.order_number,
                            diameter: waypoint.diameter,
                            pass_direction: waypoint.pass_direction,
                            primary_marker_name: waypoint.primary_marker.name,
                            primary_marker_approach_radius: waypoint.primary_marker.approach_radius,
                            primary_marker_lat: waypoint.primary_marker.lat,
                            primary_marker_lon: waypoint.primary_marker.lon,
                            secondary_marker_name: (waypoint.secondary_marker === null)?null:waypoint.secondary_marker.name,
                            secondary_marker_approach_radius:(waypoint.secondary_marker === null)?null:waypoint.secondary_marker.approach_radius,
                            secondary_marker_lat:(waypoint.secondary_marker === null)?null:waypoint.secondary_marker.lat,
                            secondary_marker_lon:(waypoint.secondary_marker === null)?null:waypoint.secondary_marker.lon
                        }
                        newWaypointObjects.push(w)
                    })

                    console.log('Getting comments.')
                    let commentsDataRequest =  await axios({
                        method:'get',
                        url:'https://api.kwindoo.com/api/tracking/get-comments?raceId=' + newRace.original_id
                    })
                    let comments = commentsDataRequest.data.response.comments
                    comments.forEach(comment => {
                        let c = {
                            id: uuidv4(),
                            original_id: comment.id,
                            regatta: newOrExistingRegatta.id,
                            regatta_original_id: newOrExistingRegatta.original_id,
                            race: newRace.id,
                            race_original_id: newRace.original_id, 
                            text: comment.text,
                            event_type: comment.event_type,
                            lat: comment.lat,
                            lon: comment.lng,
                            created_at: comment.created_at,
                            created_at_timestamp: comment.created_at_timestamp,
                            boat_name: comment.boat_name
                        }
                        newCommentObjects.push(c)
                    })


                    let fromTimestamp = currentRace.start_timestamp
                    let toTimestamp = currentRace.end_timestamp 
                    
                    console.log('Getting positions.')
                    let posUrl = 'https://api.kwindoo.com/tracking/get-locations?stream=archive&fromTimestamp=' + fromTimestamp.toString() + '&raceId=' + newRace.original_id + '&toTimestamp=' + toTimestamp
                    let positionsDataRequest = await axios({
                        method:'get',
                        headers: { Accept:'*/*', 'User-Agent':'KwindooLive/3.6 (iPhone; iOS 13.7; Scale/3.00)'},
                        url:posUrl
                    })
                    let positions = positionsDataRequest.data.response.tracking_locations   
                    let boat_original_ids = Object.keys(positions)
                    boat_original_ids.forEach(oid => {
                        let id = getUUIDForOriginalId(existingObjects, Kwindoo.Boat, oid)
                        let pos = positions[oid]
                        pos.forEach(position => {
                          
                            let p = {
                                id: uuidv4(),
                                regatta: newOrExistingRegatta.id,
                                regatta_original_id: newOrExistingRegatta.original_id,
                                race: newRace.id,
                                race_original_id: newRace.original_id,
                                boat: id,
                                boat_original_id: oid,
                                i: position.i,
                                u: position.u,
                                t: position.t,
                                lat: position.l,
                                lon: position.o,
                                b: position.b,
                                a: position.a,
                                d: position.d,
                                s: position.s,
                                y: position.y
                            }
                            newPositionsObjects.push(p)
                        })
                    })

                    
                    let newObjectsToSave = [
                        { objectType:Kwindoo.Race, objects:[newRace]},
                        { objectType:Kwindoo.Boat, objects:newBoatObjects},
                        { objectType:Kwindoo.POI, objects:newPOIObjects},
                        { objectType:Kwindoo.MIA, objects:newMIAObjects},
                        { objectType:Kwindoo.Waypoint, objects:newWaypointObjects},
                        { objectType:Kwindoo.Comment, objects:newCommentObjects},
                        { objectType:Kwindoo.Marker, objects:newMarkerObjects},
                        { objectType:Kwindoo.Position, objects: newPositionsObjects}]
                    console.log('Bulk saving objects.')
                    await bulkSave(newObjectsToSave, Kwindoo.FailedUrl, url)
                    console.log('Finished saving race. On to the next one.')
                }catch(err){
                    console.log('Error downloading data.')
                    console.log(err)
                    await Kwindoo.FailedUrl.create({id:uuidv4(), url: url, error: err.toString()})
                }
                
                
                
            }

        
    
        }catch(err){
            await Kwindoo.FailedUrl.create({id:uuidv4(), url: 'regatta ' + regattaIndex, error: err})
        }
    }
})();


