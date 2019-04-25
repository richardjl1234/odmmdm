// step 1, run the fdr query to get the list of fdrs
// step 2, for each feeder, prepare the sql for each properties, and run sql to get the result from database. process_feeder()
// setp 3, for the result, need to process it and come up with the json format data , curried_process_result, every sub type result will be written into file
// step 4. handle the utf8 string to string
// step 5, remove the duplicates form the objects
// step 6 write the result to the file in the result/final folder

var lodash = require('lodash'); 
var common_func=require('./common_func') ; 
var _=require('ramda'); // make use of currying and compaose 
var http = require('http');
var url = require('url') ; 
var fs = require('fs'); 
require('dotenv').load(); // load the environment variables. 
var request = require('request');
var fs = require("fs-extra");
var ibmdb = require('ibm_db');
var async = require('async'); 
var traverse = require('traverse'); 

//initialize the sql file and put them into varialbes 
var feederAsyncs = []; 
var curried_merge_result = []; 

fdr_sql = fs.readFileSync('read_fdr.sql', 'utf8') ; 
common_func.queryODM(fdr_sql)
   .then(function(result){
      feeders= result.map(item=>item.CFDRSRC ); 
      console.log(feeders) ; 
      feederAsyncs = feeders.map(feeder =>  process_feeder(feeder) ); 
      curried_merge_result = feeders.map(feeder=>merge_result(feeder) ); 
      // run the feederAsyncs procedures
      async.series(feederAsyncs , 
         function(err, results){ 
            console.log('\n\n******************' ) ; 
            console.log(results);
            //console.log("wait for 1s to make sure all files writting is completed!"); 
            //setTimeout( function() {async.series(curried_merge_result , function(err, rsts){ console.log(rsts); });}, 100); 
            async.series(curried_merge_result , function(err, rsts){ console.log(rsts); });
         }); 
      // this async is the main part
   } )
   .catch(function(err) {console.log(err)});


// define the functions from the curried base function. 
var process_feeder = _.curry(function(feeder, cb)
   {
      console.log("** Start processing feeder:" + feeder) ; 
      condition =  `where E01.CFDRSRC = '${feeder}' `;   
      //condition = condition + " AND e01.RCNUM IN ('000941724', '000519724', '943511672') ;  ";  
      //console.log(condition) ; 
      var sqls=[]; 
      var keys = ['names', 'emails', 'addrs', 'tels', 'ids']; 

      keys.map((key)=>{
         str = fs.readFileSync('read_'+key+'.sql', 'utf8') ; 
         sqls[key] = str.replace(/-- condition/g, condition ) + ' ;' ; 
         //console.log(sqls[key]) ; 
      });  

      async.map(keys, function(key, callback) {
         common_func.queryODM(sqls[key])
            .then(function(result) { curried_process_result[key](feeder, result); callback(null, key); })
            .catch(function(err) { callback(err); }); 
      }, function(err,results) { console.log(`*** feeder ${feeder} is processed: ${results}`); var x={}; x[feeder] = results; cb(null, x) });
      // cb is the the function need to be passed to process_feeder, and the assync which call this function will tell how to process the result. 
   
   }); 


// use currying to create a group of functions
var process_result = _.curry(function(sub_type, sub_types, fdr, result) {
   var  results= result.map(function(item) {
      id = item.RCNUM; 
      delete item.RCNUM; 
      sub_result = {}; 
      sub_result.RCNUM = id;  
      sub_result[sub_type] = item; 
      return sub_result; 
   }); 
   //      fs.writeFile('result_'+sub_type+'.json', JSON.stringify(results) , 'utf8', ()=>{console.log('the file ' + sub_type + ' is written successfully!')}) ; 

   results_new = {} ; 
   for(var item in results) {
      id = results[item].RCNUM ; 
      if (typeof(results_new[id])== 'undefined'){  
         results_new[id] = {}; 
         results_new[id][sub_types] = [];  
      } ; 
      delete results[item].RCNUM; 
      results_new[id][sub_types].push(results[item]); 
   }
   //mdm_result[sub_type] = results_new ; 
   fs.writeFileSync('result/' +fdr+'_'+sub_types+'.json', JSON.stringify(results_new) , 'utf8'); 
   console.log( `${fdr} ${sub_types} file is written successfully!`)  ; 
   //fs.writeFileSync(fdr+'_'+sub_types+'.json', JSON.stringify(results_new) , 'utf8') ; 
   //console.log(JSON.stringify(mdm_result[sub_type])); 
}); 

var curried_process_result = {}; 
curried_process_result['names'] = process_result('name', 'names') ; 
curried_process_result['tels']= process_result('phone', 'phones') ; 
curried_process_result['addrs']= process_result('addr', 'addresses'); 
curried_process_result['emails']= process_result('email', 'emails'); 
curried_process_result['ids']= process_result('identifier', 'identifiers') ; 


var merge_result = _.curry(function(feeder, cb) {

   names = JSON.parse(fs.readFileSync('result/' + feeder + '_names.json', 'utf8')) ;   // read the json files
   tels = JSON.parse(fs.readFileSync('result/' + feeder + '_phones.json', 'utf8')) ; // read the json files
   addrs = JSON.parse(fs.readFileSync('result/' + feeder + '_addresses.json', 'utf8')) ; // read the json files
   emails = JSON.parse(fs.readFileSync('result/' + feeder + '_emails.json', 'utf8')) ; // read the json files
   ids = JSON.parse(fs.readFileSync('result/' + feeder + '_identifiers.json', 'utf8')) ;  // read the json files
 

   var result_all = names; 

   for (var item in result_all)
   { if (typeof(tels[item]) !== 'undefined') { Object.assign(result_all[item], tels[item]) } }

   for (var item in result_all)
   { if (typeof(addrs[item]) !== 'undefined') { Object.assign(result_all[item], addrs[item]) } }

   for (var item in result_all)
   { if (typeof(emails[item]) !== 'undefined') { Object.assign(result_all[item], emails[item]) } }

   for (var item in result_all)
   { if (typeof(ids[item]) !== 'undefined') { Object.assign(result_all[item], ids[item]) } }

   var result_all_final = [] ; 
   for (var item in result_all) 
   {
      var a = {"source": {"id":"TRI-000003", "memid": item, "action": "add"}}; 
      result_all_final.push(Object.assign(a, result_all[item])) ; 
   }

   console.log('\n** start to convert utf-8 string to string ** ') ; 
   traverse(result_all_final).forEach(function(x) {
      if (typeof(x)=='string') {
         if (x.startsWith("##UTF8##"))
         { 
            //console.log('original string: ', x)
            this.update(Buffer.from(x.substring(8),'hex').toString('utf8') ); 
            //console.log('after conversion: ', Buffer.from(x.substring(8),'hex').toString('utf8') )
         } 
      } 
   }) ; 

   // remove the duplicates records from the final result
   result_all_final = result_all_final.map( (item) => {
      new_item = {}; 
      for (let sub_types in item) {
         sub_object = {}; 
         if (sub_types == "source") { 
            sub_object[sub_types] = item[sub_types]; 
            Object.assign(new_item, sub_object); }
         else { 
            origin_count = item[sub_types].length; 
            origin_obj = item[sub_types]; 
            sub_object[sub_types] = lodash.uniqWith(item[sub_types], lodash.isEqual); 
            after_count = sub_object[sub_types].length; 
            Object.assign(new_item, sub_object); 
            if (after_count < origin_count) {
               console.log(`----- checking for cnum ${item.identifiers[0].identifier.id} ----`) ; 
               console.log('duplicate record found...'); 
               console.log('original object is :', JSON.stringify(origin_obj)); 
               console.log('final object is :', JSON.stringify(sub_object[sub_types])); 
            }
         }
      }
      //console.log(JSON.stringify(new_item)); 
      return new_item; 
   }) ; 





   console.log('----------------------------');
   console.log("total count in " + feeder + " feeder is : "  , result_all_final.length); 
   fs.writeFileSync('result/final/ODM_MDM_' + feeder + '.json', JSON.stringify(result_all_final) , 'utf8') ;
   console.log("the file " + feeder + " is written successfully!") ; 
   cb(null, feeder + " is Done!"); 
}); 



