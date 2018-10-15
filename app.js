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

var feeders = [ 'HUS', 'HHA', 'HC9'];
//var feeders = ['HPH', 'HC9', 'HSW', 'HNW'];

// define the functions from the curried base function. 

var feederAsyncs = feeders.map((feeder) => {
   return function(callback) {
      process_feeder(feeder, callback);
//      callback(null, feeder);
   }
}); 

var process_feeder = function(feeder, cb)
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
}

data = '' ; 
n = 0;  // count for the feedback count
http.createServer(function(request, response) {
   response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); 
   if(request.url!=="/favicon.ico"){
      n = n+1
      console.log('##############\n The web server is hit  ' + String(n) + ' times since last restart!') ; 
      console.log('http server is running... ');
      response.write('the page is hit ' + n + ' times!' ) ; 
      async.series(feederAsyncs , function(err, results){ console.log(results); }); 
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

