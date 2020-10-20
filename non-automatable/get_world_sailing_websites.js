const puppeteer = require('puppeteer');

const memberSites = ["https://www.sailing.org/about/members/mnas/algeria.php",
"https://www.sailing.org/about/members/mnas/angola.php",
"https://www.sailing.org/about/members/mnas/botswana.php",
"https://www.sailing.org/about/members/mnas/djibouti.php",
"https://www.sailing.org/about/members/mnas/egypt.php",
"https://www.sailing.org/about/members/mnas/kenya.php",
"https://www.sailing.org/about/members/mnas/libyan.php",
"https://www.sailing.org/about/members/mnas/madagascar.php",
"https://www.sailing.org/about/members/mnas/mauritius.php",
"https://www.sailing.org/about/members/mnas/morocco.php",
"https://www.sailing.org/about/members/mnas/mozambique.php",
"https://www.sailing.org/about/members/mnas/namibia.php",
"https://www.sailing.org/about/members/mnas/nigeria.php",
"https://www.sailing.org/about/members/mnas/senegal.php",
"https://www.sailing.org/about/members/mnas/seychelles.php",
"https://www.sailing.org/about/members/mnas/south-africa.php",
"https://www.sailing.org/about/members/mnas/sudan.php",
"https://www.sailing.org/about/members/mnas/tanzania.php",
"https://www.sailing.org/about/members/mnas/tunisia.php",
"https://www.sailing.org/about/members/mnas/uganda.php",
"https://www.sailing.org/about/members/mnas/zimbabwe.php",
"https://www.sailing.org/about/members/mnas/azerbaijan.php",
"https://www.sailing.org/about/members/mnas/bahrain.php",
"https://www.sailing.org/about/members/mnas/china.php",
"https://www.sailing.org/about/members/mnas/chinese-taipei.php",
"https://www.sailing.org/about/members/mnas/hong-kong.php",
"https://www.sailing.org/about/members/mnas/india.php",
"https://www.sailing.org/about/members/mnas/indonesia.php",
"https://www.sailing.org/about/members/mnas/iran.php",
"https://www.sailing.org/about/members/mnas/japan.php",
"https://www.sailing.org/about/members/mnas/kazakhstan.php",
"https://www.sailing.org/about/members/mnas/korea.php",
"https://www.sailing.org/about/members/mnas/korea-dpr.php",
"https://www.sailing.org/about/members/mnas/kuwait.php",
"https://www.sailing.org/about/members/mnas/kyrgyzstan.php",
"https://www.sailing.org/about/members/mnas/lebanon.php",
"https://www.sailing.org/about/members/mnas/malaysia.php",
"https://www.sailing.org/about/members/mnas/myanmar.php",
"https://www.sailing.org/about/members/mnas/oman.php",
"https://www.sailing.org/about/members/mnas/pakistan.php",
"https://www.sailing.org/about/members/mnas/palestine.php",
"https://www.sailing.org/about/members/mnas/philippines.php",
"https://www.sailing.org/about/members/mnas/qatar.php",
"https://www.sailing.org/about/members/mnas/saudi_arabia.php",
"https://www.sailing.org/about/members/mnas/singapore.php",
"https://www.sailing.org/about/members/mnas/sri-lanka.php",
"https://www.sailing.org/about/members/mnas/thailand.php",
"https://www.sailing.org/about/members/mnas/uae.php",
"https://www.sailing.org/about/members/mnas/vietnam.php",
"https://www.sailing.org/about/members/mnas/andorra.php",
"https://www.sailing.org/about/members/mnas/armenia.php",
"https://www.sailing.org/about/members/mnas/austria.php",
"https://www.sailing.org/about/members/mnas/belarus.php",
"https://www.sailing.org/about/members/mnas/belgium.php",
"https://www.sailing.org/about/members/mnas/bulgaria.php",
"https://www.sailing.org/about/members/mnas/croatia.php",
"https://www.sailing.org/about/members/mnas/cyprus.php",
"https://www.sailing.org/about/members/mnas/czech-republic.php",
"https://www.sailing.org/about/members/mnas/denmark.php",
"https://www.sailing.org/about/members/mnas/estonia.php",
"https://www.sailing.org/about/members/mnas/finland.php",
"https://www.sailing.org/about/members/mnas/france.php",
"https://www.sailing.org/about/members/mnas/macedonia.php",
"https://www.sailing.org/about/members/mnas/georgia.php",
"https://www.sailing.org/about/members/mnas/germany.php",
"https://www.sailing.org/about/members/mnas/great-britain.php",
"https://www.sailing.org/about/members/mnas/greece.php",
"https://www.sailing.org/about/members/mnas/hungary.php",
"https://www.sailing.org/about/members/mnas/iceland.php",
"https://www.sailing.org/about/members/mnas/ireland.php",
"https://www.sailing.org/about/members/mnas/israel.php",
"https://www.sailing.org/about/members/mnas/italy.php",
"https://www.sailing.org/about/members/mnas/kosovo.php",
"https://www.sailing.org/about/members/mnas/latvia.php",
"https://www.sailing.org/about/members/mnas/liechtenstein.php",
"https://www.sailing.org/about/members/mnas/lithuania.php",
"https://www.sailing.org/about/members/mnas/luxembourg.php",
"https://www.sailing.org/about/members/mnas/malta.php",
"https://www.sailing.org/about/members/mnas/moldova.php",
"https://www.sailing.org/about/members/mnas/monaco.php",
"https://www.sailing.org/about/members/mnas/montenegro.php",
"https://www.sailing.org/about/members/mnas/netherlands.php",
"https://www.sailing.org/about/members/mnas/norway.php",
"https://www.sailing.org/about/members/mnas/poland.php",
"https://www.sailing.org/about/members/mnas/portugal.php",
"https://www.sailing.org/about/members/mnas/romania.php",
"https://www.sailing.org/about/members/mnas/russia.php",
"https://www.sailing.org/about/members/mnas/san-marino.php",
"https://www.sailing.org/about/members/mnas/serbia.php",
"https://www.sailing.org/about/members/mnas/slovakia.php",
"https://www.sailing.org/about/members/mnas/slovenia.php",
"https://www.sailing.org/about/members/mnas/spain.php",
"https://www.sailing.org/about/members/mnas/sweden.php",
"https://www.sailing.org/about/members/mnas/switzerland.php",
"https://www.sailing.org/about/members/mnas/turkey.php",
"https://www.sailing.org/about/members/mnas/ukraine.php",
"https://www.sailing.org/about/members/mnas/antigua.php",
"https://www.sailing.org/about/members/mnas/aruba.php",
"https://www.sailing.org/about/members/mnas/bahamas.php",
"https://www.sailing.org/about/members/mnas/barbados.php",
"https://www.sailing.org/about/members/mnas/bermuda.php",
"https://www.sailing.org/about/members/mnas/british-virgin-islands.php",
"https://www.sailing.org/about/members/mnas/canada.php",
"https://www.sailing.org/about/members/mnas/cayman-islands.php",
"https://www.sailing.org/about/members/mnas/cuba.php",
"https://www.sailing.org/about/members/mnas/dominican-republic.php",
"https://www.sailing.org/about/members/mnas/el-salvador.php",
"https://www.sailing.org/about/members/mnas/grenada.php",
"https://www.sailing.org/about/members/mnas/guatemala.php",
"https://www.sailing.org/about/members/mnas/jamaica.php",
"https://www.sailing.org/about/members/mnas/netherlands-antilles.php",
"https://www.sailing.org/about/members/mnas/puerto-rico.php",
"https://www.sailing.org/about/members/mnas/st-kitts-and-nevis.php",
"https://www.sailing.org/about/members/mnas/st-lucia.php",
"https://www.sailing.org/about/members/mnas/trinidad-and-tobago.php",
"https://www.sailing.org/about/members/mnas/us-virgin-islands.php",
"https://www.sailing.org/about/members/mnas/usa.php",
"https://www.sailing.org/about/members/mnas/argentina.php",
"https://www.sailing.org/about/members/mnas/belize.php",
"https://www.sailing.org/about/members/mnas/brazil.php",
"https://www.sailing.org/about/members/mnas/chile.php",
"https://www.sailing.org/about/members/mnas/colombia.php",
"https://www.sailing.org/about/members/mnas/ecuador.php",
"https://www.sailing.org/about/members/mnas/mexico.php",
"https://www.sailing.org/about/members/mnas/panama.php",
"https://www.sailing.org/about/members/mnas/paraguay.php",
"https://www.sailing.org/about/members/mnas/peru.php",
"https://www.sailing.org/about/members/mnas/uruguay.php",
"https://www.sailing.org/about/members/mnas/venezuela.php",
"https://www.sailing.org/about/members/mnas/american-samoa.php",
"https://www.sailing.org/about/members/mnas/australia.php",
"https://www.sailing.org/about/members/mnas/cook-islands.php",
"https://www.sailing.org/about/members/mnas/fiji.php",
"https://www.sailing.org/about/members/mnas/guam.php",
"https://www.sailing.org/about/members/mnas/new-zealand.php",
"https://www.sailing.org/about/members/mnas/papua-new-guinea.php",
"https://www.sailing.org/about/members/mnas/samoa.php",
"https://www.sailing.org/about/members/mnas/solomon-islands.php",
"https://www.sailing.org/about/members/mnas/tahiti.php",
"https://www.sailing.org/about/members/mnas/vanuatu.php"];

( async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var data = {}
 

    for(siteIndex in memberSites){
        var url = memberSites[siteIndex]
        await page.goto(url, {timeout: 0, waitUntil: "networkidle0"})

        try{
            var content = {
                country:"",
                email: "",
                website: ""
            }
            var country = await page.evaluate(() => {
                return document.querySelector('#skiptomain > div.basecolumn1a > div > div.headline').textContent
            })
            content.country = country
            data[country] = content
            var email = await page.evaluate(() => {
                return document.querySelector('#skiptomain > div.basecolumn1a > div > div.mna_info > div > div > table > tbody > tr > td > table > tbody > tr > td > a').textContent
            })
            content.email = email
           
            var website = await page.evaluate(() => {
                return document.querySelectorAll('#skiptomain > div.basecolumn1a > div > div.mna_info > div > div > table > tbody > tr > td > table > tbody > tr > td > a')[1].href
            })
            content.website = website
       
        }catch(err){
            console.log(url)
            console.log('Error')
            console.log(err.toString())
        }
    }
    
    console.log(data)


    page.close()
    browser.close()
    process.exit()
})();