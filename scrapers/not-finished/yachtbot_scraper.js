const {YachtBot, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');

( async () => {
    await connect()
    var existingObjects = await findExistingObjects(YachtBot)
    console.log(existingObjects)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  

    var idx = 17302

    //var idx = 17000
 
    while(idx < 17316){

        var raceSaveObj = instantiateOrReturnExisting(existingObjects, YachtBot.Race, idx)
        if(! raceSaveObj.shouldSave){
            idx++
            console.log('Already saved this so skipping.')
            continue
        }

        page_url = 'http://www.yacht-bot.com/races/' + idx 

        try{

            console.log('about to go to page ' + page_url)
            await page.goto(page_url, {timeout: 0, waitUntil: "networkidle0"})
            console.log('went to page ' + page_url)
            var should_continue = await page.waitForFunction("document.querySelector('#overlay > div.error-state').style.display === 'none'").then(()=>{ return true}).catch(e => {return false})
            if(should_continue){
                token = await page.evaluate(()=>{
                    return oauth_access_token
                });
            
                var session = await axios.get("https://www.igtimi.com/api/v1/sessions/" + idx + "?access_token=" + token)
                var start_time = session.data.session.start_time
                var end_time = session.data.session.end_time

                if(start_time > new Date().getTime() || end_time > new Date().getTime()){
                    console.log('Future race so skipping.')
                    idx++
                    continue
                }

                session.data.session.url = page_url
    
                var race_info = await axios.get("https://www.igtimi.com/api/v1/sessions/" + idx + "/logs?access_token=" + token)
                var current_time = new Date().getTime()
            
                var windows = await axios.get("https://www.igtimi.com/api/v1/devices/data_access_windows?start_time=" + start_time + "&end_time=" + current_time + "&types%5B%5D=read&types%5B%5D=modify&access_token=" + token )
        
                var permissionsUrl = "https://www.igtimi.com/api/v1//resources?permission=read&start_time=" + start_time + "&end_time=" + end_time
                var resources = JSON.parse(xml2json.toJson(race_info.data))

                var things = {}
                var no_id_things = []
                resources['session']['content']['log']['log_entry'].forEach(entry => {
                    
                    
                        if(entry['data']['object_data'] !== undefined){
                            
                            serial_number = entry['data']['object_data']['object_content']['serial_number']
                            if(serial_number === undefined){
                        
                            
                                no_id_things.push(entry['data']['object_data'])
                            }else{
                                
                                things[serial_number] = entry['data']['object_data']['object_content']
                                things[serial_number].uuid = uuidv4()
                                permissionsUrl = permissionsUrl + "&serial_numbers%5B%5D=" + serial_number
                            }
                            
                        
                            
                        }
                        if(entry['data']['device'] !== undefined){
                            serial_number = entry['data']['device']['serial_number']
                            things[serial_number] = entry['data']['device']
                        
                            things[serial_number].uuid = uuidv4()
                            permissionsUrl = permissionsUrl + "&serial_numbers%5B%5D=" + serial_number
                        }
                    
                        if(entry['data']['metadata'] !== undefined){
                        
                        session.data.session.manual_wind = entry.data.metadata.manual_wind
                        session.data.session.course_direction = entry.data.metadata.course_direction
                        }
                    
                    })

                race_ids_to_serials = {}
                no_id_things.forEach(t => {
                    let serial_numbers = Object.keys(things)
                    serial_numbers.forEach(s =>{
                        if(things[s].object_id === t.object_id){
                            things[s].content = t.object_content
                            race_ids_to_serials[t.object_id] = s
                        }
                    })
                })
                permissionsUrl = permissionsUrl + "&access_token=" + token 
        
                var permissions = await axios.get(permissionsUrl)
                
                var devicesUrl = 'https://www.igtimi.com/api/v1/devices'
                var data_5 = "_method=GET"
                windows.data["data_access_windows"].forEach( data_access_window => {
                        data_5 = data_5 + "&serial_numbers%5B%5D=" 
                        serial_number = data_access_window["data_access_window"].device_serial_number
                        data_5 = data_5 + "&serial_numbers%5B%5D=" + serial_number
                    })
                data_5 = data_5 + "&access_token=" + token 
                
                var devicesRequest = await axios({
                    method:'post',
                    url: devicesUrl,
                    data: data_5
                })

            
                var serials = {}
                devicesRequest.data.devices.forEach(d=>{
                    console.log(d)
                    serials[d.device.serial_number] = d               
                })

            

        
                // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals
                var data_6 = "start_time=" + start_time + "&end_time=" + end_time + "&types%5B1%5D=0&types%5B2%5D=0&types%5B3%5D=0&types%5B4%5D=0&types%5B5%5D=0&types%5B6%5D=0&types%5B7%5D=0&types%5B8%5D=0&types%5B9%5D=0&types%5B10%5D=0&types%5B11%5D=0&types%5B12%5D=0&types%5B13%5D=0&types%5B14%5D=0&types%5B15%5D=0&types%5B16%5D=0&types%5B17%5D=0&types%5B18%5D=0&types%5B19%5D=0&types%5B20%5D=0&types%5B21%5D=0&types%5B22%5D=0&types%5B23%5D=0&types%5B24%5D=0&types%5B25%5D=0&types%5B26%5D=0&types%5B27%5D=0&types%5B28%5D=0&types%5B29%5D=0&types%5B30%5D=0&types%5B31%5D=0&types%5B32%5D=0&types%5B33%5D=0&types%5B34%5D=0&types%5B35%5D=0&types%5B36%5D=0&types%5B37%5D=0&types%5B38%5D=0&types%5B39%5D=0&types%5B40%5D=0&types%5B41%5D=0&types%5B42%5D=0&types%5B43%5D=0&types%5B44%5D=0&types%5B45%5D=0&types%5B46%5D=0&types%5B47%5D=0&types%5B48%5D=0&types%5B49%5D=0&types%5B50%5D=0&types%5B51%5D=0&types%5B52%5D=0&types%5B53%5D=0&types%5B54%5D=0&types%5B55%5D=0&types%5B56%5D=0&types%5B57%5D=0&types%5B23%5D=0&restore_archives=true"
                resources['session']['content']['log']['log_entry'].forEach(entry => {
                    // console.log(entry['data']['device'])
                    // console.log(entry['data'])
                    if(entry['data']['device'] !== undefined){
                        device_number = entry['data']['device']['serial_number']
                        data_6 = data_6 + "&serial_numbers%5B%5D=" + device_number
                    }
                })
        
                data_6 = data_6 + "&_method=GET&restore_archives=true&access_token=" + token 
                var positionsRequest = await axios({
                    method:'post',
                    url: 'https://www.igtimi.com/api/v1/resources/data',
                    data: data_6
                })
        
            var positionSerials = Object.keys(positionsRequest.data)
            
            // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals
            

            var boats = []
            var buoys = []
            var positions = []

            positionSerials.forEach(s => {
                
                    let data = positionsRequest.data[s]
                    
                
                    let gps = data['1']

                    let device = things[s]

                    

                    /**
                     * { id: 3010,
                        name: 'YB-9',
                        serial_number: 'DC-GD-AADE',
                        uid: null,
                        imei: null,
                        owner_id: 3053,
                        device_user_group_id: 17823,
                        admin_device_user_group_id: 17822,
                        permissions: { read: false, modify: false },
                        blob: false,
                        device_info: true }
                    */

                    let gpsQuality = data['2']
                    let gpsQualitySatCount = data['3']
                    let gpsQualityHDOP = data['4']
                    let gpsAltitude = data['5']
                    let cog = data['6']
                    let hdgm = data['7']
                    let hdg = data['8']
                    let sog = data['9']
                    let stw = data['10']
                    let awa = data['11']
                    let aws = data['12']
                    let antHrm = data['13']
                    let quaternion = data['17']
                    let acceleration = data['18']
                    let gyro = data['19']
                    let force = data['20']
                    let torque = data['21']
                    let twa = data['22']
                    let tws = data['23']
                    let pressure = data['24']
                    
                    // let metas = JSON.stringify({gpsQuality, gpsQualitySatCount, gpsQualityHDOP, gpsAltitude, cog, hdgm, hdg, sog, stw, awa, aws, antHrm, quaternion, acceleration, gyro, 
                    //     force, torque, twa, tws, pressure})
                    let metas = null

                    let current_positions = []

                    if(gps !== undefined && gps !== null){
                        let lons = gps['1']
                        let lats = gps['2']
                        let gpsTimes = gps['t']

                        for(gpsTimeIndex in gpsTimes){
                            let t = gpsTimes[gpsTimeIndex]
                            let lon = lons[gpsTimeIndex]
                            let lat = lats[gpsTimeIndex]
                            let quality = null
                            if(gpsQuality.length >= gpsTimeIndex){
                                quality = gpsQuality
                            }
                            current_positions.push({id: uuidv4(), race: raceSaveObj.obj.id, race_original_id: raceSaveObj.obj.original_id, time:t, lon:lon, lat:lat, gps_quality:quality})

                        }
                    }
                    
                    if(device.content.type === 'buoy'){
                        let id = device.uuid
                        let original_id = s
                        let race = raceSaveObj.obj.id
                        let race_original_id = raceSaveObj.obj.original_id
                        let name = device.content.name
                        let buoy_type = device.content.buoy_type

                        let connected_buoy = null
                        let connected_buoy_original_id = null
                        console.log(device)
                        if(device.content.connected_buoy !== null && device.content.connected_buoy !== undefined && Object.keys(device.content.connected_buoy).length !== 0){

                            connected_buoy_original_id = race_ids_to_serials[device.content.connected_buoy]
                        
                            connected_buoy = things[connected_buoy_original_id].uuid
                        }
                        
                        let b = {id, original_id, race, race_original_id, name, buoy_type, connected_buoy, connected_buoy_original_id, metas}
                        current_positions.forEach(p => {
                            p.yacht_or_buoy = 'buoy'
                            p.buoy = b.id
                            p.buoy_original_id = b.original_id
                            positions.push(p)
                        })
                        buoys.push(b)
                        


                    }else if(device.content.type === 'yacht'){
                        let id = device.uuid
                        let original_id = s
                        let race = raceSaveObj.obj.id
                        let race_original_id = raceSaveObj.obj.original_id
                        let name = device.content.name
                        let boat_number = device.content.boat_number
                        let crew = JSON.stringify(device.content.crew)
                        let country = JSON.stringify(device.content.country)
                        


                        let b = {id,original_id,race,race_original_id, name, boat_number, crew, country, metas}
                        current_positions.forEach(p =>{
                            p.yacht_or_buoy = 'yacht'
                            p.yacht = id
                            p.yacht_original_id = original_id
                            positions.push(p)
                        })
                    
                        boats.push(b)
                        
                    }else{

                    }

            })

            // NOW SAVE session.data.session , things, and maybe serials?
            session.data.session.name = decodeURI(session.data.session.name)

                raceSaveObj.obj.name = session.data.session.name
                raceSaveObj.obj.start_time = start_time
                raceSaveObj.obj.end_time = end_time
                raceSaveObj.obj.url = page_url
                raceSaveObj.obj.manual_wind = session.data.session.manual_wind
                raceSaveObj.obj.course_direction = session.data.session.course_direction

                

                
            var races = [raceSaveObj.obj]
            

            let newObjectsToSave = [
                { objectType:YachtBot.Race, objects:races},
                { objectType:YachtBot.Position, objects:positions},
                { objectType:YachtBot.Buoy, objects:buoys},
                { objectType:YachtBot.Yacht, objects:boats}]
                console.log('Bulk saving objects.')
                await bulkSave(newObjectsToSave, YachtBot.FailedUrl, page_url)

                // TODO: What are serials?
                
            }else{
                console.log('Should not continue so going to next race.')
            }
        }catch(err){
            console.log(err)
            await YachtBot.FailedUrl.create({id:uuidv4(), url: page_url, error: err.toString()})
        }
        idx++
        
    }
    page.close()
    browser.close()
    process.exit()
})();
        
        
  