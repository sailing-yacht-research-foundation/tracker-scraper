const {SAP, sequelize, connect} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');
var fs = require('fs');
const { execSync } = require('child_process');

const one_designs = ["https://data.orc.org/public/od/2016/d81.od.pdf",
"https://data.orc.org/public/od/2016/s850.od.pdf",
"https://data.orc.org/public/od/2016/este24.od.pdf",
"https://data.orc.org/public/od/2016/farr30.od.pdf",
"https://data.orc.org/public/od/2016/farr40.od.pdf",
"https://data.orc.org/public/od/2016/fun.od.pdf",
"https://data.orc.org/public/od/2016/h22.od.pdf",
"https://data.orc.org/public/od/2016/hboat.od.pdf",
"https://data.orc.org/public/od/2016/j24.od.pdf",
"https://data.orc.org/public/od/2016/j70.od.pdf",
"https://data.orc.org/public/od/2016/j80.od.pdf",
"https://data.orc.org/public/od/2016/melg24.od.pdf",
"https://data.orc.org/public/od/2016/melg32.od.pdf",
"https://data.orc.org/public/od/2016/meteor.od.pdf",
"https://data.orc.org/public/od/2016/platu25.od.pdf",
"https://data.orc.org/public/od/2016/prot750.od.pdf",
"https://data.orc.org/public/od/2016/lasb3.od.pdf",
"https://data.orc.org/public/od/2016/SEASC18.od.pdf",
"https://data.orc.org/public/od/2016/soling.od.pdf",
"https://data.orc.org/public/od/2016/sprinta.od.pdf",
"https://data.orc.org/public/od/2016/surprise.od.pdf",
"https://data.orc.org/public/od/2016/swan45.od.pdf",
"https://data.orc.org/public/od/2016/ufo22.od.pdf",
"https://data.orc.org/public/od/2016/x35.od.pdf",
"https://data.orc.org/public/od/2016/x41.od.pdf",
"https://data.orc.org/public/od/2016/x79.od.pdf",
"https://data.orc.org/public/od/2016/x99.od.pdf",
"https://data.orc.org/public/od/2017/11od.od.pdf",
"https://data.orc.org/public/od/2017/asso99.od.pdf",
"https://data.orc.org/public/od/2017/d81.od.pdf",
"https://data.orc.org/public/od/2017/s850.od.pdf",
"https://data.orc.org/public/od/2017/este24.od.pdf",
"https://data.orc.org/public/od/2017/farr30.od.pdf",
"https://data.orc.org/public/od/2017/farr40.od.pdf",
"https://data.orc.org/public/od/2017/fun.od.pdf",
"https://data.orc.org/public/od/2017/h22.od.pdf",
"https://data.orc.org/public/od/2017/hboat.od.pdf",
"https://data.orc.org/public/od/2017/j22.od.pdf",
"https://data.orc.org/public/od/2017/j24.od.pdf",
"https://data.orc.org/public/od/2017/j70.od.pdf",
"https://data.orc.org/public/od/2017/j80.od.pdf",
"https://data.orc.org/public/od/2017/melg24.od.pdf",
"https://data.orc.org/public/od/2017/melg32.od.pdf",
"https://data.orc.org/public/od/2017/meteor.od.pdf",
"https://data.orc.org/public/od/2017/platu25.od.pdf",
"https://data.orc.org/public/od/2017/prot750.od.pdf",
"https://data.orc.org/public/od/2017/lasb3.od.pdf",
"https://data.orc.org/public/od/2017/SEASC18.od.pdf",
"https://data.orc.org/public/od/2017/soling.od.pdf",
"https://data.orc.org/public/od/2017/sprinta.od.pdf",
"https://data.orc.org/public/od/2017/surprise.od.pdf",
"https://data.orc.org/public/od/2017/swan45.od.pdf",
"https://data.orc.org/public/od/2017/ufo22.od.pdf",
"https://data.orc.org/public/od/2017/x35.od.pdf",
"https://data.orc.org/public/od/2017/x41.od.pdf",
"https://data.orc.org/public/od/2017/x79.od.pdf",
"https://data.orc.org/public/od/2017/x99.od.pdf",
"https://data.orc.org/public/od/2018/11od.od.pdf",
"https://data.orc.org/public/od/2018/asso99.od.pdf",
"https://data.orc.org/public/od/2018/bone.od.pdf",
"https://data.orc.org/public/od/2018/cork1720.od.pdf",
"https://data.orc.org/public/od/2018/d81.od.pdf",
"https://data.orc.org/public/od/2018/s850.od.pdf",
"https://data.orc.org/public/od/2018/este24.od.pdf",
"https://data.orc.org/public/od/2018/etchell.od.pdf",
"https://data.orc.org/public/od/2018/fareast.od.pdf",
"https://data.orc.org/public/od/2018/farr30.od.pdf",
"https://data.orc.org/public/od/2018/fc8.od.pdf",
"https://data.orc.org/public/od/2018/fun.od.pdf",
"https://data.orc.org/public/od/2018/h22.od.pdf",
"https://data.orc.org/public/od/2018/hboat.od.pdf",
"https://data.orc.org/public/od/2018/j22.od.pdf",
"https://data.orc.org/public/od/2018/j24.od.pdf",
"https://data.orc.org/public/od/2018/j70.od.pdf",
"https://data.orc.org/public/od/2018/j80.od.pdf",
"https://data.orc.org/public/od/2018/melg20.od.pdf",
"https://data.orc.org/public/od/2018/melg24.od.pdf",
"https://data.orc.org/public/od/2018/melg32.od.pdf",
"https://data.orc.org/public/od/2018/meteor.od.pdf",
"https://data.orc.org/public/od/2018/mono22.od.pdf",
"https://data.orc.org/public/od/2018/platu25.od.pdf",
"https://data.orc.org/public/od/2018/prot750.od.pdf",
"https://data.orc.org/public/od/2018/lasb3.od.pdf",
"https://data.orc.org/public/od/2018/soling.od.pdf",
"https://data.orc.org/public/od/2018/sonar.od.pdf",
"https://data.orc.org/public/od/2018/sprinta.od.pdf",
"https://data.orc.org/public/od/2018/surprise.od.pdf",
"https://data.orc.org/public/od/2018/swan45.od.pdf",
"https://data.orc.org/public/od/2018/ufo.od.pdf",
"https://data.orc.org/public/od/2018/ufo22.od.pdf",
"https://data.orc.org/public/od/2018/x35.od.pdf",
"https://data.orc.org/public/od/2018/x79.od.pdf",
"https://data.orc.org/public/od/2019/11od.od.pdf",
"https://data.orc.org/public/od/2019/asso99.od.pdf",
"https://data.orc.org/public/od/2019/Blu26.od.pdf",
"https://data.orc.org/public/od/2019/bone.od.pdf",
"https://data.orc.org/public/od/2019/CLUBSWAN50.od.pdf",
"https://data.orc.org/public/od/2019/cork1720.od.pdf",
"https://data.orc.org/public/od/2019/Dynamic35.od.pdf",
"https://data.orc.org/public/od/2019/S750.od.pdf",
"https://data.orc.org/public/od/2019/s850.od.pdf",
"https://data.orc.org/public/od/2019/este24.od.pdf",
"https://data.orc.org/public/od/2019/etchell.od.pdf",
"https://data.orc.org/public/od/2019/fareast.od.pdf",
"https://data.orc.org/public/od/2019/farr30.od.pdf",
"https://data.orc.org/public/od/2019/farr40.od.pdf",
"https://data.orc.org/public/od/2019/fc8.od.pdf",
"https://data.orc.org/public/od/2019/fun.od.pdf",
"https://data.orc.org/public/od/2019/h22.od.pdf",
"https://data.orc.org/public/od/2019/hboat.od.pdf",
"https://data.orc.org/public/od/2019/j22.od.pdf",
"https://data.orc.org/public/od/2019/j24.od.pdf",
"https://data.orc.org/public/od/2019/j70.od.pdf",
"https://data.orc.org/public/od/2019/j80.od.pdf",
"https://data.orc.org/public/od/2019/M2.od.pdf",
"https://data.orc.org/public/od/2019/M750.od.pdf",
"https://data.orc.org/public/od/2019/melg20.od.pdf",
"https://data.orc.org/public/od/2019/melg24.od.pdf",
"https://data.orc.org/public/od/2019/melg32.od.pdf",
"https://data.orc.org/public/od/2019/meteor.od.pdf",
"https://data.orc.org/public/od/2019/mono22.od.pdf",
"https://data.orc.org/public/od/2019/platu25.od.pdf",
"https://data.orc.org/public/od/2019/prot750.od.pdf",
"https://data.orc.org/public/od/2019/lasb3.od.pdf",
"https://data.orc.org/public/od/2019/SEASC18.od.pdf",
"https://data.orc.org/public/od/2019/soling.od.pdf",
"https://data.orc.org/public/od/2019/sonar.od.pdf",
"https://data.orc.org/public/od/2019/sprinta.od.pdf",
"https://data.orc.org/public/od/2019/surprise.od.pdf",
"https://data.orc.org/public/od/2019/swan45.od.pdf",
"https://data.orc.org/public/od/2019/ufo.od.pdf",
"https://data.orc.org/public/od/2019/ufo22.od.pdf",
"https://data.orc.org/public/od/2019/Ultimate20.od.pdf",
"https://data.orc.org/public/od/2019/x35.od.pdf",
"https://data.orc.org/public/od/2019/x41.od.pdf",
"https://data.orc.org/public/od/2019/x79.od.pdf",
"https://data.orc.org/public/od/2019/x99.od.pdf",
"https://data.orc.org/public/od/2020/11od.od.pdf",
"https://data.orc.org/public/od/2020/asso99.od.pdf",
"https://data.orc.org/public/od/2020/Blu26.od.pdf",
"https://data.orc.org/public/od/2020/CLUBSWAN50.od.pdf",
"https://data.orc.org/public/od/2020/cork1720.od.pdf",
"https://data.orc.org/public/od/2020/Dynamic35.od.pdf",
"https://data.orc.org/public/od/2020/S750.od.pdf",
"https://data.orc.org/public/od/2020/s850.od.pdf",
"https://data.orc.org/public/od/2020/este24.od.pdf",
"https://data.orc.org/public/od/2020/etchell.od.pdf",
"https://data.orc.org/public/od/2020/fareast.od.pdf",
"https://data.orc.org/public/od/2020/farr30.od.pdf",
"https://data.orc.org/public/od/2020/farr40.od.pdf",
"https://data.orc.org/public/od/2020/fc8.od.pdf",
"https://data.orc.org/public/od/2020/fun.od.pdf",
"https://data.orc.org/public/od/2020/h22.od.pdf",
"https://data.orc.org/public/od/2020/hboat.od.pdf",
"https://data.orc.org/public/od/2020/j22.od.pdf",
"https://data.orc.org/public/od/2020/j24.od.pdf",
"https://data.orc.org/public/od/2020/j70.od.pdf",
"https://data.orc.org/public/od/2020/j80.od.pdf",
"https://data.orc.org/public/od/2020/longtze.od.pdf",
"https://data.orc.org/public/od/2020/M2.od.pdf",
"https://data.orc.org/public/od/2020/M750.od.pdf",
"https://data.orc.org/public/od/2020/melg20.od.pdf",
"https://data.orc.org/public/od/2020/melg24.od.pdf",
"https://data.orc.org/public/od/2020/melg32.od.pdf",
"https://data.orc.org/public/od/2020/ic37.od.pdf",
"https://data.orc.org/public/od/2020/meteor.od.pdf",
"https://data.orc.org/public/od/2020/mono22.od.pdf",
"https://data.orc.org/public/od/2020/platu25.od.pdf",
"https://data.orc.org/public/od/2020/prot750.od.pdf",
"https://data.orc.org/public/od/2020/lasb3.od.pdf",
"https://data.orc.org/public/od/2020/SEASC18.od.pdf",
"https://data.orc.org/public/od/2020/soling.od.pdf",
"https://data.orc.org/public/od/2020/sonar.od.pdf",
"https://data.orc.org/public/od/2020/sprinta.od.pdf",
"https://data.orc.org/public/od/2020/surprise.od.pdf",
"https://data.orc.org/public/od/2020/swan42club.od.pdf",
"https://data.orc.org/public/od/2020/swan45.od.pdf",
"https://data.orc.org/public/od/2020/ufo22.od.pdf",
"https://data.orc.org/public/od/2020/Ultimate20.od.pdf",
"https://data.orc.org/public/od/2020/x35.od.pdf",
"https://data.orc.org/public/od/2020/x41.od.pdf",
"https://data.orc.org/public/od/2020/x79.od.pdf",
"https://data.orc.org/public/od/2020/x99.od.pdf"];

( async ()=>{
    const url = 'https://data.orc.org/public/WPub.dll/CC/'


   // Get one designs:
   let count = 0
   while(count < one_designs.length){
     let pdf_url = one_designs[count]
     let year = pdf_url.split('/od/')[1].split('/')[0]
     let pdf_name = year.toString() + '_' + pdf_url.split('/od/')[1].split('/')[1].replace('.od.', '.')
     let command = 'curl ' + pdf_url + ' --output one_design_pdfs/' + pdf_name
     console.log(pdf_name)
      execSync(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
     count++
   }



    // let count = 134164
    // while(count >  0){

       
    //     // let currentUrl = url + count.toString() + '.pdf'
    //     // let    command = 'curl ' + currentUrl + ' --output orc_cert_pdfs/' + count.toString() + '.pdf'

    //     // execSync(command, (error, stdout, stderr) => {
    //     //     if (error) {
    //     //         console.log(`error: ${error.message}`);
    //     //         return;
    //     //     }
    //     //     if (stderr) {
    //     //         console.log(`stderr: ${stderr}`);
    //     //         return;
    //     //     }
    //     //     console.log(`stdout: ${stdout}`);
    //     // });
        
    //     count--
    
    // }
    process.exit()

})();

