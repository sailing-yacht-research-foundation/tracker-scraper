const { sequelize, connect} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');


( async () => {

  var archivePages = [
    "http://www.geovoile.com/archives_2020.asp",
    "http://www.geovoile.com/archives_2019.asp",
    "http://www.geovoile.com/archives_2018.asp",
    "http://www.geovoile.com/archives_2017.asp",
    "http://www.geovoile.com/archives_2016.asp",
    "http://www.geovoile.com/archives_2015.asp",
    "http://www.geovoile.com/archives_2014.asp",
    "http://www.geovoile.com/archives_2013.asp",
    "http://www.geovoile.com/archives_2012.asp",
    "http://www.geovoile.com/archives_2011.asp",
    "http://www.geovoile.com/archives_2010.asp",
    "http://www.geovoile.com/archives_2009.asp",
    "http://www.geovoile.com/archives_2008.asp",
    "http://www.geovoile.com/archives_2007.asp",
    "http://www.geovoile.com/archives_2006.asp",
    "http://www.geovoile.com/archives_2005.asp"]

  var raceUrls = {}

  for(urlIndex in archivePages){
    var url = archivePages[urlIndex]
    var regexp = /<a class=\"aBG aSuite\" href=\"https*:\/\/.*\" target=\"_blank">/g;
    var regexp_url = /https*:\/\/.*\" target/g;
    var regexp_for_old = /<a href=\"https*:\/\/.*\" target="_blank" class="aBG aSuite">/g;

    var pageResponse = await axios.get(url)
    var pageData = pageResponse.data.toString()

    var matches = pageData.match(regexp);
    for(matchIndex in matches){
      var match = matches[matchIndex]
      var newUrl = match.match(regexp_url)[0].split('\" target').join('')
      raceUrls[newUrl] = newUrl
    }

    var matches_old = pageData.match(regexp_for_old)
    for(matchIndex in matches_old){
      var match = matches_old[matchIndex]
      var newUrl = match.match(regexp_url)[0].replace('<a href="', '').replace('target', '').replace('"','')
      raceUrls[newUrl] = newUrl
    }
  }

  var urlsToVisit = Object.keys(raceUrls)
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for(urlIndex in urlsToVisit){
    var currentUrl = urlsToVisit[urlIndex]
    
    try{
           console.log("Going to page " +  currentUrl)
           await page.goto(currentUrl, {waitUntil: "networkidle2", timeout: 300000});
           
           console.log("Waiting for app to load...")
           let loadedTest = "window.tracker != null && window.tracker._boats != null && window.tracker._boats[0] != null && window.tracker._boats[0].track != null && window.tracker._boats[0].track.locations.length > 0"
           await page.waitForFunction(loadedTest, {timeout: 300000});
           
           console.log("Pausing the app...")
           await page.evaluate(()=>{
               tracker.replay._stop()
               tracker.timeline.moveTo(tracker._timecodeEnd)

           })

           console.log("Getting raw data.")

           let base_url = currentUrl.substr(0, currentUrl.lastIndexOf(".com")) + '.com'
           let config_xml = await page.evaluate(async base_url => {
                                    let config_url = base_url + tracker._getRessourceUrl("config")
                                    
                                    function get_raw_data(u) {
                                      return new Promise((resolve, reject) => {
                                        µ.loadHwxFile(u, XMLDocument , (j) => {resolve(j)})
                            
                                      });
                                    }
                                    var config_data = await get_raw_data(config_url);
                               
                                   
                                    return config_data
                            }, base_url)
           
            console.log(config_xml)
            let raw_data = await page.evaluate(async base_url => {
                  let tracks_url = base_url + tracker._getRessourceUrl("tracks")
                  let reports_url = base_url + tracker._getRessourceUrl("reports")
                  function get_raw_data(u) {
                     return new Promise((resolve, reject) => {
                        µ.loadHwxFile(u, Object, (j) => {resolve(j)})
                      });
                  }
                                               
                  let tracks_data = await get_raw_data(tracks_url);
                  let reports_data = await get_raw_data(reports_url);
                                                   
                  return {tracks_data, reports_data}
            }, base_url)


            let raw_tracks = JSON.parse(raw_data.tracks_data)
            let raw_reports = JSON.parse(raw_data.reports_data)

            
            console.log("Getting mu.")
            let mu = await page.evaluate(()=>{
                    return µ
            })
        
           console.log("Getting sig data.")
           let sig_info = await page.evaluate(() => {
                   let mapBounds = sig.mapBounds
                   let mapArea = sig._mapArea
                   let route = sig.route
                   let rule = sig.rule
                   let sigBounds = sig.sigBounds
                   let projection = sig._projection
                   let projections = sig._projections
                   let poiLayers = sig._poiLayers
                   let raceAreas = sig._raceAreas
                   let raceGates = sig._raceGates
                   let shape = sig._shape
                   let raceReferences = sig._raceReferences.map((reference) =>{
                       let trackdata = reference.trackdata
                       let plots = reference.plots
                       let id = reference.id
                       let name = reference.name
                       
                       // Almost certainly redundant
                       let track_nbLocs = reference.track._nbLocs
                       let track_path = reference.track._path
                       let track_path2 = reference.track._path2
                       let track_path3 = reference.track._path3
                       let track_pathLeft = reference.track._pathLeft
                       let track_pathLeft2 = reference.track._pathLeft2
                       let track_pathLeft3 = reference.track._pathLeft3
                       let track_pathRight = reference.track._pathRight
                       let track_pathRight2 = reference.track._pathRight2
                       let track_pathRight3 = reference.track._pathRight3
                       let track_commands = reference.track._commands
                       let track_fullCoordinates = reference.track._fullCoordinates
                       let track_boatId = reference.track.boatId
                       let dash_1 = reference.track.dash_1
                       let dash_2 = reference.track.dash_2
                       let locations_info = reference.track.locations.map(position => {
                                      let timecode = position.timecode
                                      let lat = position.lat
                                      let lng = position.lng
                                      let heading = position.heading
                                      let command = position.command
                                      let crossingAntimeridian = position.crossingAntimeridian
                                      let swapXSign = position.swapXSign
                                      let dLat = position._dLat
                                      let dLng = position._dLng
                                      let dt_a = position.dt_a
                                      let dt_b = position.dt_b
                                              
                                      return { timecode, lat, lng, heading, command,
                                           crossingAntimeridian, swapXSign, dLat, dLng, dt_a, dt_b }
                       })
                       let track = { track_nbLocs, track_path, track_path2, track_path3,
                                                         track_pathLeft, track_pathLeft2, track_pathLeft3,
                                                         track_pathRight, track_pathRight2, track_pathRight3,
                                                         track_commands, locations_info, track_fullCoordinates, dash_1, dash_2, track_boatId }
                       return {trackdata, plots, id, name, track}
                                                                
                   })
                   return {mapArea, mapBounds, route, rule, sigBounds, projection,
                                              projections, poiLayers, raceAreas, raceGates,
                                              shape, raceReferences }
                   
           })
           
           console.log("Getting reports.")
           let report_info = await page.evaluate(() => {
                   let reports = tracker._reports.map( report => {
                       let id = report.id
                       let offset = report.offset
                       let timecode = report.timecode
                       let lines = report.lines
                                               
                       return {id, offset, timecode, lines}
                   })
           })
           
           console.log("Getting race info.")
           let race_info = await page.evaluate(() => {
               let legNum = tracker.legNum
               let numLegs = tracker.nbLegs
               let statusRacing = tracker.statusRacing
               let extras = tracker.extras
               let runsById = tracker._runsById
               
               let timecode_start = tracker._timecodeStart
               let timecode_end = tracker._timecodeEnd
               let challenger = tracker._challenger
               let dateTime = tracker.dateTime
               let dateTimeFormat = tracker.dateTimeFormat
               let raceState = tracker._raceState
               let prerace = tracker._prerace
               let geoblog = tracker.geoblog
               let holder = tracker.holder
               let activeBoatClass = tracker.activeBoatClass
               let name = tracker.name
               let resourcesVersions = tracker.resourcesVersions
               let params = tracker._params
                                               
               return {legNum, numLegs, statusRacing, extras, runsById,
                                               timecode_start, timecode_end, challenger, dateTime, dateTimeFormat,
                                               raceState, prerace, geoblog, holder, activeBoatClass,
                                               name, resourcesVersions, params}
           })
    
           console.log("Getting boats info.")
           let boats_info = await page.evaluate(()=>{
               let boats = window.tracker._boats
               let boats_map = boats.map(boat=>{
                   let track_nbLocs = boat.track._nbLocs
                   let track_path = boat.track._path
                   let track_path2 = boat.track._path2
                   let track_path3 = boat.track._path3
                   let track_pathLeft = boat.track._pathLeft
                   let track_pathLeft2 = boat.track._pathLeft2
                   let track_pathLeft3 = boat.track._pathLeft3
                   let track_pathRight = boat.track._pathRight
                   let track_pathRight2 = boat.track._pathRight2
                   let track_pathRight3 = boat.track._pathRight3
                   let track_commands = boat.track._commands
                   let track_fullCoordinates = boat.track._fullCoordinates
                   let track_boatId = boat.track.boatId
                   let dash_1 = boat.track.dash_1
                   let dash_2 = boat.track.dash_2
                   let locations_info = boat.track.locations.map(position => {
                       let timecode = position.timecode
                       let lat = position.lat
                       let lng = position.lng
                       let heading = position.heading
                       let command = position.command
                       let crossingAntimeridian = position.crossingAntimeridian
                       let swapXSign = position.swapXSign
                       let dLat = position._dLat
                       let dLng = position._dLng
                       let dt_a = position.dt_a
                       let dt_b = position.dt_b
                               
                       return { timecode, lat, lng, heading, command,
                            crossingAntimeridian, swapXSign, dLat, dLng, dt_a, dt_b }
                   })
                                           
                   let track = { track_nbLocs, track_path, track_path2, track_path3,
                                          track_pathLeft, track_pathLeft2, track_pathLeft3,
                                          track_pathRight, track_pathRight2, track_pathRight3,
                                          track_commands, locations_info, track_fullCoordinates, dash_1, dash_2, track_boatId }
                   let arrival = boat.arrival
                   let sailors = boat.sailors
                   let routing = boat.routing
                   let trackSTM = boat.trackSTM
                   let category = boat.category
                   let fname = boat.fname
                   let heading = boat.heading
                   let hullColor = boat.hullColor
                   let hulls = boat.hulls
                   let id = boat.id
                   let lat = boat.lat
                   let lname = boat.lname
                   let lng = boat.lng
                   let name = boat.name
                   let shortName = boat.shortName
                   let tag = boat.tag
                   let timecode = boat.timecode
                   let timecodeHidden = boat.timecodeHidden
                   let x = boat.x
                   let y = boat.y
                   let earthScale = boat._earthScale
                   let index = boat._index
                   let pivotLat = boat._pivotLat
                   let pivotLng = boat._pivotLng
                   let scale = boat._scale
                   let scaleRatio = boat._scaleRatio
                   let text = boat._text
                                          
                   return { arrival, fname, heading, hullColor, hulls, id, lat, lng, lname, name, shortName,
                                          tag, timecode, timecodeHidden, x, y, earthScale, index, pivotLat,
                                       pivotLng, scale, scaleRatio, text, track_commands, locations_info,
                                          track, sailors, routing, trackSTM, category
                                          }

           })
           return boats_map
          })
    }catch (err) {
      console.log(err)
    }

  }


})();


