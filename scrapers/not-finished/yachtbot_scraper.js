const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');

( async () => {
 
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 10});

    var idx = 17315

    //var idx = 17300
 
    while(idx < 17316){
        page_url = 'http://www.yacht-bot.com/races/' + idx 
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
            /** session.data.session 
             * name: 'Akaroa Snippets',
                start_time: 1443832204000,
                end_time: 1443839412000,
                owner_id: 2550,
                session_group_id: 22729,
                admin_session_group_id: 22730,
                parent_session_id: null,
                ou: null,
                permissions: { read: true, modify: false },
                blob: true
             */
            var race_info = await axios.get("https://www.igtimi.com/api/v1/sessions/" + idx + "/logs?access_token=" + token)
            var current_time = new Date().getTime()
           
            var windows = await axios.get("https://www.igtimi.com/api/v1/devices/data_access_windows?start_time=" + start_time + "&end_time=" + current_time + "&types%5B%5D=read&types%5B%5D=modify&access_token=" + token )
    
            var permissionsUrl = "https://www.igtimi.com/api/v1//resources?permission=read&start_time=" + start_time + "&end_time=" + end_time
            var resources = JSON.parse(xml2json.toJson(race_info.data))
            //resources.session.content.log.type
            var boats = {}
            resources['session']['content']['log']['log_entry'].forEach(entry => {
                    // console.log(entry['data']['device'])
                   
                    if(entry['data']['object_data'] !== undefined){
                        boats[entry['data']['object_data']['object_id']] = {content:entry['data']['object_data']['object_content']}
                        
                    }
                    if(entry['data']['device'] !== undefined){
                        device_number = entry['data']['device']['serial_number']
                        boats[entry['data']['device']['object_id']].serial_number = device_number
                        permissionsUrl = permissionsUrl + "&serial_numbers%5B%5D=" + device_number
                    }
                    /**
                     * {"id":"4739576","created_at":"2020-02-21T08:53:48.957Z","data":{"metadata":{"manual_wind":{"strength":"22.224","direction":"250"}}}}
                        {"id":"4739577","created_at":"2020-02-21T08:53:48.968Z","data":{"metadata":{"course_direction":"250"}}}
                     */
                    if(entry['data']['metadata'] !== undefined){
                       // console.log(JSON.stringify(entry))
                        /**
                         * { id: '4739574',
                            created_at: '2020-02-21T08:53:48.935Z',
                            data: { metadata: { viewer_widgets: [Object] } } }
                            { id: '4739575',
                            created_at: '2020-02-21T08:53:48.946Z',
                            data: { metadata: { viewer_options: [Object] } } }
                            { id: '4739576',
                            created_at: '2020-02-21T08:53:48.957Z',
                            data: { metadata: { manual_wind: [Object] } } }
                            { id: '4739577',
                            created_at: '2020-02-21T08:53:48.968Z',
                            data: { metadata: { course_direction: '250' } } }
                            { id: '4739589',
                            created_at: '2020-02-21T10:25:21.570Z',
                            data: { metadata: { viewer_widgets: [Object] } } }
                         */
                    }
                   
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
                serials[d.device.serial_number] = d

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
           var positionObjects = []
           positionSerials.forEach(s => {
                let data = positionsRequest.data[s]
                let gps = data['1']

                if(gps !== undefined && gps !== null){
                    let lons = gps['1']
                    let lats = gps['2']
                    let gpsTimes = gps['t']
                }
              
                for(gpsTimeIndex in gpsTimes){
                    let t = gpsTimes[gpsTimeIndex]
                    let lon = lons[gpsTimeIndex]
                    let lat = lats[gpsTimeIndex]
                    positionObjects.push({time:t, lon:lon, lat:lat})
                }

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

           })
            
        }else{
            console.log('Should not continue so going to next race.')
        }
        idx++
        
    }
    page.close()
    browser.close()
    process.exit()
})();
        
        
  