var fs = require('fs'); 

var feeders = ['HC9', 'HUS'] ; 

var merge_result = function(feeder) {

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
   fs.writeFile(feeder + '_all.json', JSON.stringify(result_all_final) , 'utf8', ()=>{console.log(feeder + '_all file is written successfully!')}) ;
}


feeders.map(merge_result) ; 




