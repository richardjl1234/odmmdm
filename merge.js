var fs = require('fs'); 
var async = require('async'); 
var _=require("ramda") ; 

var feeders = ['HC9', 'HPH', 'HSW', 'HNW'] ; 

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

async.series(curried_merge_result , function(err, results){ console.log(results); });


//
//feeders.map(merge_result) ; 




