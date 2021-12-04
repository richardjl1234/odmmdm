var fs = require('fs'); 
feeder = 'HSW'; 
results = JSON.parse(fs.readFileSync(`result/final/ODM_MDM_${feeder}.json`, 'utf8')) ;   // read the json files
sample = results.filter( (result) => result.names.length === 2  && ("phones" in result && result.phones.length >=2) && ("addresses" in result && result.addresses.length >=2)) ; 

//sample.push(results[20])
//sample.push(results[30])

fs.writeFileSync(`result/sample/ODM_MDM_sample_${feeder}.json`, JSON.stringify(sample.slice(20,22)), 'utf-8'); 
