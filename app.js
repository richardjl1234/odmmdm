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

//initialize the sql file and put them into varialbes 

var feeders = [ 'HUS', 'HHA', 'HC9', 'HHP', 'HHI', 'HJP'];
//var feeders = ['HSW', 'HNW', 'HC9'];

// define the functions from the curried base function. 

   //return function(callback) {
   //   process_feeder(feeder, callback);
//      callback(null, feeder);
//   }
//}); 

var process_feeder = _.curry(function(feeder, cb)
{
   console.log("feeder is " + feeder) ; 
   condition =  "where E01.CFDRSRC = "+ "'" + feeder + "';";   
   console.log(condition) ; 
   var sqls=[]; 
   var keys = ['names', 'emails', 'addrs', 'tels', 'ids']; 

   keys.map((key)=>{sqls[key] = fs.readFileSync('read_'+key+'.sql', 'utf8') + condition; });  
   async.map(keys, function(key, callback) {
      //console.log(sqls[key]) ; 
      common_func.queryODM(sqls[key])
         .then(function(result) { curried_process_result[key](feeder, result); callback(null, key); })
         .catch(function(err) { callback(err); }); 
   }, function(err,results) { console.log(results); var x={}; x[feeder] = results; cb(null, x) }// cb is the the function need to be passed to process_feeder, and the assync which call this function will tell how to process the result. 
   );
}); 

var feederAsyncs = feeders.map((feeder) => { return process_feeder(feeder); }); 

data = '' ; 
n = 0;  // count for the feedback count
http.createServer(function(request, response) {
   response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); 
   if(request.url!=="/favicon.ico"){
      n = n+1
      console.log('##############\n The web server is hit  ' + String(n) + ' times since last restart!') ; 
      console.log('http server is running... ');
      response.write('the page is hit ' + n + ' times!' ) ; 
      async.series(feederAsyncs , 
         function(err, results){ 
            console.log(results);
            console.log("wait for 300s to make sure all files writting is completed!"); 
            setTimeout( function() {async.series(curried_merge_result , function(err, rsts){ console.log(rsts); });}, 200000); 
         }); 
      response.end(); 
   }; 
}).listen(8080);

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
   fs.writeFile(fdr+'_'+sub_types+'.json', JSON.stringify(results_new) , 'utf8', ()=>{console.log(fdr + ' ' + sub_types + ' file is written successfully!')}) ; 
   //fs.writeFileSync(fdr+'_'+sub_types+'.json', JSON.stringify(results_new) , 'utf8') ; 
   //console.log(JSON.stringify(mdm_result[sub_type])); 
}); 

var curried_process_result = []; 
curried_process_result['names'] = process_result('name', 'names') ; 
curried_process_result['tels']= process_result('phone', 'phones') ; 
curried_process_result['addrs']= process_result('addr', 'addresses'); 
curried_process_result['emails']= process_result('email', 'emails'); 
curried_process_result['ids']= process_result('identifier', 'identifiers') ; 


var merge_result = _.curry(function(feeder, cb) {

   names = require('./' + feeder + '_names.json') ; 
   tels = require('./' + feeder + '_phones.json') ; 
   addrs = require('./' + feeder + '_addresses.json') ; 
   emails = require('./' + feeder + '_emails.json') ; 
   ids = require('./' + feeder + '_identifiers.json') ; 

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

   console.log("total count in " + feeder + " feeder is : "  , result_all_final.length); 
   fs.writeFileSync(feeder + '_all.json', JSON.stringify(result_all_final) , 'utf8') ;
   console.log("the file " + feeder + " is written successfully!") ; 
   cb(null, feeder + " is Done!"); 
}); 

var curried_merge_result = feeders.map((feeder)=>{return merge_result(feeder); }); 


