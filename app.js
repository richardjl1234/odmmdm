var common_func=require('./common_func') ; 
var http = require('http');
var url = require('url') ; 
var fs = require('fs'); 
require('dotenv').load(); // load the environment variables. 
var request = require('request');
var fs = require("fs-extra");
var ibmdb = require('ibm_db');

var condition = fs.readFileSync('read_filter.sql', 'utf8'); 
var sql_names = fs.readFileSync('read_names.sql', 'utf8') + condition; 
var sql_emails = fs.readFileSync('read_emails.sql', 'utf8')  + condition; 
var sql_addrs = fs.readFileSync('read_addrs.sql', 'utf8')  + condition; 
var sql_tels = fs.readFileSync('read_tels.sql', 'utf8')  + condition; 
var sql_ids = fs.readFileSync('read_ids.sql', 'utf8')  + condition; 

connStr = "DATABASE="+process.env.CEDP_DB_NAME+";HOSTNAME="+process.env.CEDP_HOST+";PORT="+process.env.CEDP_PORT+";PROTOCOL=TCPIP;UID="+process.env.CEDP_USERID+";PWD="+process.env.CEDP_USERID_PASSWORD+";Security=SSL;sslTrustStoreLocation="+process.env.CEDP_TRUSTSTORE+";sslTrustStorePassword="+process.env.CEDP_TRUSTSTORE_PASSWORD; 

console.log(connStr); 

data = '' ; 
n = 0;  // count for the feedback count
http.createServer(function(request, response) {
   response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); 
   if(request.url!=="/favicon.ico"){
      n = n+1
      console.log('##############\nHello, ODM support Team! \n The web server is hit  ' + String(n) + ' times since last restart!') ; 
      console.log('http server is running... ');
      response.write('the page is hit ' + n + ' times!' ) ; 
      common_func.queryODM(sql_names).then(process_name_result).catch(function(err) {console.log("\n" + err)}); 
      common_func.queryODM(sql_addrs).then(process_addr_result).catch(function(err) {console.log("\n" + err)}); 
      common_func.queryODM(sql_emails).then(process_email_result).catch(function(err) {console.log("\n" + err)}); 
      common_func.queryODM(sql_ids).then(process_id_result).catch(function(err) {console.log("\n" + err)}); 
      common_func.queryODM(sql_tels).then(process_tel_result).catch(function(err) {console.log("\n" + err)}); 

      ibmdb.open(connStr, function (err, connection) {
         if (err) 
         {
            console.log(err);
            return;
         }
         connection.query("select * from odm_odmprd.odmt_domain fetch first 10 rows only; ", function (err1, rows) {
            if (err1) console.log(err1);
            else {
               response.write("<BR>Query result from Dallas CEDP: <BR>"); 
               response.write(JSON.stringify(rows)); 
               response.end();}

            connection.close(function(err2) { 
               if(err2) console.log(err2);
            });
         });
      });
   }; 
}).listen(8080);

// use currying to create a group of functions
var process_result = function(sub_type, sub_types) {
   return function(result) {
      var  results= result.map(function(item) {
         id = item.RCNUM; 
         delete item.RCNUM; 
         sub_result = {}; 
         sub_result.RCNUM = id;  
         sub_result[sub_type] = item; 
         return sub_result; 
      }); 
      fs.writeFile('result_'+sub_type+'.json', JSON.stringify(results) , 'utf8', ()=>{console.log('the file ' + sub_type + ' is written successfully!')}) ; 
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
      fs.writeFile('result_'+sub_types+'.json', JSON.stringify(results_new) , 'utf8', ()=>{console.log('the file ' + sub_types + ' is written successfully!')}) ; 
      console.log(JSON.stringify(results,null,2)); 
      console.log(JSON.stringify(results_new,null,2)); 
   }
}

var process_name_result = process_result('name', 'names') ; 
var process_tel_result = process_result('phone', 'phones') ; 
var process_addr_result = process_result('addr', 'addresses'); 
var process_email_result = process_result('email', 'emails'); 
var process_id_result = process_result('identifier', 'identifiers') ; 
