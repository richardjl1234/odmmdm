// step 1, run the fdr query to get the list of fdrs
// step 2, for each feeder, prepare the sql for each properties, and run sql to get the result from database. process_feeder()
// setp 3, for the result, need to process it and come up with the json format data , curried_process_result, every sub type result will be written into file
// step 4. handle the utf8 string to string
// step 5, remove the duplicates form the objects
// step 6 write the result to the file in the result/final folder
// step 7, final verification, to verify the count in json file against the record count in odm database



var http = require('http');
var lodash = require('lodash'); 
var common_func=require('./common_func') ; 
var _=require('ramda'); // make use of currying and compaose 
var http = require('http');
var url = require('url') ; 
var fs = require('fs'); 
//require('dotenv').load(); // load the environment variables. 
var request = require('request');
var fs = require("fs-extra");
var ibmdb = require('ibm_db');
var async = require('async'); 
var traverse = require('traverse'); 

//initialize the sql file and put them into varialbes 
var feederAsyncs = []; 
var curried_merge_result = []; 


// define the functions from the curried base function. 
var process_feeder = _.curry(function(feeder, cb)
   {
      console.log("** Start processing feeder/group:" + feeder) ; 
      //condition =  `where E01.CFDRSRC = '${feeder}' `;   
      if(feeder[0] != 'X') {
         condition =  `where SUBSTR(E01.RCNUM, 4,1)  = '${feeder[0]}' and E01.CODM = '${feeder[1]}' `;   
      }else{
         condition =  `where SUBSTR(E01.RCNUM, 4,1)  not in ( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9') and E01.CODM = '${feeder[1]}' `;   
      }
      //condition = condition + " AND e01.RCNUM IN ('000941724', '000519724', '943511672') ;  ";  
      console.log(condition) ; 
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
      }, function(err,results) { console.log(`*** feeder/group ${feeder} is processed: ${results}`); var x={}; x[feeder] = results; cb(null, x) });
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

   // step 4. handle the utf8 string to string
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

   // step 5, remove the duplicates form the objects
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





   // step 6 write the result to the file in the result/final folder
   console.log('----------------------------');
   console.log("total count in " + feeder + " feeder is : "  , result_all_final.length); 
   fs.writeFileSync('result/final/ODM_MDM_' + feeder + '.json', JSON.stringify(result_all_final) , 'utf8') ;
   console.log("the file " + feeder + " is written successfully!") ; 
   // step 7, final verification, to verify the count in json file against the record count in odm database
   fdr_cnt = {} ; 
   fdr_cnt[feeder] = result_all_final.length;  //return the feeder: count dict in the callback
   cb(null, fdr_cnt);
}); 




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// step 1, run the fdr query to get the list of fdrs
// feeder ==> groups
feeders = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X']; 
//feeders = [ '7', '8', '9', 'X']; 
//codms = [ 'E', 'P']; 
codms = ['A', 'E', 'P']; 
groups = feeders.map(feeder => codms.map(codm => feeder+codm)) ;
groups = [].concat(...groups); 
//groups = groups.concat('X') ;

console.log(groups) ; 
feederAsyncs = groups.map(feeder => process_feeder(feeder));
curried_merge_result = groups.map(feeder => merge_result(feeder)); 
// step 2, for each feeder, prepare the sql for each properties, and run sql to get the result from database. process_feeder()
// run the feederAsyncs procedures
// this async is the main part

http.createServer(function(request, response) {
   if(request.url!=="/favicon.ico"){
      response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      data = 'hello world'; 
      response.write(data);
      response.end('');
      async.series(feederAsyncs , 
         function(err, results){ 
            console.log('\n\n******************' ) ; 
            console.log(results);
            // setp 3, for the result, need to process it and come up with the json format data , curried_process_result, every sub type result will be written into file
            async.series(curried_merge_result , function(err, rsts){ console.log(rsts); });
         }); 
      };
}).listen(8080);
console.log("Listening on port 8080.....");
