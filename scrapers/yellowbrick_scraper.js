const {Yellowbrick, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const xml2json = require('xml2json');
const axiosRetry = require('axios-retry');

function strEncodeUTF16(str) {
    var buf = new ArrayBuffer(str.length*2);
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
  }



( async () => {
    
    if(! connect()){
        process.exit()
    }

    const existingOwnedRaces = await Yellowbrick.YellowbrickOwnedRace.findAll({ attributes: ['id', 'race_id']})
    const owned = []
    existingOwnedRaces.forEach(r => {
        owned.push(r.race_id)
    })
    // GET CODES

    // TODO: Put user-key, udid, urls in DB
    // TODO: Save list of race-id and codes.
    // TODO: Check to see if I need to even "purchase" the race id based on above mentioned saved list.
    const YB_RACE_LIST_URL = 'https://app.yb.tl/App/Races?version=3'
    var ybRaceListResult = await axios.get(YB_RACE_LIST_URL)
    var ybRaceListXML = ybRaceListResult.data
    var ybRaceListJSON = JSON.parse(xml2json.toJson(ybRaceListXML))
    var raceList = ybRaceListJSON.r.races.race

    for(raceIndex in raceList){
        console.log('Getting ' + raceIndex + ' of ' + raceList.length)
        var raceMetadata = raceList[raceIndex]
        var raceId = raceMetadata['race-id']
        var raceDate = raceMetadata['date']
        var productId = raceMetadata['ios-productid']
        if(! owned.includes(raceId)){
            console.log('Associating ' + raceIndex + ' of ' + raceList.length)
            var associateUrl = 'https://app.yb.tl/App/purchase?version=2&user-key=ca6f2ddda62a4bda5ba585597a4c7cd4b6554615&udid=F58731B3-E4\
        21-459B-BF02-0DED5F4B7490&product-id=' + productId + '&receipt=' + productId + '&try=0'

            await axios.get(associateUrl)
            await Yellowbrick.YellowbrickOwnedRace.create({ id: uuidv4(), race_id: raceId }, {fields:['race_id', 'id']})
        }
    }

    var ybCodeListXMLResult = await axios.get('https://app.yb.tl/App/MyRaces?version=2')
    var ybCodeList2XMLResult = await axios.get('https://app.yb.tl/App/MyRaces?version=4&user-key=ca6f2ddda62a4bda5ba585597a4c7cd4b6554615&udid=F58731B3-E421-459B-BF02-0DED5F4B7490&os=i&sv=4021&osv=12.4.1')
    
    var ybCodeListXML = ybCodeListXMLResult.data
    var ybCodeList2XML = ybCodeList2XMLResult.data
 
    var ybCodeListJSON = JSON.parse(xml2json.toJson(ybCodeListXML)).r.myraces.race
    var ybCodeList2JSON = JSON.parse(xml2json.toJson(ybCodeList2XML)).r.myraces.race
  
    var usedCodes = {}
    var metadatas = []
    for(codeIndex in ybCodeList2JSON) {
      var m = ybCodeList2JSON[codeIndex]
 
      if(usedCodes[m['race-id']] == undefined){
        
        var endpoint = ''
        if(m['endpointl'] !== undefined){
            endpoint = m['endpointl']
        } else {
            endpoint = m['endpoint']
        }
        var metadata = {
            id: uuidv4(),
            race_id: m['race-id'],
            date: m['date'],
            title: m['title'],
            blurb: m['blurb'],
            url_logo: m['url-logo'],
            url_map: m['url-map'],
            base_url: m['base-url'],
            endpoint: endpoint
        }
        usedCodes[m['race-id']] = metadata
        metadatas.push(metadata)
        if(m['children'] !== undefined){

            for(childIndex in m['children']['race']){
                
                var c = m['children']['race'][childIndex]
               
                var child = {
                    id: uuidv4(),
                    race_id: m['race-id'],
                    date: c['date'],
                    title: c['title'],
                    blurb: '',
                    url_logo: m['url-logo'],
                    url_map: m['url-map'],
                    base_url: c['base-url'],
                    endpoint: c['endpoint'],
                    parent: metadata.id
                }
                metadatas.push(child)
            }
        }
      }
    }
    for(codeIndex in ybCodeListJSON) {
      var m = ybCodeListJSON[codeIndex]
      if(usedCodes[m['race-id']] == undefined){
        var endpoint = ''
        if(m['endpointl'] !== undefined){
            endpoint = m['endpointl']
        } else {
            endpoint = m['endpoint']
        }
        var metadata = {
            id: uuidv4(),
            race_id: m['race-id'],
            title: m['title'],
            blurb: m['blurb'],
            url_logo: m['url-logo'],
            url_map: m['url-map'],
            base_url: m['base-url'],
            endpoint: endpoint
        }
        usedCodes[m['race-id']] = metadata
        metadatas.push(metadata)
      }
    }

    
    // TODO: Replace this with already saved races.
    var codes = ["151miglia2012",
    "151miglia2014",
    "151miglia2017",
    "151miglia2018",
    "151miglia2019",
    "1957mercedesworldtour",
    "491belabartok",
    "5jours2015",
    "5jours2016",
    "5jours2017",
    "5jours2018",
    "5jours2019",
    "900nst2014",
    "900nst2015",
    "900nst2016_1",
    "900nst2016",
    "a2b2017",
    "a2b2018",
    "a2b2019",
    "a2f2014-c",
    "a2f2014",
    "a2n2011",
    "a2n2013",
    "a2n2015",
    "a2n2017",
    "a2n2018",
    "a2n2019",
    "aar2018",
    "abor2016",
    "abor2018",
    "air2012",
    "air2014",
    "aldst2017_1",
    "aldst2017_2",
    "aldst2017",
    "alst2018_1",
    "alst2018_2",
    "alst2018",
    "ambon2014",
    "ambon2015",
    "ambon2017",
    "ambon2018",
    "ambon2019",
    "antiki2",
    "arc2010",
    "arc2011",
    "arc2012",
    "arc2013-1",
    "arc2013",
    "arc2014",
    "arc2014plus",
    "arc2015",
    "arc2016",
    "arc2017",
    "arc2018",
    "arc2019",
    "arci650_2015",
    "arci650_2016",
    "arci650_2017",
    "arcipelago6502014",
    "arcplus2015",
    "arcplus2016",
    "arcplus2017",
    "arcplus2018",
    "arcplus2019",
    "arcsvg2018",
    "arcsvg2019",
    "armen2008#",
    "armen2009#",
    "armen2010#",
    "armen2011#",
    "armen2012#",
    "armen2013#",
    "armen2014",
    "armen2014-ultime",
    "armen2014#",
    "armen2015",
    "armen2015#",
    "armen2015p2",
    "armen2015p3",
    "armen2016#",
    "armen2017",
    "armen2017_2",
    "armen2017#",
    "armen2018",
    "armen2018_1",
    "armen2018#",
    "armen2019",
    "armen2019_1",
    "armen2019#",
    "atlantic_avengers",
    "azab2011",
    "azab2015",
    "azab2015l2",
    "azab2019_2",
    "azab2019",
    "azo2014",
    "azo2015",
    "b2hi2019",
    "b2k2011",
    "b2k2012",
    "b2k2013",
    "b2k2015",
    "b2k2016",
    "b2k2017",
    "b2k2018",
    "b2k2019",
    "b2n2015",
    "b2n2018",
    "baillidesuffrentrophy2016_2",
    "baillidesuffrentrophy2016_3",
    "baillidesuffrentrophy2016",
    "baillidesuffrentrophy2017_2",
    "baillidesuffrentrophy2017_3",
    "baillidesuffrentrophy2017",
    "baillidesuffrentrophy2018_1",
    "baillidesuffrentrophy2018_2",
    "baillidesuffrentrophy2018",
    "bayview2014-cove",
    "bayviewmack2011",
    "bayviewmack2012",
    "bayviewmack2013_1",
    "bayviewmack2013",
    "bayviewmack2014",
    "bayviewmack2015-cove",
    "bayviewmack2015",
    "bayviewmack2016-cove",
    "bayviewmack2016",
    "bayviewmack2017-cove",
    "bayviewmack2017",
    "bayviewmack2018-cove",
    "bayviewmack2018",
    "bayviewmack2019-cove",
    "bayviewmack2019",
    "bear2017",
    "ber2015",
    "bergen2012",
    "bergen2013",
    "bergen2014-return",
    "bergen2014",
    "bergen2015",
    "bergen2015l2",
    "bergen2016_2",
    "bergen2016",
    "bergen2017_2",
    "bergen2017",
    "bergen2018_1",
    "bergen2018",
    "bergen2019_1",
    "bergen2019",
    "bigame_2019",
    "biggame",
    "bitwa2013",
    "bitwa2014",
    "bitwa2015-2",
    "bitwa2015-nostop",
    "bitwa2015",
    "bitwa2017",
    "bitwa2018",
    "bitwa2019",
    "blacksea2014-3",
    "blacksea2014-cc",
    "blacksea2014",
    "boyaconsulting",
    "brisglad2013",
    "brisglad2014",
    "brisglad2015",
    "brisglad2016",
    "brisglad2017",
    "brisglad2018",
    "brisglad2019",
    "brunyisland2017",
    "brunyisland2018",
    "bsc-rsx",
    "bulbomatto2012",
    "bunret2012",
    "bunret2013",
    "bunret2014",
    "bunret2015",
    "bunret2016",
    "bunret2017",
    "bunret2018",
    "bunret2019",
    "bvi2014",
    "c1500-2011",
    "c1500-2013",
    "c1500-2014-2",
    "c1500-2014",
    "c1500-2015-2",
    "c1500-2015",
    "c15002012",
    "c6002013",
    "c6002014",
    "c6002015",
    "C6002016",
    "c6002017",
    "c6002018",
    "c6002019",
    "caborace2017",
    "caborace2019",
    "capenaturaliste2012",
    "capenaturaliste2016",
    "capenaturaliste2017",
    "capenaturaliste2018",
    "capenaturaliste2019",
    "carina",
    "cc2013",
    "cc2014",
    "cc2015",
    "cc2016",
    "cc2017",
    "cc2019",
    "cervantes2011",
    "cervantes2015",
    "cervantes2016",
    "cervantes2018",
    "cervantes2019",
    "channel2015",
    "channel2016",
    "channel2017",
    "channel2018",
    "channel2019_1",
    "channel2019",
    "channelrace2010",
    "channelrace2011",
    "channelrace2012",
    "channelrace2013",
    "channelrace2017",
    "channelrace2018_1",
    "channelrace2018",
    "cherbourg2016",
    "cherbourg2017",
    "cherbourg2018",
    "cherbourg2019",
    "chicagomack2012",
    "chicagomack2013",
    "chicagomack2014",
    "chicagomack2015",
    "chicagomack2016",
    "chicagomack2017",
    "chicagomack2018",
    "clipper2013-leg2",
    "clipper2013-race03",
    "clipper2013-race04",
    "clipper2013-race05",
    "clipper2013-race06",
    "clipper2013-race07",
    "clipper2013-race08",
    "clipper2013-race09",
    "clipper2013-race09a",
    "clipper2013-race10",
    "clipper2013-race11",
    "clipper2013-race12",
    "clipper2013-race13",
    "clipper2013-race14",
    "clipper2013-race15",
    "clipper2013-race16",
    "comanche",
    "commodorescup2012",
    "commodorescup2016_1",
    "commodorescup2016",
    "corw2016_2",
    "corw2016_3",
    "corw2016",
    "corw2017_2",
    "corw2017_3",
    "corw2017",
    "corw2018_1",
    "corw2018_2",
    "corw2018",
    "corw2019_1",
    "corw2019_2",
    "corw2019_3",
    "corw2019",
    "cowespowerboat2011",
    "cowespowerboat2012",
    "cowespowerboat2013",
    "cruisingclubsuisse",
    "ctc2014-2",
    "ctc2014",
    "ctc2015-1",
    "ctc2015-2",
    "CTC2016_2",
    "ctc2016",
    "ctc2017_2",
    "ctc2017_club",
    "ctc2017",
    "ctc2018",
    "ctc2019_2",
    "ctc2019",
    "d2d2014",
    "d2d2015",
    "d2d2016",
    "d2d2017",
    "d2d2018",
    "d2d2019",
    "darwin2012",
    "darwin2013",
    "delmarva2013",
    "delmarva2014",
    "delmarva2015",
    "delmarva2016",
    "delmarva2017",
    "delmarva2018",
    "dgbr2016_1",
    "dgbr2016",
    "dgbr2017",
    "dgbr2018",
    "dgbr2019",
    "dingle2017",
    "dksihtifgh18",
    "dolphin2013",
    "dolphin2014",
    "drheam_cup",
    "espadon",
    "espadon3",
    "espadon4",
    "eur2015",
    "f2b2013",
    "f2b2015",
    "f2b2017",
    "fal2014",
    "falmouth2015",
    "fareast2018",
    "fastnet-2013",
    "fastnet2011",
    "fastnet2015",
    "fastnet2017",
    "fastnet2019",
    "flo2015",
    "ftbaltic2012",
    "gallagher",
    "gasept2012",
    "gasjul2011",
    "gasjul20112",
    "gasjul2012",
    "gasjul20122",
    "gasjuly2013",
    "gasjuly2013-os",
    "gasjuly2014",
    "gasjun2010",
    "gasjun20102",
    "gasjun2011",
    "gasjun2012",
    "gasjun2013",
    "gasjune2013",
    "gasjune2013-os",
    "gasjune2014",
    "gasoct09",
    "gasoct2010",
    "gasoct2010os",
    "gasoct2013",
    "gasoct2013-os",
    "gassep2010",
    "gassept2011",
    "gassept2011-all",
    "gassilver2014",
    "gb2017fr",
    "gcsjun2010",
    "geraldton2013",
    "geraldton2014-leg2",
    "geraldton2014",
    "geraldton2015-2",
    "geraldton2015",
    "geraldton2016_1",
    "geraldton2016_2",
    "geraldton2016",
    "geraldton2017_1",
    "geraldton2017_3",
    "geraldton2017",
    "geraldton2018_1",
    "geraldton2018",
    "geraldton2019_2",
    "geraldton2019",
    "ggr2018",
    "grassy2012",
    "greatpacificrace2014",
    "greatpacificrace2016",
    "greenwhich2014",
    "groupama2014",
    "gryphonsolo2",
    "halifax2012",
    "halifax2014",
    "halifax2016",
    "halifax2018",
    "heli2edi2019",
    "hkhn2014",
    "hkhn2016",
    "hkhn2018",
    "HKPG2019",
    "hkt2011",
    "hkt2012",
    "hkvn2010",
    "hkvn2011",
    "hkvn2013",
    "hkvn2015",
    "hkvn2017",
    "hkvn2019",
    "hmsailing",
    "idp2019",
    "ildr2015",
    "ildr2015phrf",
    "ildr2016_2",
    "ildr2016",
    "ildr2017_2",
    "ildr2017",
    "ildr2018_1",
    "ildr2018",
    "ildr2019",
    "ilesdusoleil2017",
    "ilesdusoleil2018_1",
    "ilesdusoleil2018",
    "ilesdusoleil2019_1",
    "ilesdusoleil2019",
    "ilmostro2017",
    "imoca_tjv2019",
    "impulse",
    "inshore_3",
    "inshore1",
    "inshore2",
    "inshore2018",
    "inshore2018-2",
    "ir2019",
    "isamac2018",
    "isamac2019",
    "islandsrace2013",
    "islandsrace2014",
    "islandsrace2015",
    "islandsrace2016",
    "islandsrace2017",
    "islandsrace2018",
    "isora2016_1",
    "isora2016_2",
    "isora2016_3",
    "isora2016_4",
    "isora2016_5",
    "isora2016_6",
    "isora2016_7",
    "isora2016_8",
    "isora2016",
    "isora2017_10",
    "isora2017_11",
    "isora2017_12",
    "isora2017_13",
    "isora2017_14",
    "isora2017_2",
    "isora2017_3",
    "isora2017_4",
    "isora2017_5",
    "isora2017_9",
    "isora2017",
    "isora2018_10",
    "isora2018_11",
    "isora2018_12",
    "isora2018_13",
    "isora2018_14",
    "isora2018_15",
    "isora2018_2",
    "isora2018_3",
    "isora2018_4",
    "isora2018_6",
    "isora2018_7",
    "isora2018_8",
    "isora2018_9",
    "isora2018",
    "isora2019_11",
    "isora2019_12",
    "isora2019_13",
    "isora2019_14",
    "isora2019_15",
    "isora2019_16",
    "isora2019_2",
    "isora2019_3",
    "isora2019_4",
    "isora2019_5",
    "isora2019_6",
    "isora2019_7",
    "isora2019_8",
    "isora2019_9",
    "isora2019",
    "jsastc",
    "koh2016",
    "koh2018",
    "koh2019",
    "lag2014",
    "lag2015",
    "liteboat",
    "lo300-2012-1",
    "lo300-2012-2",
    "ltscmini2012",
    "ltscmini2013",
    "ltsr2019",
    "lyver2011",
    "lyver2013",
    "lyver2015",
    "lyver2017",
    "map2011",
    "map2012",
    "map2013",
    "map2014",
    "mb2015",
    "mb2015return",
    "mb2017",
    "mb2019",
    "mb2019return",
    "mbgyr2012",
    "mbgyr2013",
    "mel2hob2011e",
    "mel2hob2012e",
    "mel2hob2013e",
    "mel2hob2014-1",
    "mel2hob2014",
    "mel2stan2011",
    "mel2stan2012",
    "mem2014",
    "mem2015",
    "mem2015r2",
    "mem2016",
    "mem2017",
    "mem2018",
    "mem2019_1",
    "mem2019",
    "mgrb2016",
    "mgrb2017",
    "mgrb2018",
    "mgrb2019",
    "MHOR2013",
    "MHOR2015",
    "MHOR2017",
    "MHOR2019",
    "miglia2013",
    "miglia2015",
    "miglia2016",
    "minifastnet2011",
    "minifastnet2012",
    "minifastnet2013",
    "minifastnet2014",
    "minifastnet2015",
    "minifastnet2016",
    "minifastnet2017",
    "minifastnet2018",
    "minifastnet2019",
    "mom2018",
    "mom2019",
    "morgancup2015",
    "morgancup2016",
    "morgancup2017",
    "morgancup2018",
    "morgancup2019",
    "myth2015",
    "myth2016",
    "myth2017",
    "n2e2018_1",
    "n2e2018_2",
    "n2e2018",
    "n2e2019_1",
    "n2e2019_2",
    "n2e2019",
    "nb2012",
    "nb2014",
    "nb2016",
    "nb2018",
    "nc2012",
    "ncgr2016",
    "ncgr2018",
    "newport2cabo2013",
    "northsea_2019",
    "northsea_2019_1",
    "northsea2013",
    "northsea2014",
    "northsea2015_2",
    "northsea2015",
    "northsea2015r2",
    "northsea2016_1",
    "northsea2016",
    "northsea2017_2",
    "northsea2017",
    "northsea2018_1",
    "northsea2018",
    "northsea2019",
    "northsearace2011",
    "northsearace2012",
    "nsr2014-leg2",
    "nsr2014",
    "nsr2015",
    "nsr2016_2",
    "nsr2016",
    "oceancleanup",
    "oldsorlandet",
    "onetwo2013",
    "onetwo2015",
    "onetwo2015l2",
    "onetwo2017_2",
    "onetwo2017",
    "onetwo2019_1",
    "onetwo2019",
    "orcv2011return",
    "orcv2012return",
    "osaka2013",
    "ostar2013",
    "ottocusmano",
    "otyr2014",
    "otyr2016",
    "ouinee",
    "owrleg3",
    "oyster2012",
    "oysterwr",
    "paccup14",
    "paccup2016",
    "paccup2018",
    "pacificcup2012",
    "pacificcup2012return",
    "phr2017",
    "pineapple2017",
    "pineapple2019",
    "plm2018",
    "plm2019",
    "plyw2014",
    "plyw2015",
    "plyw2016",
    "plyw2017",
    "plyw2018",
    "plyw2019",
    "pm2017",
    "pm2018",
    "pm2019",
    "polonez2012",
    "polonez2013",
    "polonez2014",
    "polonez2015",
    "polonez2016",
    "polonez2017",
    "polonez2018",
    "polonez2019",
    "port2015",
    "prepare2go",
    "ps2015",
    "ps2016",
    "ps2017",
    "ps2018",
    "ps2019",
    "ps650_2018",
    "ps650_2019",
    "pst_jan12_google",
    "pst-jan12",
    "rajamuda2017_1",
    "rajamuda2017_2",
    "rajamuda2017",
    "rajamuda2018_1",
    "rajamuda2018_2",
    "rajamuda2018",
    "rajamuda2019_1b",
    "rajamuda2019_2",
    "rajamuda2019_5",
    "rajamuda2019",
    "rallye_2019",
    "raven",
    "rbandi2014",
    "rbi2018",
    "rbni2018",
    "rdsas2012",
    "rdsas2013",
    "rdsas2014-leg2",
    "rdsas2014",
    "rdsas2015",
    "rdsas2015l2",
    "rdsas2016-1",
    "rdsas2016",
    "rdsas2017",
    "rdsas2018",
    "rig2016_1",
    "rig2016_2",
    "rig2016_3",
    "rig2016",
    "rig2017_1",
    "rig2017_2",
    "rig2017",
    "rig2018_1",
    "rig2018_3",
    "rig2018_4",
    "rig2018_5",
    "rig2018_6",
    "rig2018",
    "rig2019_2",
    "rig2019_3",
    "rig2019_4",
    "rig2019_5",
    "rig2019_6",
    "rig2019",
    "rmsr2012",
    "rmsr2013",
    "rmsr2014",
    "rmsr2015",
    "rmsr2016",
    "rmsr2017",
    "rmsr2018",
    "rmsr2019",
    "RNZTH",
    "RNZTHl1",
    "RNZTHl2",
    "RNZTHl3",
    "roa2017_2",
    "rolexchinasea2012",
    "rolexchinasea2014",
    "rolexchinasea2016",
    "rolexchinasea2018",
    "rolexs2h2011",
    "rolexs2h2012",
    "rolexs2h2013",
    "rolexs2h2014",
    "rolexs2h2015",
    "rolexs2h2016",
    "rolexs2h2017",
    "rolexs2h2018",
    "rolexs2h2019",
    "roma2017_2",
    "roma2017_3",
    "roma2017_4",
    "roma2017",
    "roma2018_2",
    "roma2018_3",
    "roma2018_4",
    "roma2018_5",
    "roma2018",
    "roma2019_1",
    "roma2019_3",
    "roma2019_4",
    "roma2019_5",
    "roma2019_6",
    "roma2019",
    "rorctransat2014",
    "rorctransat2015",
    "rorctransat2016",
    "rorctransat2017",
    "rorctransat2018",
    "rorctransat2019",
    "rotc2012oct",
    "rotc2013oct",
    "rotc2016_2",
    "rotc2016_3",
    "rotc2016_4",
    "rotc2016",
    "rotc2017_2",
    "rotc2017",
    "rotc2018_1",
    "rotc2018_3",
    "rotc2018",
    "roundnz2019_2",
    "roundnz2019",
    "RowingtheMinch",
    "rti2014",
    "rumrunner2015",
    "rumrunner2017",
    "rwyc_transat2017",
    "sailfiji2016",
    "sardinhas19_2",
    "sardinhas19_3",
    "sardinhas19",
    "satt2011",
    "satt2012_2",
    "satt2012_3",
    "satt2012_4",
    "satt2012_5",
    "satt2012",
    "satt2014",
    "satt2015_2",
    "satt2015_3",
    "satt2015_4",
    "satt2015_5",
    "satt2015",
    "satt2015l2",
    "satt2015l3",
    "satt2015l4",
    "satt2015l5",
    "satt2015l6",
    "satt2016_2",
    "satt2016_3",
    "satt2016_4",
    "satt2016_5",
    "satt2016",
    "satt2017_2",
    "satt2017_3",
    "satt2017_4",
    "satt2017_5",
    "satt2017",
    "satt2018_1",
    "satt2018_2",
    "satt2018_3",
    "satt2018_4",
    "satt2018",
    "satt2019_1",
    "satt2019_2",
    "satt2019_3",
    "satt2019_4",
    "satt2019",
    "sbc15",
    "sbc15l2",
    "scfbstsr2016_1",
    "scfbstsr2016_2",
    "scfbstsr2016",
    "sdpv16",
    "sdpv18",
    "sdpv2012",
    "sdpv2014",
    "sfa2013",
    "sgcr2015",
    "sgcr2016",
    "sgcr2017",
    "sgcr2018",
    "sgcr2019",
    "shtp2014",
    "shtranspac2012",
    "sissens",
    "skagen2012",
    "skagen2014",
    "skagerakacross2012",
    "skagerakacross2013",
    "smq2014",
    "smq2015",
    "smq2017",
    "smq2018",
    "smq2019",
    "solent6502014",
    "solo2014",
    "solo2015",
    "solo2017",
    "solo2018",
    "solo2019",
    "solofastnet2018",
    "solomq2015courseaularge",
    "solomq2015r2",
    "solomq2015r3",
    "solomq2015r4",
    "sorcrtr2016",
    "sph2017_2",
    "sph2017",
    "sph2018",
    "sph2019",
    "staagmongolia2012",
    "staagmongolia2013",
    "statsraad",
    "stkilda2018_1",
    "stkilda2018_2",
    "stkilda2018",
    "stmalo2015",
    "stmalo2016",
    "stmalo2017",
    "stmalo2018",
    "stmalo2019",
    "stonington2012",
    "supermac2015",
    "supermac2017",
    "t2p2012",
    "t2p2013",
    "tahiti2012",
    "tdpdlm2016_11",
    "tdpdlm2016_15",
    "tdpdlm2016_2",
    "tdpdlm2016_5",
    "tdpdlm2016_7",
    "tdpdlm2016",
    "tdpdlm2018_1",
    "tdpdlm2018_2",
    "tdpdlm2018_3",
    "tdpdlm2018_4",
    "tdpdlm2018_5",
    "tdpdlm2018",
    "tdpdlm2019_2",
    "tdpdlm2019_3",
    "tdpdlm2019_4",
    "tdpdlm2019_5",
    "tdpdlm2019_6",
    "tdpdlm2019_7",
    "tdpdlm2019",
    "teamran",
    "threepeaks2011",
    "threepeaks2012",
    "threepeaks2013",
    "threepeaks2014",
    "threepeaks2015",
    "threepeaks2016",
    "threepeaks2017",
    "threepeaks2018",
    "threepeaks2019",
    "tr2019",
    "transatlantic2015_coastal",
    "transatlantic2015",
    "transpac2011_return",
    "transpac2011-return",
    "transpac2011",
    "transpac2013_return",
    "transpac2013-return",
    "transpac2013",
    "transpac2015_return",
    "transpac2015-finish",
    "transpac2015-return",
    "transpac2015",
    "transpac2017_3",
    "transpac2017-100nm",
    "transpac2017",
    "transpac2019_return",
    "transpac2019",
    "transpac2019200nm",
    "transsuperior2011",
    "transsuperior2013",
    "transsuperior2015",
    "transsuperior2017",
    "transsuperior2019",
    "trophee_ouinee_2019",
    "trophee2018_1",
    "trophee2018_2",
    "trophee2018_3",
    "trophee2018_4",
    "trophee2018_5",
    "trophee2018-6",
    "trophee2019_2",
    "trophee2019_4",
    "trophee2019_5",
    "trophee2019_6",
    "trophee2019_7",
    "tropheeouinne2018",
    "ts_2",
    "tsr2017_2",
    "tsr2017_3",
    "tsr2017_4",
    "tsr2017",
    "tsr2018_1",
    "tsr2018_2",
    "tsr2018",
    "tsr2019_1",
    "tsr2019_2",
    "tsr2019",
    "tsrcustom",
    "twostar2012",
    "ultramagic2019_1",
    "ultramagic2019_4",
    "ultramagic2019_5",
    "ultramagic2019",
    "ultramgic2019_2",
    "usa2014",
    "usa2015",
    "usa2016_1",
    "usa2016_2",
    "usa2016",
    "usa2017_2",
    "usa2017_3",
    "usa2017",
    "usa2019_1",
    "usa2019_2",
    "usa2019",
    "ustluga2016",
    "ustluga2017",
    "ustluga2019_2",
    "ustluga2019_3",
    "ustluga2019_4",
    "ustluga2019_5",
    "ustluga2019_6",
    "ustluga2019",
    "utsw2012",
    "vanuatu",
    "vanuaturegate",
    "vascodagama2015",
    "vascodagama2016",
    "vascodagama2017",
    "vascodagama2018",
    "vicmaui2012",
    "vicmaui2012return",
    "vicmaui2014",
    "vicmaui2014return",
    "vicmaui2016_return",
    "vicmaui2016",
    "vicmaui2018",
    "vicmaui2018return",
    "volvo-vest-trbu",
    "volvolegends2018",
    "vri2018",
    "vuurschepen2011",
    "vuurschepen2012",
    "vuurschepen2013",
    "vuurschepen2014",
    "vuurschepen2015",
    "vuurschepen2016",
    "vuurschepen2017",
    "vuurschepen2018",
    "vuurschepen2019_1",
    "vuurschepen2019",
    "warc2010",
    "warc2012_1",
    "warc2012_2",
    "warc2012-l14",
    "warc2012-l14f",
    "warc2012-L15",
    "warc2012-l16",
    "warc2012-l4",
    "warc2012-l5",
    "warc2012-l6",
    "warc2012",
    "warc2012l1",
    "warc2012l10",
    "warc2012l11",
    "warc2012l12",
    "warc2012l2",
    "warc2012l3",
    "warc2012l7",
    "warc2012l7b",
    "warc2012l8",
    "warc2012l9",
    "warc2016_1",
    "warc2016",
    "warc2017_1",
    "warc2017",
    "warc2018_1",
    "warc2018",
    "warc2019_1",
    "warc2019_2",
    "warc2019",
    "warc2020",
    "warctest",
    "wateraid2010",
    "wateraid2011",
    "wateraid2012",
    "whitechocolate",
    "wicklow2014",
    "xcopa2014-frid17",
    "xcopa2014-sat",
    "xcopa2014-sat20",
    "xcopa2014-thu",
    "xcopa2014"]

     for(i in metadatas){
        var c = metadatas[i].base_url

     
        if(Array.isArray(c)){
            for(j in c){
                if((!codes.includes(c[j])) && c[j]!== undefined){
                    codes.push(c[j])
                   
                } 
            }
        }else{
            if((!codes.includes(c)) && c !== undefined){
                codes.push(c)
                
            }
        }
    }

    /// WE NOW HAVE A LIST OF CODES TO USE
    // TODO: make library to test lots of common patterns


    // TODO: visit yeach yb.tl/links/code and get list of all related races.
    // TODO: get leaderboard from yb.tl/links/code
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const existingRaceCodes = await YellowbrickRace.findAll({ attributes: ['race_code']})
    const race_codes = []
    existingRaceCodes.forEach(r =>{
        race_codes.push(r.race_code)
    })

    for(codeIndex in codes){
        try{
            var currentCode = codes[codeIndex]

            if(race_codes.includes(currentCode)){
                continue
            }
            var jsonUrl = 'http://yb.tl/JSON/'

            // Setup
            var setup = await axios.get(jsonUrl + currentCode + '/RaceSetup')
            
            
            if(setup.data.start > (new Date()).getTime()/1000 || setup.data.stop === null || setup.data.stop > (new Date()).getTime()/1000 || race_codes.includes(setup.data.url)){
                console.log("Race is in the future, or already saved so we'll skip it.")
                continue
            }

            var setupData = setup.data
            var tz = setupData.tz
            var lapz = setupData.lapz
            var laps = setupData.laps
            var trackWidth = setupData.trackWidth
            var motd = setupData.motd
            var associated2 = setupData.associated2
            var associated = setupData.associated
            var hashtag = setupData.hashtag
            var tzOffset = setupData.tzOffset
            var start = setupData.start
            var raceCode = setupData.url
            var title = setupData.title
            var flagStopped = setupData.flagStopped
            var superLines = setupData.superLines
            var raceNewId = uuidv4()
            var stop = setupData.stop

        
            var kml = await axios.get('http://yb.tl/'+ currentCode + '.kml')
            var txtLeaderboard = await axios.get('http://yb.tl/l/'+ currentCode)
        
            var distance = null
            if(setupData.course !== null && setupData.course !== undefined){
                distance = setupData.course.distance
            }
            var race = {
                id:raceNewId,
                tz:tz,
                tz_offset:tzOffset,
                lapz:JSON.stringify(lapz),
                laps:laps,
                track_width:trackWidth,
                motd:motd,
                associated2:JSON.stringify(associated2),
                associated:JSON.stringify(associated),
                hashtag:hashtag,
                start:start,
                stop: stop,
                race_code:raceCode,
                title:title,
                flag_stopped:flagStopped,
                super_lines:superLines,
                kml: kml.data,
                text_leaderboard: txtLeaderboard.data,
                distance: distance,
                url: 'http://yb.tl/' + raceCode
            }

            var pois = setupData.poi
            var pois_save = []
            for(poiIndex in pois.lines){
                var p = pois.lines[poiIndex]
                var poi = {
                    id: uuidv4(),
                    original_id: p.id,
                    race: raceNewId,
                    race_code: raceCode,
                    nodes: p.nodes,
                    polygon: p.polygon,
                    name:p.name
                }
                pois_save.push(poi)
            }
            var course_nodes = []
            if(setupData.course !== undefined){
                var course = setupData.course.nodes
            
            
                var order = 1
                course.forEach(n =>{
                    var node = {
                        id: uuidv4(),
                        name: n.name,
                        lon: n.lon,
                        lat: n.lat,
                        order: order,
                        race: raceNewId,
                        race_code: raceCode
                    }
                    order += 1
                    course_nodes.push(node)
                })
            
            }
            

            var tags = setupData.tags
            var tags_save = []
            var tagIds = {}
            for(tagIndex in tags){
                var t = tags[tagIndex]
                var tag = {
                    id: uuidv4(),
                    original_id: t.id,
                    race: raceNewId,
                    race_code: raceCode,
                    lb: t.lb,
                    handicap: t.handicap,
                    name: t.name,
                    start: t.start,
                    laps:t.laps,
                    sort: t.sort
                }
                tagIds[tag.original_id] = tag.id

                tags_save.push(tag)
            }


            var teams = setupData.teams
        
            var teams_save = []
            var teamIds = {}
            for(teamsIndex in teams){
                var t = teams[teamsIndex]
                
                var team = {
                    id: uuidv4(),
                    original_id: t.id,
                    race: raceNewId,
                    race_code: raceCode,
                    owner: t.owner,
                    country: t.country,
                    flag: t.flag,
                    sail: t.sail,
                    start: t.start,
                    tcf1: t.tcf1,
                    tcf2: t.tcf2,
                    tcf3: t.tcf3,
                    started: t.started,
                    finshed_at: t.finishedAt,
                    captain: t.captain,
                    url: t.url,
                    type: t.type,
                    tags: JSON.stringify(t.tags),
                    max_laps: t.maxLaps,
                    name: t.name,
                    model: t.model,
                    marker_text: t.markerText,
                    status: t.status,
                    explain: t.explain
                }
                teamIds[t.id] = team.id
                teams_save.push(team)
            }
        

            // Leaderboard
            var leaderboard = await axios.get(jsonUrl + currentCode + '/Leaderboard')
            var leaderboardData = leaderboard.data

            var leaderboardTeams = []
      
            for(leaderboardIndex in leaderboardData.tags) {
                var leaderboardTagObj = leaderboardData.tags[leaderboardIndex]
                var leader_teams = leaderboardTagObj.teams
                var tagId = leaderboardTagObj.id
                var type = leaderboardTagObj.type
                
      

                for(teamIndex in leader_teams){
                    var t = leader_teams[teamIndex]
                    var cElapsed = t.cElapsed
                    var old = t.old
                    var d24 = t.d24
                    var started = t.started
                    var finished = t.finished
                    var elapsed = t.elapsed
                    var cElapsedFormatted = t.cElapsedFormatted
                    var rankR = t.rankR
                    var rankS = t.rankS
                    var tcf = t.tcf
                    var dtf = t.dtf
                    var teamId = t.id
                    var finishAt = t.finishAt
                    var elapsedFormatted = t.elapsedFormatted
                    var dmg = t.dmg
                    var status = t.status
            
                    var leaderboard_team = {
                        id: uuidv4(),
                        tag: tagIds[tagId],
                        tag_original_id: tagId,
                        type: type,
                        c_elapsed:cElapsed,
                        old:old,
                        d24:d24,
                        started:started,
                        finished:finished,
                        elapsed:elapsed,
                        c_elapsed_formatted:cElapsedFormatted,
                        rank_r:rankR,
                        rank_s:rankS,
                        tcf:tcf,
                        dff:dtf,
                        team_original_id:teamId,
                        team: teamIds[teamId],
                        finished_at:finishAt,
                        elapsed_formatted:elapsedFormatted,
                        dmg:dmg,
                        status:status,
                        race: raceNewId,
                        race_code: raceCode
                    }
                    leaderboardTeams.push(leaderboard_team)
                }
            }
                
            var url =  "http://yb.tl/" + currentCode

            await page.goto(url, {waitUntil: "networkidle2", timeout: 300000});
    
            let loaded_test = "window.viewer.race != null && window.viewer.race.teams != null && window.viewer.race.teams.values().length > 0 &&  window.viewer.race.teams.values()[window.viewer.race.teams.values().length - 1].teamPositionsAvlTree != null"
            await page.waitForFunction(loaded_test, {timeout: 300000});
        
            var race_details = await page.evaluate(() => {
                let race = window.viewer.race
                let agedDelay = race.agedDelay
                let associatedRacesToLoad = race.associatedRacesToLoad
                let course = []
                let leaderboard = race.leaderboard
                let title = race.title
                if(race.course != undefined){
                    course = race.course
                }

                let flagLate = race.flagLate
                let flagStopped = race.flagStopped

                return { agedDelay, associatedRacesToLoad, course, flagLate, flagStopped, leaderboard, title}
            });
            
          
            var teams_details = await page.evaluate(() => {
                    let team_array = Array.from(window.viewer.race.teams.values());
                    let teams_info = team_array.map( team => {

                   
            
                        let moments = team.moments
                        let tree = team.teamPositionsAvlTree.getValues()
                        let id = team.id
                        return { id,  moments }

                });
                return teams_info;
            });

            // Positions for each team
            
            var all_moments_save = []
           
            if(teams_details !== undefined){
                

                teams_details.forEach(obj => {
                    var teamOriginalId = obj.id
                    var teamId = teamIds[teamOriginalId]
                    var raceId = raceNewId
                    if(obj.moments !== undefined){
                        obj.moments.forEach(m => {
                            m.id = uuidv4(),
                            m.team_original_id = teamOriginalId,
                            m.team = teamId,
                            m.race = raceId,
                            m.race_code = raceCode
                            m.timestamp = m.at
                        })

                        
        
                        all_moments_save = all_moments_save.concat(obj.moments)
                    }else{
                        console.log(raceCode)
                
                        console.log('no moments')
                    }
                  
               
                })
            }else{
                console.log(raceCode)
                console.log('no teams')
            }
            

            // // save all objects.
            var t = await sequelize.transaction()
            try{

                await Yellowbrick.YellowbrickRace.create(race, {fields: Object.keys(race)})
                //pois_save, course_nodes, tags_save, teams_save, leaderboardTeams, all_moments_save
                
                if(pois_save.length > 0){
                    await Yellowbrick.YellowbrickPoi.bulkCreate(pois_save, {fields: Object.keys(pois_save[0])})
                }

                if(course_nodes.length > 0){
                    await Yellowbrick.YellowbrickCourseNode.bulkCreate(course_nodes, {fields: Object.keys(course_nodes[0])})
                }
                
                if(tags_save.length > 0){
                    await Yellowbrick.YellowbrickTag.bulkCreate(tags_save, {fields: Object.keys(tags_save[0])})
                }

                if(teams_save.length > 0){
                    await Yellowbrick.YellowbrickTeam.bulkCreate(teams_save, {fields: Object.keys(teams_save[0])})
                }

                if(leaderboardTeams.length > 0){
                    await Yellowbrick.YellowbrickLeaderboardTeam.bulkCreate(leaderboardTeams, {fields: Object.keys(leaderboardTeams[0])})
                }

                if(all_moments_save.length > 0){
                    await Yellowbrick.YellowbrickPosition.bulkCreate(all_moments_save, {fields: Object.keys(all_moments_save[0])})
                }

                await t.commit()
                race_codes.push(raceCode)
                console.log('Finished scraping race.')
                function wait(ms){
                    var start = new Date().getTime();
                    var end = start;
                    while(end < start + ms) {
                      end = new Date().getTime();
                   }
                 }
                 wait(10000)
            }catch(err){
                await t.rollback()
                await Yellowbrick.YellowbrickFailedUrl.create({url: raceCode, error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
                console.log(err)
            }
        }catch(err){
            console.log(err)
            await Yellowbrick.YellowbrickFailedUrl.create({url: codes[codeIndex], error: err.toString(), id:uuidv4()}, {fields:['url', 'id', 'error']})
        }
    }

    page.close()
    browser.close()
    process.exit()
})();