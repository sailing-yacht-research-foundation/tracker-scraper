const {SAP, getExistingSAPData, sequelize, connect, keyInDictionary} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');

( async ()=> {
    connect()
    const browser = await puppeteer.launch({args: [
        '--proxy-server=127.0.0.1:8888', // Or whatever the address is 
    ]})
    const page = await browser.newPage();
    await page.setCacheEnabled(false)

var domains = [
"49ereuros2015.sapsailing.com",
"505worlds2015.sapsailing.com",
"505worlds2016.sapsailing.com",
"8mworlds2017.sapsailing.com",
"acceptatie.sapsailing.com",
"allsvenskan2015.sapsailing.com",
"archive.sapsailing.com",
"austrianleague2015.sapsailing.com",
"austrianleague2016.sapsailing.com",
"backup.sapsailing.com",
"backups.sapsailing.com",
"barracuda.sapsailing.com",
"bundesliga2-2014.sapsailing.com",
"bundesliga2-2015.sapsailing.com",
"bundesliga2-2016.sapsailing.com",
"bundesliga2-2017.sapsailing.com",
"bundesliga2014.sapsailing.com",
"bundesliga2015.sapsailing.com",
"bundesliga2016.sapsailing.com",
"bundesliga2017.sapsailing.com",
"bundesliga2018.sapsailing.com",
"bundesliga2019.sapsailing.com",
"crw2016.sapsailing.com",
"dsl-pokal2017.sapsailing.com",
"dutchleague2017.sapsailing.com",
"dutchleague2018.sapsailing.com",
"e.sapsailing.com",
"ess2016.sapsailing.com",
"ess2017.sapsailing.com",
"ess40-2012.sapsailing.com",
"finnishleague2017.sapsailing.com",
"hwcs2020-round1.sapsailing.com",
"kielerwoche2013.sapsailing.com",
"kielerwoche2016.sapsailing.com",
"kw2017.sapsailing.com",
"kw2019.sapsailing.com",
"norwegianleague2016.sapsailing.com",
"norwegianleague2017.sapsailing.com",
"scl2016.sapsailing.com",
"scl2017.sapsailing.com",
"scl2018-final.sapsailing.com",
"scl2019-qualifier1.sapsailing.com",
"swc2016-melbourne.sapsailing.com",
"swc2016-qingdao.sapsailing.com",
"swc2017-hyeres.sapsailing.com",
"swc2017-miami.sapsailing.com",
"swc2017-santander.sapsailing.com",
"swedishleague2016.sapsailing.com",
"swedishleague2018.sapsailing.com",
"thetis2018.sapsailing.com",
"tw2015.sapsailing.com",
"tw2016.sapsailing.com",
"tw2017.sapsailing.com",
"tw2018.sapsailing.com",
"wcs2018-gamagori.sapsailing.com",
"wcs2018-hyeres.sapsailing.com",
"wcs2018-marseille.sapsailing.com",
"wcs2018-miami.sapsailing.com",
"wcs2019-enoshima.sapsailing.com",
"wcs2019-miami.sapsailing.com",
"wmrt2016.sapsailing.com",
"worlds2018.sapsailing.com",
"byc.sapsailing.com",
"hwcs2020-round1.sapsailing.com",
"49ereuros2020.sapsailing.com",
"hwcs2020-round2.sapsailing.com",
"swedishleague2020.sapsailing.com",
"austrianleague2020.sapsailing.com",
"49erworlds2020.sapsailing.com",
"bundesliga2020.sapsailing.com",
"hwcs2020-round1.sapsailing.com",
"49erworlds2020.sapsailing.com",
"polishleague2020.sapsailing.com",
"sapsailing.com"

]
//"my.sapsailing.com"
var savedEmails = {}
for(domainIndex in domains){
    let domain = 'https://' + domains[domainIndex]
    let haveLeaderboards = false;
    try{
        // /api/v1/leaderboards
        var leaderboardsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboards')
        // /api/v1/leaderboardgroups
        var leaderboardGroupsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboardgroups')

        var leaderboardNames = leaderboardsRequest.data
        var leaderboardGroupNames = leaderboardGroupsRequest.data
        haveLeaderboards = true
    }catch(err){
        console.log(err)
        console.log('Error getting leaderboards on domain ' + domain)
    }

    if(haveLeaderboards){
        console.log('Getting leaderboard group details.')
        for(leaderboardGroupIndex in leaderboardGroupNames){
            try{
                console.log('Getting leaderboard ' + leaderboardGroupIndex)
                let leaderboardGroupName = leaderboardGroupNames[leaderboardGroupIndex]
                let leaderboardGroupDetailsRequest = await axios.get(domain + '/sailingserver/api/v1/leaderboardgroups/' + encodeURI(leaderboardGroupName))
                
                let boards = leaderboardGroupDetailsRequest.data.leaderboards
                let raceUrls = []
          
                boards.forEach(l => {
                    l.series.forEach(s => {
                        if(s.fleets){
                            s.fleets.forEach(f => {
                                if(f.races){
                                    f.races.forEach(r => {
                                        if(r.isTracked){
                                            leaderboardGroupDetailsRequest.data.events.forEach(event => {
                                                let url = domain + '/gwt/RaceBoard.html?regattaName=' + encodeURI(l.regattaName) + '&raceName=' + encodeURI(r.trackedRaceName) + '&leaderboardName=' + encodeURI(l.name) + '&leaderboardGroupId=' + leaderboardGroupDetailsRequest.data.id + '&eventId=' + event + '&mode=PLAYER'
                                                raceUrls.push(url)
                                            })
                                            
                                        }
                                    })
                                }
                            })
                        }
                    })
                    
                })

                for(raceUrlIndex in raceUrls){
                    let url = raceUrls[raceUrlIndex]
                    console.log("Going to page " +  url)
                    try{
                        await page.goto(url, {waitUntil: 'networkidle2'  });
                        await page.waitForFunction(() => '$strongName' in window);
                        let gwtPermutation = await page.evaluate(() => {
                            return $strongName
                        })

                        if( gwtPermutation !== '299CDFFC884356383E8A472ADF50791C'){
                            console.log('New permutation!')

                           // SAP.GWTPermutationError.create({id: uuidv4(), permutation: gwtPermutation, race_url: url}, {fields:['id','permutation', 'race_url']});
                        }else{
                            await page.waitForFunction(() => 'emails' in window);
                            await page.waitForFunction(() => typeof emails === 'object');
                            await page.waitForFunction(() => Object.keys(emails).length > 0);
                            var loadedTest = "emails !== null && emails !== undefined && Object.keys(emails).length > 0"
                            await page.waitForFunction(loadedTest, {timeout: 30000});
                            var emails = await page.evaluate(()=>{
                                return window.emails
                            })
                            if(emails && Object.keys(emails).length > 0){
                                let keys = Object.keys(emails)
                                keys.forEach(k => {
                                    let email = k
                                    let country = null
                                    let identifier1 = null
                                    let identifier2 = null
                                    let important1 = null
                                    let important2 = null
                                    let important3 = null
                                    let unknown1 = null
                                    if(emails[k].a.a){
                                        important1 = emails[k].a.a.a.a
                                        important2 = emails[k].a.a.b.a
                                        important3 = emails[k].a.a.U
                                    }
                                    
                                    identifier2 = emails[k].a.c
                                    unknown1 = emails[k].a.U
                                    country = emails[k].c
                                    email = emails[k].d
                                    identifier1 = emails[k].f
                                    if(savedEmails[email] === null || savedEmails[email] === undefined){
                                        console.log(email)
                                        SAP.Sailor.create({
                                            id:uuidv4(),
                                            email: email,
                                            race_url:url
                                        }, {fields:['id','email','race_url']})
                                        savedEmails[email] = email
                                    }
                                })
                            }else{
                                console.log('ERROR NO EMAILS FOR ' + url)
                            }
                        }
                        
                    }catch(err){
                        console.log(err)
                        console.log('Failed to get emails. Does this tracker use the same permutation of GWT?')
                    }
                    

                }
            }catch(err){
                //TODO handle this.
                console.log(err)
            }
        }


    }

}

page.close()
browser.close()
process.exit()

})();