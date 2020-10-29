const {SAP, getExistingSAPData, sequelize, connect, keyInDictionary} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');

// Sail Insight uses the SAP API located at my.sapsailing.com.
// TODO: In April 2020, SAP Added a permissions requirement to their Position exports. 
// To circumvent this, we need to build a connector where SAP users will add the export permission to our user,
// and then we will index their race, and provide the link. 

// MAJOR INSIGHT: SAP Sailing uses GWT - Google Web Toolkit, to build the app. 
// https://github.com/FSecureLABS/GWTMap

( async ()=> {
  //  var existingData = await getExistingSAPData()
  //  connect()

    var domain = 'http://my.sapsailing.com'

    
    // /api/v1/boatclasses
    var boatClassesRequest = await axios.get(domain + '/sailingserver/api/v1/boatclasses')
    for(classIndex in boatClassesRequest.data) {

        // let classObj = boatClassesRequest.data[classIndex]
        // console.log(classObj)
        // if(! keyInDictionary(classObj.name, existingData.Classes)){
        //     let newClass = await SAP.Class.create({id: uuidv4(), name: classObj.name, display_name:classObj.displayName, alias_names: JSON.stringify(classObj.aliasNames),
        //     typically_starts_upwind: classObj.typicallyStartsUpwind, hull_length_meters: classObj.hullLengthInMeters, hull_beam_meters:classObj.hullBeamInMeters })
        //     existingData.Classes[newClass.name] = newClass.id

        // }
    }

    // /sailingserver/api/v1/trackedevents?includeArchived=true  ?

    // /api/v1/regattas/datamining
    var dataminingRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/datamining')
    
    // /api/v1/leaderboards
    var leaderboardsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboards')
    // /api/v1/leaderboardgroups
    var leaderboardGroupsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboardgroups')

    var leaderboardNames = leaderboardsRequest.data
    var leaderboards = []
    var raceViewerUrls = []
    for(leaderboardIndex in leaderboardNames){
        // try{
        //     let leaderboardName = leaderboardNames[leaderboardIndex]
        //     let leaderboardDetailsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboards/' + encodeURI(leaderboardName))
        //     let leaderboardMarksRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboards/' + encodeURI(leaderboardName) + '/marks')
        //     leaderboards.push({name:leaderboardName, marks:leaderboardMarksRequest.data, details: leaderboardDetailsRequest.data})
            
        // }catch(err){
        //     // TODO Handle this.
        // }
        
        /** Details look like
         * { name: 'SAP Demo Event 2020-10',
            displayName: 'SAP Demo Event 2020-10',
            resultTimepoint: 1603479936862,
            delayToLiveInMillis: null,
            resultState: 'Live',
            type: 'RegattaLeaderboard',
            shardingLeaderboardName: '/leaderboard/SAP_Demo_Event_2020_10',
            discardIndexResultsStartingWithHowManyRaces: [],
            canBoatsOfCompetitorsChangePerRace: false,
            maxCompetitorsCount: null,
            scoringComment: null,
            lastScoringUpdate: null,
            columnNames: [ 'R1', 'R2', 'R3' ],
            trackedRacesInfo:
            [ { raceColumnName: 'R1', fleets: [Array] },
                { raceColumnName: 'R2', fleets: [Array] },
                { raceColumnName: 'R3', fleets: [Array] } ],
            competitors: [] }
         */
        /** marks look like
         * { marks:
            [ { '@class': 'Mark',
                name: 'Start/Finish Pin',
                shortName: 'SFP',
                id: 'd16a8c93-509c-44ec-b5a9-81592869e450',
                type: 'BUOY',
                position: null },
                { '@class': 'Mark',
                name: 'Start/Finish Boat',
                shortName: 'SFB',
                id: '4399dd17-8286-498b-b89e-207e3edc28f0',
                type: 'STARTBOAT',
                position: [Object] },


                Position looks like:
                { longitude: -81.01033014245331,
                    latitude: 31.959235430695117,
                    timestamp: 1603480226292,
                    accuracy: -1 }
         */
    }

    var leaderboardGroupNames = leaderboardGroupsRequest.data
    var leaderboardGroups = []
    
    for(leaderboardGroupIndex in leaderboardGroupNames){
        // try{
        //     let leaderboardGroupName = leaderboardGroupNames[leaderboardGroupIndex]
        //     let leaderboardGroupDetailsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboardgroups/' + encodeURI(leaderboardGroupName))
        //     leaderboardGroups.push({name: leaderboardGroupName, details: leaderboardGroupDetailsRequest.data})
           
        // }catch(err){
        //     //TODO handle this.
        // }
        
        /** details looks like this:
         * { name: 'Track test',
            id: 'fc0edc59-22c9-4f88-b0b5-93c8b1608f0d',
            description: 'Track test',
            timepoint: 'Fri Oct 23 19:16:24 UTC 2020 (+934ms)',
            events: [ '4eb04ed2-7117-4763-b729-b0788c7dd5a8' ],
            leaderboards:
            [ { name: 'Track test',
                displayName: 'Track test',
                isMetaLeaderboard: false,
                isRegattaLeaderboard: true,
                scoringComment: null,
                lastScoringUpdate: null,
                scoringScheme: 'LOW_POINT',
                regattaName: 'Track test',
                series: [Array] } ] }
         */

         /** Series looks like this:
          * [ { name: 'Default', isMedalSeries: false, fleets: [ [Object] ] } ]
          */


          /** Fleets is an array of objects, each fleet object looks like this:
           * 
           * { name: 'Default',
                color: null,
                ordering: 0,
                races:
                [ { name: 'R1',
                    isMedalRace: false,
                    isTracked: true,
                    regattaName: 'Track test',
                    trackedRaceName: 'R1',
                    trackingProviderType: 'RaceLog',
                    raceId: '34567896-c6df-407d-b87d-33096b9d2172',
                    raceViewerUrls: [Object],
                    hasGpsData: true,
                    hasWindData: true },
                    { name: 'R2',
                    isMedalRace: false,
                    isTracked: true,
                    regattaName: 'Track test',
                    trackedRaceName: 'R2',
                    trackingProviderType: 'RaceLog',
                    raceId: '4ee048c8-7bf5-4cdf-9c08-07044f7c199e',
                    raceViewerUrls: [Object],
                    hasGpsData: false,
                    hasWindData: false },
           */
    }

    //console.log(raceViewerUrls)

    // var eventsRequest = await axios.get(domain + '/sailingserver/api/v1/events?showNonPublic=true')
    // var eventsList = eventsRequest.data
   
    // for(eventIndex in eventsList){
    //     let currentEvent = eventsList[eventIndex]
    //     let detailsRequest = await axios.get(domain + '/sailingserver/api/v1/events/' + currentEvent.id)
    //     currentEvent.details = detailsRequest.data
        
    //     let statesRequest = await axios.get(domain + '/sailingserver/api/v1/events/' + currentEvent.id + '/racestates')
    //     currentEvent.states = statesRequest.data
     
    // }
     /** each event has:
        id: 'a6a5d46f-ace3-4b48-9a81-4a3711a2a5cc',
        name: 'Hs',
        description: 'Hs',
        officialWebsiteURL: null,
        baseURL: 'http://my.sapsailing.com/sailingserver/api/',
        startDate: 1590912614203,
        endDate: 1590962399999,
        venue: { name: 'Ede', courseAreas: [Array] },
        leaderboardGroups: [ [Object] ],
        trackingConnectorInfos: [],
        imageSizes: [],
        images: [],
        videos: [],
        sailorsInfoWebsiteURLs: [],
        details: {},
        states: {}

        details looks like:
        { id: '2e660b4d-34d4-4e79-8e04-8e1c30f45f7a',
            name: 'Event Sep 20, 2020 - 5:15 PM',
            description: 'Event Sep 20, 2020 - 5:15 PM',
            officialWebsiteURL: null,
            baseURL: 'https://my.sapsailing.com',
            startDate: 1600636516035,
            endDate: 1600660799999,
            venue: { name: 'ddd', courseAreas: [ [Object] ] },
            leaderboardGroups:
            [ { id: 'f333d3e4-cd68-46f0-8552-2efefa196d8b',
                name: 'Event Sep 20, 2020 - 5:15 PM',
                description: 'Event Sep 20, 2020 - 5:15 PM',
                displayName: null,
                hasOverallLeaderboard: false } ],
            trackingConnectorInfos: [],
            imageSizes: [],
            images: [],
            videos: [],
            sailorsInfoWebsiteURLs: [] }
     * 

        states looks like:
        { name: 'Larry Flite 08-27',
  id: 'e7ccc1fb-bbd3-4179-a8f0-ae238110ab56',
  raceStates: [] }
  '

        racestates looks like:
        [ { raceName: 'R1',
       fleetName: 'Default',
       trackedRaceLinked: false,
       trackedRaceName: null,
       trackedRaceId: null,
       raceState: [Object],
       courseAreaName: 'Default',
       leaderboardName: 'T',
       leaderboardDisplayName: 'T' },
     { raceName: 'R2',
       fleetName: 'Default',
       trackedRaceLinked: false,
       trackedRaceName: null,
       trackedRaceId: null,
       raceState: [Object],
       courseAreaName: 'Default',
       leaderboardName: 'T',
       leaderboardDisplayName: 'T' },
     */

    // /api/v1/trackedRaces/allRaces
    var allRacesRequest = await axios.get(domain + '/sailingserver/api/v1/trackedRaces/allRaces')
    let allRaces = allRacesRequest.data
    for(raceIndex in allRaces){
        let currentRace = allRaces[raceIndex]
       

        /** Races look like:
         * { racenumber: '0',
            remoteUrl: null,
            raceinfo:
            { raceName: 'Day 4 - Session 2',
                regattaName: 'Simple TracTrac Test with ORC PCS',
                startOfRaceAsMillis: 1429796783000 } }
         */

       
        // /api/v1/regattas/{regattaname}/races/{racename}/competitors/live

        let regatta = encodeURI(currentRace.raceinfo.regattaName)
        let race = encodeURI(currentRace.raceinfo.raceName)

//         let stats = {}
//         try{
//             for(statIndex in dataminingRequest.data){
//                 let s = dataminingRequest.data[statIndex]
//                 let statRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/datamining/' + s.Identifier)
//                 stats[s.Identifier] = statRequest.data
//             }
//             currentRace.stats = stats
//         }catch(err){
//             console.log('No race stats permission.')
//         }

        // try{
        //     let detailsRequest = await axios.get(domain + '/sailingserver/api/v1/trackedRaces/raceDetails?raceName=' + race + '&regattaName=' + regatta)
        //     currentRace.details = detailsRequest.data
        //     /**
        //      * Race details looks like this:
        //      * { eventID: '879d8339-132c-42da-8536-0c3a77ab4cc6',
        //         eventName: 'Skiff',
        //         eventType: 'SINGLE_REGATTA',
        //         raceName: 'R1',
        //         regattaName: 'Skiff',
        //         leaderboardName: 'Skiff',
        //         leaderboardDisplayName: 'Skiff',
        //         startOfRaceAsMillis: 1587889200000,
        //         remoteUrl: null }
        //     */
        // }catch(err){
        //     console.log('No race details permission.')
        // }   
       
//         try{
//             let maneuversRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/maneuvers')
//             currentRace.maneuvers = maneuversRequest.data
            
//             /** 
//              * { bycompetitor:
//    [ { competitor: '5c58ef30-f6df-4b38-83f7-a040455f2c33',
//        maneuvers: [Array] } ] }


//                 maneuvers for each competitor is an array like this:
//                 { maneuverType: 'TACK',
//                 newTack: 'STARBOARD',
//                 speedBeforeInKnots: 146.636962890625,
//                 cogBeforeInTrueDegrees: 129.517822265625,
//                 speedAfterInKnots: 2.9296875,
//                 cogAfterInTrueDegrees: 99.832763671875,
//                 directionChangeInDegrees: 330.31494140625,
//                 maneuverLoss:
//                 { geographicalMiles: 0.8792148998816653,
//                     seaMiles: 0.8791779817900485,
//                     nauticalMiles: 0.8793203972298632,
//                     meters: 1628.5013756697067,
//                     kilometers: 1.6285013756697067,
//                     centralAngleDeg: 0.014653581664694422,
//                     centralAngleRad: 0.00025575324725878935 },
//                 positionAndTime:
//                 { type: 'GPSFix',
//                     lat_deg: 54.3472203237337,
//                     lon_deg: 10.13288769649581,
//                     unixtime: 1584110170975 },
//                 maxTurningRateInDegreesPerSecond: 24.507962740384617,
//                 avgTurningRateInDegreesPerSecond: 20.721345191351315,
//                 lowestSpeedInKnots: 1.556396484375,
//                 markPassing: false }
//              */
//         }catch(err){
//             console.log('No maneuvers permission')
//         }
       
        // try{
        //     let now = new Date().getTime()
        //     let windRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/wind?fromtimeasmillis=0&totimeasmillis=' + now.toString()) 
        //     currentRace.wind = windRequest.data
        //     console.log(currentRace.wind)
        // }catch(err){
        //     console.log('No wind permission'
        // }
    

        // try{
        //     let timesRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/times')
        //     currentRace.times = timesRequest.data
            
        // }catch(err){
        //     console.log('no times permission')
        // }
        

        // try{
        //     let startAnalysisRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/startanalysis')
        //     currentRace.startAnalysis = startAnalysisRequest.data
        // }catch(err){
        //     console.log('no start analysis permission')
        // }

        // try{
        //     let courseRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/course')
        //     currentRace.course = courseRequest.data
        // }catch(err){
        //     console.log('no course permission')
        // }
        

        // try{
        //     let marksPositionsRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/marks/positions')
        //     currentRace.marksPositions = marksPositionsRequest.data
        // }catch(err){
        //     console.log('no marks positions permission')
        // }
        

        // try{
        //     let legsRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/competitors/legs')
        //     currentRace.legs = legsRequest.data
        // }catch(err){
        //     console.log('no legs permission')
        // }
        

        // try{
        //     let positionsRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/competitors/positions')
        //     currentRace.positions = positionsRequest.data
        //     console.log(currentRace.positions)
        // }catch(err){
        //     console.log('no posissions permission')
        // }
        

        // try{
        //     let passingsRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/markpassings')
        //     currentRace.passings = passingsRequest.data
        // }catch(err){
        //     console.log('no passings permission')
        // }

        // try{
        //     let firstLegBearingRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/firstlegbearing')
        //     currentRace.firstLegBearing = firstLegBearingRequest.data
        // }catch(err){
            
        // }
        
        // try{
        //     let entriesRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/races/' + race + '/entires')
        //     currentRace.entries = entriesRequest.data
        //     console.log(entriesRequest.data)
        // }catch(err){
        //     console.log('no entries permission')
        // }
      
    }

    console.log('Trying non tracked races')
    // /api/v1/trackedRaces/getRaces?transitive=true For now this request seems to be the exact same as the first one.
    var allRacesOtherRequest = await axios.get(domain + '/sailingserver/api/v1/trackedRaces/getRaces?transitive=true')

    var regattasRequest = await axios.get(domain + '/sailingserver/api/v1/regattas?showNonPublic=true')
    var regattaList = regattasRequest.data
    for(regattaIndex in regattaList){

        let currentRegatta = regattaList[regattaIndex]
        let detailsRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + encodeURI(currentRegatta.name))
        currentRegatta.details = detailsRequest.data

        // /api/v1/regattas/{regattaName}/tracking_devices
        let trackingRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + encodeURI(currentRegatta.name) + '/tracking_devices')
        currentRegatta.trackingDevices = trackingRequest.data

        // /api/v1/regattas/{regattaname}/windsummary
        let windSummaryRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + encodeURI(currentRegatta.name) + '/windsummary')
        currentRegatta.windSummary = windSummaryRequest.data

        // /api/v1/regattas/{regattaname}/competitors
        let competitorsRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + encodeURI(currentRegatta.name) + '/competitors') 
        currentRegatta.competitors = competitorsRequest.data

        let entriesRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + encodeURI(currentRegatta.name) + '/entries')
        currentRegatta.entries = entriesRequest.data

        let racesRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + encodeURI(currentRegatta.name) + '/races')
        currentRegatta.races = racesRequest.data

        let regattaStats = {}
        for(statIndex in dataminingRequest.data){
            let s = dataminingRequest.data[statIndex]
            let statRequest = await axios.get(domain + '/sailingserver/api/v1/regattas/' + regatta + '/datamining/' + s.Identifier)
            regattaStats[s.Identifier] = statRequest.data
        }
        currentRegatta.stats = stats
    }
    /** 
     * Each regatta has:
        name: 'Event Oct 7, 2020 - 12:55 AM',
        startDate: null,
        endDate: null,
        scoringSystem: 'LOW_POINT',
        rankingMetric: 'ONE_DESIGN',
        boatclass: 'ORC Club',
        courseAreaIds: [],
        canBoatsOfCompetitorsChangePerRace: false,
        competitorRegistrationType: 'OPEN_UNMODERATED',
        useStartTimeInference: false,
        controlTrackingFromStartAndFinishTimes: true,
        autoRestartTrackingUponCompetitorSetChange: true
     */
})();