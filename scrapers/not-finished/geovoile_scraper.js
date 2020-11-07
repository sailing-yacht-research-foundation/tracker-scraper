const { sequelize, connect} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');
var xmlParser = require('xml2json');

( async () => {

  // TODO: Add this to the data model.
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

  var today = new Date()

  try {
      console.log('Getting all race urls from list of archives.')
      for(urlIndex in archivePages){
        console.log('Parsing new archive page.')
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

      console.log('Finished building list of race urls.')
      var urlsToVisit = Object.keys(raceUrls)
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      console.log('Beginning to parse races.')
      for(urlIndex in urlsToVisit){
        var currentUrl = urlsToVisit[urlIndex]
        console.log('Checking next race.')
        
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
               
                //console.log(JSON.stringify(JSON.parse(xmlParser.toJson(config_xml)).config))
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
                // raw_tracks.loc is an array of arrays. 
                /*
                 id: 1000,
                  loc:
                  [ [ 1596539520, 4647500, -179000 ],
                    [ 1080, -3930, 60 ],
                    [ 1800, -1150, 3010 ],
                    [ 1800, 4410, -2690 ],
                    [ 1800, 1160, -5030 ],
                    **/

                
    
                 
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
                                                   raceAreas, raceGates,
                                                  shape }
                       
               })
               
               /**
                * { mapBounds:
   { absLeft: -44949.046875,
     absTop: -19970.953125,
     left: -44954.046875,
     top: -20186.953125,
     width: 74500,
     height: 39092 },
  route:
   { tag: {},
     rect:
      { xMin: 407.5490614,
        xMax: 453.25800000000004,
        yMin: 159.99365343389698,
        yMax: 217.0859890172481 },
     segments: [ [Array] ],
     _polygons: [ [Array] ],
     _dash_1: 6,
     _dash_2: 2,
     _strokeWidth: 0.5,
     init: {},
     updatePath: {},
     updateScale: {},
     _buildTag: {},
     controls: [] },
  rule:
   { isActive: false,
     dy: 0,
     __classAnchorIsInit: false,
     _isInit: false,
     _container: null,
     _tip: null,
     _tipUnit: '',
     _firstAnchor: null,
     _lastAnchor: null,
     _activeAnchor: null,
     _distance: 0,
     _ortho: null,
     _dash_1: -1,
     _dash_2: -2,
     _isSpline: false,
     _renewOnClickOutside: false,
     display: {},
     hide: {},
     isPersistent: {},
     start: {},
     updateAnchors: {},
     swapAnchors: {},
     updateVirtualAnchors: {},
     _init: {},
     _startListeners: {},
     _stopListeners: {},
     _onDrag: {},
     _onRelease: {},
     _onAnchorEvent: {},
     _updateOrthoScale: {},
     _drawOrtho: {},
     _updateTip: {},
     _setDy: {},
     _removeAnchor: {},
     _copyRoute: {},
     _toggleSpline: {},
     _copyToClipboard: {},
     Anchor: {} },
  sigBounds:
   { absLeft: 5,
     absTop: 216,
     absRight: 750,
     absBottom: 537,
     left: 5,
     top: 108,
     right: 750,
     bottom: 429,
     width: 745,
     height: 321 },
  projection:
   { worldWidth: 10728,
     _lngLeft: -17,
     _lngRight: 8,
     _xLeft: 0,
     _xRight: 745,
     _pixelsRate: 29.8,
     _mercatorTop: 59.48009351782135,
     _yEquator: 1772.5067868310766,
     _isOverAntiMeridian: false },
  raceAreas:
   [ { id: '',
       isLive: false,
       _polygon: null,
       tag: {},
       '$tag': [Object],
       _scale: 1,
       _points: [],
       _isClosed: true,
       _closeCommand: 'z',
       _dash_1: -1,
       _dash_2: -2 },
     { id: 'DSTOuessant',
       isLive: false,
       _polygon: null,
       tag: [Object],
       '$tag': null,
       _scale: 1,
       _points: [Array],
       _isClosed: true,
       _closeCommand: 'z',
       _dash_1: -1,
       _dash_2: -2 } ],
  raceGates: [] }
                */
               console.log("Getting reports.")
               let report_info = await page.evaluate(() => {
                       let reports = tracker._reports.map( report => {
                           let id = report.id
                           let offset = report.offset
                           let timecode = report.timecode
                           let lines = report.lines
                           let newLines = []
                           lines.forEach(line => {
                             let newLine = {}
                             Object.keys(line).forEach(key => {
                               if(key !== 'report'){
                                 newLine[key] = line[key]
                               }
                             })
                             newLines.push(newLine)
                           })
                                                   
                           return {id, offset, timecode, lines:newLines}
                       })
                       return reports
               })
               /**
                * { id: 96,
    offset: -30,
    timecode: 1596812400,
    lines:
     [ [Object],
       [Object],
       [Object],
       [Object],
       [Object],
                */
         
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
                   let dateTime = tracker._dateTime
                   let dateTimeFormat = tracker._dateTimeFormat
                   let raceState = tracker._raceState
                   let prerace = tracker._prerace
                   let geoblog = tracker.geoblog
                   let holder = tracker.holder
                 //  let activeBoatClass = tracker.activeBoatClass
                   let name = tracker.name
                   let resourcesVersions = tracker.resourcesVersions
                   let params = tracker._params
                                                   
                   return {legNum, numLegs, statusRacing, extras, runsById,
                                                   timecode_start, timecode_end, challenger, dateTime, dateTimeFormat,
                                                   raceState, prerace, geoblog, holder,
                                                   name, resourcesVersions, params}
               })

               /**
                * { legNum: 1,
  numLegs: 3,
  statusRacing: { STA: true, ARV: true, RAC: true, STB: true },
  timecode_start: 1596539520,
  timecode_end: 1596816000,
  dateTime:
   { '0': {},
     length: 1,
     context: { location: [Object], jQuery112204322129413915481: 1 },
     selector: '#datetime' },
  dateTimeFormat:
   'FR:\'<big>\'yyyy.mm.dd HH:MM:ss\'</big><small>\'yy.mm.dd HH:MM\'</small> FR\'',
  raceState: 'FINISH',
  prerace: 0,
  geoblog:
   { _isInit: false,
     _window: null,
     _header: null,
     _title: null,
     _hat: null,
     _credits: null,
     _patience: null,
     _cross: null,
     _arrow: null,
     _arrowPath: null,
     _url: '',
     _dataLoaded: false,
     _contentByMediaId: {},
     _currentMedia: null,
     _active: false,
     _opened: false,
     init: {},
     activate: {},
     desactivate: {},
     change: {},
     updateArrow: {},
     updateTimeState: {},
     _loadData: {},
     _onDataLoaded: {},
     _onGeomediaClick: {},
     _reset: {},
     _displayWindow: {},
     _hideWindow: {},
     _displayMedia: {} },
  holder: null,
  resourcesVersions:
   { config: 20200810071235,
     tracks: 20200807155944,
     reports: 20200807155944,
     geoblog: 0 },
  params:
   { versionsurl: '',
     resourcesurl: '',
     photourl: '',
     weatherurl: '',
     photoversion: -1,
     trackertype: 'RACE',
     delay: 0,
     numleg: 1,
     nblegs: 3,
     boatId: 0,
     zoomlevel: 'fleet',
     zoomextrapoint: [],
     months:
      [ 'jan',
        'fev',
        'mar',
        'avr',
        'mai',
        'juin',
        'juil',
        'aout',
        'sep',
        'oct',
        'nov',
        'dec',
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre' ],
     days:
      [ 'dim',
        'lun',
        'mar',
        'mer',
        'jeu',
        'ven',
        'sam',
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi' ],
     frameok: true,
     withgeoblog: false,
     activebuttons: [ 'route', 'classes', 'daynight' ],
     weather: { palette: 'LIGHT', precision: 0.5, step: 3, amplitude: 96 } } }
                */
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

  }catch(err){

  }// End catch 
})();


