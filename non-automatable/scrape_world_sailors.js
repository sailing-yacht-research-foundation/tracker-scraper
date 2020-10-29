const puppeteer = require('puppeteer');
const fs = require('fs');
const uuid = require('uuid');

( async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
await page.setUserAgent(userAgent);
  const url = 'https://www.sailing.org/sailors/biog.php?memberid='
  var member_id = 40000
  var max_id = 100000
  //Done 40,000 - 94,861 this gives around 30,000 sailors. Target is 80,000+ as advertised on their website.
  var bio_title = 'Sailor Biography :'

  while(member_id < max_id) {
    console.log(member_id)
    current_url = url + member_id.toString()
    member_id++

    var go = true;
    await page.goto(current_url, {waitUntil: "networkidle2"}).catch((e)=>{
      go = false;
    })
    var title = await page.title().catch((e) => {
      go = false
    });
    
    if(go && title.includes(bio_title)){
      
   //var p = await page.$x('/html/body/div[2]/div[1]/div[1]/div[1]/div[3]/div[2]/form/fieldset/div[2]/div[3]/div[1]/div[13]/span[2]')

    //     // - /html/body/div[2]/div[1]/div[1]/div[1]/div[3]/div[2]/form/fieldset/div[2]/div[3]/div[1]/div[13]/span[2]
      
      var values = await page.evaluate(() => {
         var email =  document.querySelector('#Email > span.uneditable') === null ? '' : document.querySelector('#Email > span.uneditable').textContent
         var first_name = document.querySelector('#biogfirstname > span.uneditable') === null? '' : document.querySelector('#biogfirstname > span.uneditable').textContent
         var last_name = document.querySelector('#biogsurname > span.uneditable') === null? '' : document.querySelector('#biogsurname > span.uneditable').textContent

         var country = document.querySelector('#biognationality > span.uneditable') === null? '' : document.querySelector('#biognationality > span.uneditable').textContent
         var isaf_id = document.querySelector('#biogisafid > span.static') === null? '' : document.querySelector('#biogisafid > span.static').textContent
         var birthday = document.querySelector('#biogdob > span.uneditable') === null? '' : document.querySelector('#biogdob > span.uneditable').textContent
         var resident_country = document.querySelector('#residence > span.uneditable') === null? '' : document.querySelector('#residence > span.uneditable').textContent
         var hometown = document.querySelector('#Hometown > span.uneditable') === null? '' : document.querySelector('#Hometown > span.uneditable').textContent
         var occupation = document.querySelector('#Occupation > span.uneditable') === null ? '' : document.querySelector('#Occupation > span.uneditable').textContent
         var yachtclub = document.querySelector('#Yacht > span.uneditable') === null ? '' : document.querySelector('#Yacht > span.uneditable').textContent
         var yachtclub_location = document.querySelector('#YachtClub > span.uneditable') === null ? '' : document.querySelector('#YachtClub > span.uneditable').textContent
         var coach = document.querySelector('#Coach > span.uneditable') === null ? '' : document.querySelector('#Coach > span.uneditable').textContent
         var campaign_website = document.querySelector('#Campaign > span.uneditable') === null? '' : document.querySelector('#Campaign > span.uneditable').textContent
         var sailor_classificaton = document.querySelector('#biogclassification > span.static') === null ? '' : document.querySelector('#biogclassification > span.static').textContent.trim()
         return {email, first_name, last_name, country, isaf_id, birthday, resident_country, hometown, occupation, yachtclub, yachtclub_location, coach, campaign_website, sailor_classificaton}
      })
      console.log(values)
      var string = uuid.v4() + "," + values.email + "," + values.first_name + "," + values.last_name +","+ values.country +","+ values.isaf_id+","+ values.birthday+","+ values.resident_country+","+ values.hometown+","+ values.occupation+","+values.yachtclub+","+ values.yachtclub_location+","+ values.coach+","+ values.campaign_website+","+ values.sailor_classificaton +"\n"
      fs.appendFileSync('world_sailing_sailors.csv', string )
    }
  }
  process.exit()    




})();

// urls = ['https://www.latitude38.com/crewlist/crewlisthome.html'
// http://www.yachtclub.com/
// http://www.yachtclub.com/fleets/associations.html
// http://www.yachtclub.com/fleets/fleetlinks01.html
// https://usoda.org/
// ]
// ( async () => {


// var fs = require('fs');

// var contents = fs.readFileSync("race_urls.txt", 'utf8').toString().split("\n");
// const urls = Array.from(contents)
// var bad_urls = []
// //Loop through all urls
// for (let i = 0; i < urls.length; i++) {
//     try{
//       var url = urls[i].trim()
//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();

//       await page.goto(url, {waitUntil: "networkidle2", timeout: 300000});

//       await page.waitForSelector('#time-control-play')
//       await page.click('#time-control-play')
//       await page.waitForSelector('#contTop > div > section.race')
//       let wait_for_fully_loaded = 'document.querySelector("#time-slider > div") != null && document.querySelector("#time-slider > div").style["width"] === "100%"'
//       await page.waitForFunction(wait_for_fully_loaded).catch(e => {
//         console.log(e)
//         bad_urls.add(url)
//       })

//       let race_details = await page.evaluate(skip => {
//         var context = document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]][Object.keys(document.querySelector("#contTop > div > section.race")[Object.keys(document.querySelector("#contTop > div > section.race"))[0]])[0]]["context"]
//         var race = context["$component"]["raceData"]["race"]
//         var name = race["name"]
//         var original_id = race["id"]
//         var calculated_start_time = race["calculatedStartTime"]
//         var start_time = race["raceStartTime"]
//         var end_time = race["raceEndTime"]
//         var tracking_start_time = race["trackingStartTime"]
//         var tracking_end_time = race["trackingEndTime"]
//         var extent = race["extent"]
//         var time_zone = race["parameterSet"]["parameters"]["eventTimezone"]
//         var race_date_s = race["readableDate"]
//         var race_date_timestamp = race["notReadableDate"]
//         var classes = race["parameterSet"]["parameters"]["classes"]
//         var params = race["parameterSet"]["parameters"]["parameters"]
//         var routes = race["parameterSet"]["parameters"]["routes"]
//         var control_points = race["parameterSet"]["parameters"]["controlPoints"]
//         var assorted = {params, classes, routes, control_points, extent}


//         var competitors_params = race["parameterSet"]["parameters"]["competitors"]
//         // var competitors_race = Object.keys(Object.values(race["raceCompetitors"])[0])
//         // var competitors_event = Object.keys(Object.values(race["event"]["competitors"])[0])

//         let team_position_data = Object.values(context["$component"]["raceData"]["resultItems"]).map( resultItem => {

//               var positions = resultItem["positions"]["positions"]
//               var team = resultItem["team"]["id"]
//               var short_name = resultItem["shortName"]
//               var time_elapsed = resultItem["timeElapsed"]
//               var start_time = resultItem["startTime"]
//               var stop_time = resultItem["stopTime"]
//               var finish_time = resultItem["finishTime"]
//               var status = resultItem["status"]
//               return {positions, team, short_name, time_elapsed, start_time, stop_time, finish_time, status}

//           });


//       //   [“parameters”][“teams”]
//       // [“parameters”][“eventId”]
//       // [“parameters”][“eventName”]
//       // [“parameters”][“eventStartTime”]
//       // [“parameters”][“eventEndTime”]
//       // [“parameters”][“eventType”]
//       // [“parameters”][“eventTimezone”]
//       // [“parameters”][“eventJSON”]
//       // [“parameters”][“webId”]
//       // [“parameters”][“raceId”]
//       // [“parameters”][“raceName”]
//       // [“parameters”][“raceTrackingStartTime”]
//       // [“parameters”][“raceTrackingEndTime”]
//       // [“parameters”][“raceDefaultRouteUUID”]
//       // [“parameters”][“raceHandicapSystem”]
//       // [“parameters”][“course_area”]
//       // [“parameters”][“raceSeries”]

//         //return {name, original_id, start_time, end_time, extent, time_zone, race_date_timestamp, competitors, assorted}
//         return {competitors_params, team_position_data, assorted, race_date_timestamp, name, original_id, calculated_start_time, start_time, end_time, tracking_start_time, tracking_end_time,
//         time_zone, race_date_s, race_date_timestamp}
//       });
//       let data = JSON.stringify(race_details);
//       fs.writeFileSync( race_details["original_id"] + "_all_data.json", data);
//       console.log("worked")


//    }catch(err){
//      consol.log('failure')
//      bad_urls.add(url)
//    }// end catch
//    browser.close()

//  }// end for loop

// console.log(bad_urls)

// })();
