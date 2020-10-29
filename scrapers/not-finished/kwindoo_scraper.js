const {Georacing, sequelize, connect} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');


( async () => {
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
        // viewable url = https://www.kwindoo.com/tracking/7233-wvfyci-mittwochsregatta?race_id=20378

        // regattaname/raceid
        let detailsRequest = await axios({
            method:'get',
            url:'https://api.kwindoo.com/api/regatta/get-details?regatta_id=' + currentRegatta.id
        })

        let regattaDetails = detailsRequest.data.response.regatta

        for(raceIndex in regattaDetails.races){
            let currentRace = regattaDetails.races[raceIndex]

            let boatDataRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/api/regatta/get-boat-data?raceId=' + currentRace.id
            })
            let boatDetails = boatDataRequest.data.response.users

            let markersRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/ajax/race-office/track-editor/get-markers-by-race?raceId=' + currentRace.id
            })
            let markers = markersRequest.data.response

            let poiRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/tracking/get-pois?regattaId=' + currentRace.id
            })
            let pois = poiRequest.data.response

            let miaRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/tracking/get-mias?regattaId=' + currentRegatta.id + '&raceId=' + currentRace.id
            })
            let mias = miaRequest.data.response

            // https://api.kwindoo.com/ajax/tracking/get-waypoints-by-race?raceId=20377
            let waypointRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/ajax/tracking/get-waypoints-by-race?raceId=' + currentRace.id
            })
            let waypoints = waypointRequest.data.response

            let commentsDataRequest =  await axios({
                method:'get',
                url:'https://api.kwindoo.com/api/tracking/get-comments?raceId=' + currentRace.id
            })
            let comments = commentsDataRequest.data.response.comments

            let fromTimestamp = currentRace.start_timestamp
            let toTimestamp = currentRace.end_timestamp 
       
            let posUrl = 'https://api.kwindoo.com/tracking/get-locations?stream=archive&fromTimestamp=' + fromTimestamp.toString() + '&raceId=' + currentRace.id + '&toTimestamp=' + toTimestamp
            let positionsDataRequest = await axios({
                method:'get',
                headers: { Accept:'*/*', 'User-Agent':'KwindooLive/3.6 (iPhone; iOS 13.7; Scale/3.00)'},
                url:posUrl
            })
            let positions = positionsDataRequest.data.response
            
        }
        
    }

})();


