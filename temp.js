var fs = require('fs'); 
function MyClass(){
this.a = 'some value';
this.b = {
  'key': 'another json structure'
};
}
 
var instance = new MyClass();
console.log(JSON.stringify(instance));
console.log(instance) ; 


names = require('./result_names.json') ; 
tels = require('./result_phones.json') ; 
addrs = require('./result_addresses.json') ; 
emails = require('./result_emails.json') ; 
ids = require('./result_identifiers.json') ; 
//resultJson = {} ; 
//
//for(var item in addrJson) {
//  id = addrJson[item].RCNUM ; 
//   if (typeof(resultJson[id])== 'undefined'){  
//      resultJson[id] = {'addresses': []}  
//   } ; 
//   delete addrJson[item].RCNUM; 
//   resultJson[id].addresses.push(addrJson[item]); 
//}
//console.log(JSON.stringify(resultJson,null,2));
//
//


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

fs.writeFile('result_all.json', JSON.stringify(result_all_final,null,2) , 'utf8', ()=>{console.log('the result_all file is written successfully!')}) ;






