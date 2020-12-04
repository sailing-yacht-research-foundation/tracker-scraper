const {YachtBot, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');


( async () => {
    await connect()
    var existingObjects = await findExistingObjects(YachtBot)

    // var errors = await YachtBot.FailedUrl.findAll()
    // var races = await YachtBot.Race.findAll()
    
    // var raceIds = {}
    // races.forEach(r=>{
    //     raceIds[r.original_id] = true
    // })
    // var errorIds = {}
   
    
   // console.log(errorIds)
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    var idx = 1
    //var idx = 17000
 
    while(idx == 17159){
        // if(!raceIds[new String(idx)]){
        //     idx++
        //     console.log('Not a saved race.')
        //     continue
        // }

        let raceSaveObj = instantiateOrReturnExisting(existingObjects, YachtBot.Race, idx)
        if(! raceSaveObj.shouldSave){
            idx++
            console.log('Already saved this so skipping.')
            continue
        }

        page_url = 'http://www.yacht-bot.com/races/' + idx 

        try{

            console.log('about to go to page ' + page_url)
            await page.goto(page_url)
            console.log('went to page ' + page_url)
            let should_continue = await page.waitForFunction("document.querySelector('#overlay > div.error-state').style.display === 'none'").then(()=>{ return true}).catch(e => {return false})
            if(should_continue){
                token = await page.evaluate(()=>{
                    return oauth_access_token
                });
            
                let session = await axios.get("https://www.igtimi.com/api/v1/sessions/" + idx + "?access_token=" + token)
                let start_time = session.data.session.start_time
                let end_time = session.data.session.end_time
                let current_time = new Date().getTime()

                if(start_time > new Date().getTime() || end_time > new Date().getTime()){
                    console.log('Future race so skipping.')
                    idx++
                    continue
                }

                session.data.session.url = page_url
                
             
                let logs_request = await axios.get("https://www.igtimi.com/api/v1/sessions/" + idx + "/logs?access_token=" + token)
                
                let logs = JSON.parse(xml2json.toJson(logs_request.data)).session.content.log.log_entry
                let windowsRequest = await axios.get("https://www.igtimi.com/api/v1/devices/data_access_windows?start_time=" + start_time + "&end_time=" + current_time + "&types%5B%5D=read&types%5B%5D=modify&access_token=" + token )
                let windows = windowsRequest.data.data_access_windows
                
                let groups = {}
                windows.forEach(w =>{
                    window = w.data_access_window
                    let key = window.recipient.group.id
                    if(groups[key] === null || groups[key] === undefined){
                        groups[key] = [window.device_serial_number]
                    }else{
                        groups[key].push(window.device_serial_number)
                    }
                })

                // Object.keys(groups).forEach(k =>{
                //     console.log(k)
                //     console.log(groups[k].length)
                // })
            
                //var permissionsUrl = "https://www.igtimi.com/api/v1//resources?permission=read&start_time=" + start_time + "&end_time=" + end_time
            
                
                let metadatas = []
                let objects = []
                let object_datas = []
                // Devices have object ids and serial numbers.
                let devices = []

            
                logs.forEach(entry => {
                        let data = entry.data
                        let first_key = Object.keys(data)[0]
                        if(first_key === 'object_data'){
                            object_datas.push(data.object_data)
                        }else if(first_key === 'object'){
                            objects.push(data.object)
                        }else if(first_key === 'device'){
                            devices.push(data.device)
                        }else if(first_key === 'metadata'){
                            metadatas.push(data.metadata)
                        }else{
                            // Can ignore these.
                      
                        }            
                })
               
                metadatas.forEach(m => {
                    if(m.manual_wind !== null && m.manual_wind !== undefined){
                        session.data.session.manual_wind = JSON.stringify(m.manual_wind)
                    }else if(m.course_direction !== null && m.course_direction !== undefined){
                        session.data.session.course_direction = m.course_direction
                    }
                })

                let oids_to_serial = {}
                devices.forEach(d=>{
                    oids_to_serial[d.object_id] = d.serial_number
              
                })

                // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals
                let positionRequestData = "start_time=" + start_time + "&end_time=" + end_time + "&types%5B1%5D=0&types%5B2%5D=0&types%5B3%5D=0&types%5B4%5D=0&types%5B5%5D=0&types%5B6%5D=0&types%5B7%5D=0&types%5B8%5D=0&types%5B9%5D=0&types%5B10%5D=0&types%5B11%5D=0&types%5B12%5D=0&types%5B13%5D=0&types%5B14%5D=0&types%5B15%5D=0&types%5B16%5D=0&types%5B17%5D=0&types%5B18%5D=0&types%5B19%5D=0&types%5B20%5D=0&types%5B21%5D=0&types%5B22%5D=0&types%5B23%5D=0&types%5B24%5D=0&types%5B25%5D=0&types%5B26%5D=0&types%5B27%5D=0&types%5B28%5D=0&types%5B29%5D=0&types%5B30%5D=0&types%5B31%5D=0&types%5B32%5D=0&types%5B33%5D=0&types%5B34%5D=0&types%5B35%5D=0&types%5B36%5D=0&types%5B37%5D=0&types%5B38%5D=0&types%5B39%5D=0&types%5B40%5D=0&types%5B41%5D=0&types%5B42%5D=0&types%5B43%5D=0&types%5B44%5D=0&types%5B45%5D=0&types%5B46%5D=0&types%5B47%5D=0&types%5B48%5D=0&types%5B49%5D=0&types%5B50%5D=0&types%5B51%5D=0&types%5B52%5D=0&types%5B53%5D=0&types%5B54%5D=0&types%5B55%5D=0&types%5B56%5D=0&types%5B57%5D=0&types%5B23%5D=0&restore_archives=true"
                let serials = {}
                object_datas.forEach(o => {
                    serial_number = oids_to_serial[o.object_id]
                    o.object_content.serial_number = serial_number
                    o.object_content.uuid = uuidv4()

                    if(serial_number !== null && serial_number !== undefined){
                        positionRequestData  = positionRequestData  + "&serial_numbers%5B%5D=" + serial_number
                        serials[serial_number] = o.object_content
                    }else{
                        serials[o.object_id] = o.object_content
              
                        
                    }
                })
             
    
           
                // permissionsUrl = permissionsUrl + "&access_token=" + token 
        
                // var permissions = await axios.get(permissionsUrl)
                
                // var devicesUrl = 'https://www.igtimi.com/api/v1/devices'
                // var data_5 = "_method=GET"
                // windows.forEach( w => {
                       
                //         serial_number = w.data_access_window.device_serial_number
                //         data_5 = data_5 + "&serial_numbers%5B%5D=" + serial_number
                //     })
                // data_5 = data_5 + "&access_token=" + token 
                
                // var devicesRequest = await axios({
                //     method:'post',
                //     url: devicesUrl,
                //     data: data_5
                // })

            
                // console.log(devicesRequest.data.devices.length)
                // devicesRequest.data.devices.forEach(d=>{
                
                //     // things[d.device.serial_number] = d  
                //     // things[d.device.serial_number].uuid = uuidv4()             
                // })
            
        
                
        
                positionRequestData = positionRequestData + "&_method=GET&restore_archives=true&access_token=" + token 
                let positionsRequest = await axios({
                    method:'post',
                    url: 'https://www.igtimi.com/api/v1/resources/data',
                    data: positionRequestData
                })
                

                let boats = []
                let buoys = []
            
                let positions = []

                let positionSerials = Object.keys(positionsRequest.data)
                
                // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals

                positionSerials.forEach(s => {
                
                    let data = positionsRequest.data[s]
                    
                
                    let gps = data['1']

                    let device = serials[s]
                   
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
                    
                    let metas = JSON.stringify({gpsQuality, gpsQualitySatCount, gpsQualityHDOP, gpsAltitude, cog, hdgm, hdg, sog, stw, awa, aws, antHrm, quaternion, acceleration, gyro, 
                         force, torque, twa, tws, pressure})
                    
                    if(metas === '{}'){
                        metas = null
                    }
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
                            if(gpsQuality !== undefined && gpsQuality.length >= gpsTimeIndex){
                                quality = gpsQuality
                            }
                            current_positions.push({id: uuidv4(), race: raceSaveObj.obj.id, race_original_id: raceSaveObj.obj.original_id, 
                                time:t, lon:lon, lat:lat, gps_quality:quality, yacht_original_id:null, yacht: null, buoy:null, buoy_original_id: null, yacht_or_buoy:null
                            })
                        }
                    }
                    
                    if(device.type === 'buoy' || device.type === 'wind'){
                        let id = device.uuid
                        let original_id = s
                        let race = raceSaveObj.obj.id
                        let race_original_id = raceSaveObj.obj.original_id
                        let name = device.name
                        let buoy_type = device.buoy_type

                        let connected_buoy = null
                        let connected_buoy_original_id = null
                    
                        if(device.connected_buoy !== null && device.connected_buoy !== undefined && Object.keys(device.connected_buoy).length !== 0){
                            if(oids_to_serial[device.connected_buoy] === null || oids_to_serial[device.connected_buoy] === undefined ){
                                let content = serials[device.connected_buoy]
                                let cb = {id:uuidv4(), original_id:content.name, race:race, race_original_id:race_original_id, name:content.name, buoy_type:content.buoy_type, connected_buoy:id, connected_buoy_original_id:original_id, metas:null}
                                buoys.push(cb)
                                connected_buoy_original_id = cb.original_id
                                connected_buoy = cb.id
                            }else{
                                connected_buoy_original_id = oids_to_serial[device.connected_buoy]
                                connected_buoy = serials[connected_buoy_original_id].uuid
                            }
                           
                        }
                        
                        let bo = {id, original_id, race, race_original_id, name, buoy_type, connected_buoy, connected_buoy_original_id, metas}
                        current_positions.forEach(p => {
                            p.yacht_or_buoy =  device.type
                            p.buoy = id
                            p.buoy_original_id = original_id
                        
                            positions.push(p)
                        })
                        
                        buoys.push(bo)
                        
                        


                    }else if(device.type === 'yacht'){
                        let id = device.uuid
                        let original_id = s
                        let race = raceSaveObj.obj.id
                        let race_original_id = raceSaveObj.obj.original_id
                        let name = device.name
                        let boat_number = device.boat_number
                        let crew = JSON.stringify(device.crew)
                        let country = JSON.stringify(device.country)

                        let b = {id,original_id,race,race_original_id, name, boat_number, crew, country, metas}
                        current_positions.forEach(p =>{
                            p.yacht_or_buoy = 'yacht'
                            p.yacht = id
                            p.yacht_original_id = original_id
                            positions.push(p)
                        })
                    
                        boats.push(b)
                        
                    }else{
                        console.log('Unknown device type.')
                        console.log(device)
                        console.log(positions[0])
                        console.log(metas)
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

                

                
            let races = [raceSaveObj.obj]
            

            let newObjectsToSave = [
                { objectType:YachtBot.Race, objects:races},
                { objectType:YachtBot.Yacht, objects:boats},
                { objectType:YachtBot.Position, objects:positions},
                { objectType:YachtBot.Buoy, objects:buoys}
                ]
                console.log('Bulk saving objects.')
                
                await bulkSave(newObjectsToSave, YachtBot.FailedUrl, page_url)
                
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
        
        
  