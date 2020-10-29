const {SAP, sequelize, connect} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');
var fs = require('fs');
const { execSync } = require('child_process');

const urls = [
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=ESP&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=ITA&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=NED&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=NOR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=FIN&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=GRE&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=GER&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=FRA&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=USA&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=AUS&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=EST&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=SUI&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=RSA&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=CRO&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=TUR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=ARG&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=POL&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=BUL&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=RUS&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=POR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=LTU&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=ISR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=UKR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=KOR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=JPN&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=AUT&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=ROU&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=HUN&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=BRA&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=ECU&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=SLO&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=CAN&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=CYP&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=GBR&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=SWE&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=MLT&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=MRI&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=LAT&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=DEN&ext=json&Family=1&VPPYear=2020",
"https://data.orc.org/public/WPub.dll/WPub.dll?action=DownRMS&CountryId=HKG&ext=json&Family=1&VPPYear=2020"];


// 'ANG',
// 'ARG',
// 'AUS',
// 'BRA',
// 'BUL',
// 'CAN',
//     'CHI',
//     'CHN',
//     'CRO',
//     'CYP',
//     'DEN',
//     'ECU',
//     'EST',
const countries = [
    'FIN',
    'FRA',
    'GER',
    'GBR',
    'GRE',
    'HKG',
    'HUN',
    'IRL',
    'ISR',
    'ITA',
    'JPN',
    'KOR',
    'LAT',
    'LIB',
    'LTU',
    'MLT',
    'MRI',
    'MNE',
    'NED',
    'AHO',
    'NLS',
    'NZL',
    'NOR',
    'ORC',
    'PER',
    'POL',
    'POR',
    'ROU',
    'RUS',
    'SLO',
    'RSA',
    'ESP',
    'SWE',
    'SUI',
    'TUR',
    'UKR',
    'USA'
];

( async ()=>{
    // for(urlIndex in urls){
    //     var url = urls[urlIndex]
    //     var year = 2020
    //     while(year > 2019){
    //         var family1Url = url.replace('Year=2020', 'Year=' + year.toString())
    //         var family2Url = family1Url.replace('Family=1', 'Family=2')
    //         var family3Url = family1Url.replace('Family=1', 'Family=3')
    //         var country = family1Url.match(/CountryId=([A-Z][A-Z][A-Z])&ext/)[1]
    
    //         var f1 = await axios.get(family1Url)
    //         var f2 = await axios.get(family2Url)
    //         var f3 = await axios.get(family3Url)

    //         fs.writeFileSync('orc/' + country + '_' + year.toString() + '.json', JSON.stringify(f1.data))
    //         fs.writeFileSync('dh/' + country + '_' + year.toString() + '.json', JSON.stringify(f2.data))
    //         fs.writeFileSync('f3/' + country + '_' + year.toString() + '.json', JSON.stringify(f3.data))
            
    //         year -= 1
    //     }
    // }
    
    for(countryIndex in countries){
        let country = countries[countryIndex]
        console.log('New country: ' + country)
        let year = 2020
        
        while(year > 2003){
            console.log('New year ' + year.toString())
            let referenceCodes = []
            let dxtIds = []
            var site = await axios({
                method: 'post',
                url: 'https://data.orc.org/public/WPub.dll',
                headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "pragma": "no-cache",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "upgrade-insecure-requests": "1",
                "cookie": "Fullname=jon; EMail=jweisbaum89@gmail.com; sessionid=6678387C2B075A7544100147; _ga=GA1.2.181887193.1599419809; _gid=GA1.2.1567126259.1603390371; G_ENABLED_IDPS=google" },
                data: "action=ListCert&xslp=ListCert.php&CountryId=" + country + "&VPPYear=" + year.toString() + "&RefNo=&YachtName=&SailNo=&Class="
            })

            //   fs.writeFileSync('orc_search_results/' + country + '_' + year + '.xml', site.data)

            var matches = site.data.match(/\<RefNo>([A-Z0-9]*)<\/RefNo\>/g)
            if(matches !== null){
                matches.forEach(s => {
                    let temp = s.replace('<RefNo>', '').replace('</RefNo>', '')
                    referenceCodes.push(temp)
                })
            }


            var dxtMatches = site.data.match(/\<dxtID>([A-Z0-9]*)<\/dxtID\>/g)
            if(dxtMatches !== null){
                dxtMatches.forEach(s => {
                    let temp = s.replace('<dxtID>', '').replace('</dxtID>', '')
                    dxtIds.push(temp)
                })
            }
            console.log('Associating all dxt codes.')
            for(dxtIndex in dxtIds){
                let dxt = dxtIds[dxtIndex]
                var site = await axios({
                    method: 'get',
                    url: 'https://data.orc.org/public/WPub.dll?action=SaveCert&dxtID=' + dxt,
                    headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/x-www-form-urlencoded",
                    "pragma": "no-cache",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-origin",
                    "upgrade-insecure-requests": "1",
                    "cookie": "Fullname=jon; EMail=jweisbaum89@gmail.com; sessionid=6678387C2B075A7544100147; _ga=GA1.2.181887193.1599419809; _gid=GA1.2.1567126259.1603390371; G_ENABLED_IDPS=google" },
          
                })
            }
  
            // for(codeIndex in referenceCodes){
            //     let code = referenceCodes[codeIndex]
            //     let url = 'http://data.orc.org/public/WPub.dll?action=DownBoatRMS&RefNo='
            //     let  command = 'curl "' + url + code + '&ext=json" --output all_orc_polars_ever/' + code + '.json'
        
            //     execSync(command, (error, stdout, stderr) => {
            //         if (error) {
            //             console.log(`error: ${error.message}`);
            //             return;
            //         }
            //         if (stderr) {
            //             console.log(`stderr: ${stderr}`);
            //             return;
            //         }
            //         console.log(`stdout: ${stdout}`);
            //     });
            // }
           
            year--
        }
    }

    
   

    process.exit()

})();


