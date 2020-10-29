const { Sequelize, DataTypes } = require('sequelize');
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const axiosRetry = require('axios-retry');
const { json2xml } = require('xml-js');

( async () => {
 
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay, retries: 10});

    //var idx = 8597

    var idx = 17300
 
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
                    //     end_time = meta.session.end_time
            var race_info = await axios.get("https://www.igtimi.com/api/v1/sessions/" + idx + "/logs?access_token=" + token)
            var current_time = new Date().getTime()
   
            var windows = await axios.get("https://www.igtimi.com/api/v1/devices/data_access_windows?start_time=" + start_time + "&end_time=" + current_time + "&types%5B%5D=read&types%5B%5D=modify&access_token=" + token )
    
            var permissionsUrl = "https://www.igtimi.com/api/v1//resources?permission=read&start_time=" + start_time + "&end_time=" + end_time
            var resources = JSON.parse(xml2json.toJson(race_info.data))
            resources['session']['content']['log']['log_entry'].forEach(entry => {
                    // console.log(entry['data']['device'])
                    // console.log(entry['data'])
                    if(entry['data']['device'] !== undefined){
                        device_number = entry['data']['device']['serial_number']
                        permissionsUrl = permissionsUrl + "&serial_numbers%5B%5D=" + device_number
                    }
                })
            permissionsUrl = permissionsUrl + "&access_token=" + token 
    
            var permissions = await axios.get(permissionsUrl)
            
            var devicesUrl = 'https://www.igtimi.com/api/v1/devices'
            var data_5 = "_method=GET"
            windows.data["data_access_windows"].forEach( data_access_window => {
                    data_5 = command_5 + "&serial_numbers%5B%5D=" 
                    serial_number = data_access_window["data_access_window"].device_serial_number
                    data_5 = command_5 + "&serial_numbers%5B%5D=" + serial_number
                })
            data_5 = data_5 + "&access_token=" + token 
            
            var devicesRequest = await axios({
                method:'post',
                url: devicesUrl,
                data: data_5
            })
    
            // http://support.igtimi.com/support/solutions/articles/8000009993-api-communication-fundamentals
            var data_6 = "start_time=" + start_time + "&end_time=" + end_time + "types%5B1%5D=0&types%5B2%5D=0&types%5B3%5D=0&types%5B4%5D=0&types%5B5%5D=0&types%5B6%5D=0&types%5B7%5D=0&types%5B8%5D=0&types%5B9%5D=0&types%5B10%5D=0&types%5B11%5D=0&types%5B12%5D=0&types%5B13%5D=0&types%5B14%5D=0&types%5B15%5D=0&types%5B16%5D=0&types%5B17%5D=0&types%5B18%5D=0&types%5B19%5D=0&types%5B20%5D=0&types%5B21%5D=0&types%5B22%5D=0&types%5B23%5D=0&types%5B24%5D=0&types%5B25%5D=0&types%5B26%5D=0&types%5B27%5D=0&types%5B28%5D=0&types%5B29%5D=0&types%5B30%5D=0&types%5B31%5D=0&types%5B32%5D=0&types%5B33%5D=0&types%5B34%5D=0&types%5B35%5D=0&types%5B36%5D=0&types%5B37%5D=0&types%5B38%5D=0&types%5B39%5D=0&types%5B40%5D=0&types%5B41%5D=0&types%5B42%5D=0&types%5B43%5D=0&types%5B44%5D=0&types%5B45%5D=0&types%5B46%5D=0&types%5B47%5D=0&types%5B48%5D=0&types%5B49%5D=0&types%5B50%5D=0&types%5B51%5D=0&types%5B52%5D=0&types%5B53%5D=0&types%5B54%5D=0&types%5B55%5D=0&types%5B56%5D=0&types%5B57%5D=0&types%5B23%5D=0&restore_archives=true"
            resources['session']['content']['log']['log_entry'].forEach(entry => {
                // console.log(entry['data']['device'])
                // console.log(entry['data'])
                if(entry['data']['device'] !== undefined){
                    device_number = entry['data']['device']['serial_number']
                    data_6 = data_6 + "&serial_numbers%5B%5D=" + device_number
                }
            })
    
            data_6 = data_6 + "&_method=GET&access_token=" + token 
            var positionsRequest = await axios({
                method:'post',
                url: 'https://www.igtimi.com/api/v1/resources/data',
                data: data_6
            })
    
            console.log(positionsRequest.data)
            
        }
        idx++

        
      //  var should_continue = await page.waitForFunction('document.querySelector(\'#overlay.loading-overlay\').style[\'display\'] === "none" || document.querySelector(\'#overlay > div.loading-state\').style[\'display\'] === "none"').then(()=>{ return true}).catch(e => {return false})
        // var should_continue = false
        // // has_error_state = await page.waitForSelector('#overlay > div.error-state', {timeout:60000}).then(() => { return true}).catch(err => { return false})
        // if(should_continue && has_error_state ){
        //     try{
        //         worked = await page.evaluate(() => {
        //             return document.querySelector('#overlay > div.error-state') !== null && document.querySelector('#overlay > div.error-state').style['display'] === "none"
        //         });
        //        // console.log(worked) 
        //       //  console.log(page_url)
        //         if(worked){
        //            // console.log(page_url)
                    
                    
        //             // Get times
        //         //     command_1 = "curl -H 'Host: www.igtimi.com' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: http://www.igtimi.com' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Referer: " + page_url + "' -H 'Accept-Language: en-US,en;q=0.9' --compressed 'https://www.igtimi.com/api/v1/sessions/" + idx + "?access_token=" + token + "' --output race_" + idx + "_metadata.json"
        //         //     console.log(exec(command_1))
        //         //     meta = JSON.parse(fs.readFileSync("race_" + idx + "_metadata.json"))
        //         //     start_time = meta.session.start_time
        //         //     end_time = meta.session.end_time
        
        //         //     command_2 = "curl -H 'Host: www.igtimi.com' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Accept: application/xml, text/xml, */*; q=0.01' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: http://www.igtimi.com' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Referer: http://www.igtimi.com/races/" + idx + "' -H 'Accept-Language: en-US,en;q=0.9' --compressed 'https://www.igtimi.com/api/v1/sessions/" + idx + "/logs?access_token=" + token + "' --output race_" + idx + "_xml.xml"
        //         //     console.log(exec(command_2))
        
            
        
        //         //     current_time = new Date().getTime()
        //         //     command_3 = "curl -H 'Host: www.igtimi.com' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Origin: http://www.igtimi.com' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Referer: http://www.igtimi.com/races/" + idx + "' -H 'Accept-Language: en-US,en;q=0.9' --compressed 'https://www.igtimi.com/api/v1/devices/data_access_windows?start_time=" + start_time + "&end_time=" + current_time + "&types%5B%5D=read&types%5B%5D=modify&access_token=" + token + "' --output race_" + idx + "_windows.json"
        //         //     console.log(exec(command_3))
        //         //   //  console.log(command_3)
                   
        
        
        //         //     command_4 = "curl -H 'Host: www.igtimi.com' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36' -H 'Origin: http://www.igtimi.com' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Referer: http://www.igtimi.com/races/" + idx + "' -H 'Accept-Language: en-US,en;q=0.9' --compressed 'https://www.igtimi.com/api/v1//resources?permission=read&start_time=" + start_time + "&end_time=" + end_time 
        //         //     resources = JSON.parse(parser.toJson(fs.readFileSync("race_" + idx + "_xml.xml")))      
        //         //     resources['session']['content']['log']['log_entry'].forEach(entry => {
        //         //         console.log(entry['data']['device'])
        //         //         console.log(entry['data'])
        //         //         if(entry['data']['device'] !== undefined){
        //         //             device_number = entry['data']['device']['serial_number']
        //         //             command_4 = command_4 + "&serial_numbers%5B%5D=" + device_number
        //         //         }
        //         //     })
        //         //     command_4 = command_4 + "&access_token=" + token + "' --output race_" + idx + "_serials_and_permissions.json"
        //         //     console.log(exec(command_4))
        
        //         //     command_5 = "curl -H 'Host: www.igtimi.com' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36' -H 'Origin: http://www.igtimi.com' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Referer: http://www.igtimi.com/races/" + idx + "' -H 'Accept-Language: en-US,en;q=0.9' --data \"_method=GET"
        //         //     windows = JSON.parse(fs.readFileSync("race_" + idx + "_windows.json"))
        //         //     windows["data_access_windows"].forEach( data_access_window => {
        //         //         command_5 = command_5 + "&serial_numbers%5B%5D=" 
        //         //         serial_number = data_access_window["data_access_window"].device_serial_number
        //         //         command_5 = command_5 + "&serial_numbers%5B%5D=" + serial_number
        //         //     })
        //         //     command_5 = command_5 + "&access_token=" + token + "\" --compressed 'https://www.igtimi.com/api/v1/devices' --output race_" + idx + "_devices.json"
        //         //     console.log(exec(command_5))
        
                   
        //         //     command_6 = "curl -H 'Host: www.igtimi.com' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36' -H 'Origin: http://www.igtimi.com' -H 'Sec-Fetch-Site: cross-site' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Referer: http://www.igtimi.com/races/" + idx + "' -H 'Accept-Language: en-US,en;q=0.9' --data \"start_time=" + start_time + "&end_time=" + end_time + "&types%5B1%5D=3e-7&types%5B2%5D=0&types%5B6%5D=0&types%5B7%5D=0&types%5B8%5D=0&types%5B9%5D=0&types%5B11%5D=0&types%5B12%5D=0&types%5B13%5D=0&types%5B14%5D=0&types%5B22%5D=0&types%5B23%5D=0&restore_archives=true"
        //         //     resources['session']['content']['log']['log_entry'].forEach(entry => {
        //         //         console.log(entry['data']['device'])
        //         //         console.log(entry['data'])
        //         //         if(entry['data']['device'] !== undefined){
        //         //             device_number = entry['data']['device']['serial_number']
        //         //             command_6 = command_6 + "&serial_numbers%5B%5D=" + device_number
        //         //         }
        //         //     })
        //         //     command_6 = command_6 + "&_method=GET&access_token=" + token + "\" --compressed 'https://www.igtimi.com/api/v1/resources/data' --output race_" + idx + "_positions_data.json"
        //         //     console.log('COMMAND 6')
        //         //     console.log(command_6)
        //         //     console.log(exec(command_6))
        //         } else {
        //             console.log('Skipping')
        //         }
        //     }catch(err){
        //        console.log(err)
        //     }
           
        // } else {
        //     console.log('timeout')
            
        // }
       
        
    }
    page.close()
    browser.close()
    process.exit()
})();
        
        
  