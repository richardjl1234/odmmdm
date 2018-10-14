var common_func=require('./common_func') ; 
var _=require('ramda'); // make use of currying and compaose 
var http = require('http');
var url = require('url') ; 
var fs = require('fs'); 
require('dotenv').load(); // load the environment variables. 
var request = require('request');
var fs = require("fs-extra");
var ibmdb = require('ibm_db');


//initialize the sql file and put them into varialbes 

var feeders = ['HC9', 'HUS'];

var process_feeder = function(feeder)
{
   console.log("feeder is " + feeder) ; 
   condition =  "where E01.CFDRSRC = "+ "'" + feeder + "';";   
   console.log(condition) ; 
   //var condition = fs.readFileSync('read_filter.sql', 'utf8'); 
   var sql_names = fs.readFileSync('read_names.sql', 'utf8') + condition; 
   var sql_emails = fs.readFileSync('read_emails.sql', 'utf8')  + condition; 
   var sql_addrs = fs.readFileSync('read_addrs.sql', 'utf8')  + condition; 
   var sql_tels = fs.readFileSync('read_tels.sql', 'utf8')  + condition; 
   var sql_ids = fs.readFileSync('read_ids.sql', 'utf8')  + condition; 
   common_func.queryODM(sql_names).then(process_name_result(feeder)).catch(function(err) {console.log("\n" + err)}); 
   common_func.queryODM(sql_addrs).then(process_addr_result(feeder)).catch(function(err) {console.log("\n" + err)}); 
   common_func.queryODM(sql_emails).then(process_email_result(feeder)).catch(function(err) {console.log("\n" + err)}); 
   common_func.queryODM(sql_ids).then(process_id_result(feeder)).catch(function(err) {console.log("\n" + err)}); 
   common_func.queryODM(sql_tels).then(process_tel_result(feeder)).catch(function(err) {console.log("\n" + err)}); 
}; 

//mdm_result = []; 
data = '' ; 
n = 0;  // count for the feedback count
http.createServer(function(request, response) {
   response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); 
   if(request.url!=="/favicon.ico"){
      n = n+1
      console.log('##############\n The web server is hit  ' + String(n) + ' times since last restart!') ; 
      console.log('http server is running... ');
      response.write('the page is hit ' + n + ' times!' ) ; 
      feeders.map(process_feeder); 
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
   //console.log(JSON.stringify(mdm_result[sub_type])); 
}); 
// define the functions from the curried base function. 
var process_name_result = process_result('name', 'names') ; 
var process_tel_result = process_result('phone', 'phones') ; 
var process_addr_result = process_result('addr', 'addresses'); 
var process_email_result = process_result('email', 'emails'); 
var process_id_result = process_result('identifier', 'identifiers') ; 
