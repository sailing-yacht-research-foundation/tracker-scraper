//const {sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../../tracker-schema/schema.js')
// const puppeteer = require('puppeteer');
// const { get } = require('request');
// var im = require('imagemagick');
const fs = require('fs');
// const exec = require('sync-exec');
// const blend = require('@mapbox/blend');
const axios = require('axios');
( async () => {
    var col = 3936
    var row = 1352
    let colMax = 4342
    let rowMax = 3094
    let inRow = false;
    let boundsByRow = {}
    while(row <= rowMax){
        col = 3936
        let bounds = []
        while(col <= colMax){
            console.log('try')
            await axios({
                method: 'get',
                responseType: 'arraybuffer',
                url: 'https://services.data.shom.fr/clevisu/wmts?layer=RASTER_MARINE_150_WMTS_3857&style=normal&tilematrixset=3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=13&TileCol='+col+'&TileRow='+row,
                headers: {
                'Connection': 'keep-alive',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'image',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-encoding': 'gzip',
                'Referer': 'https://data.shom.fr/',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'

                }
            }).then((response)=> {
                console.log('success')
                console.log(response.data)
                let name = 'shom_150_images_europe/row_' + row + '_col_' + col + '.png'
               
                fs.writeFileSync(name, response.data)
            }).catch(err=>{
                console.log(err)
            })
            col++
        }
        row++
    }
    

    

})();
