var traverse = require('traverse'); 
fs = require('fs'); 

a = JSON.parse(fs.readFileSync('result/final/ODM_MDM_HHJ.json', 'utf8')); 

traverse(a).forEach(function(x) {
   console.log('one object:', x); 
   if (typeof(x)=='string') {
      if (x.startsWith("##UTF8##"))
      { 
         this.update(Buffer.from(x.substring(8),'hex').toString('utf8') ); 
      } 
   } 
}) 

console.log(JSON.stringify(a, null,2)) ; 
console.log(a.length); 

//
//b = JSON.parse(a) ; 
//convertUtf8 = function (hexStr) 
//{return Buffer.from(hexStr, 'hex').toString('utf8') } ; 
//
//
//b.map((item)=>{
//   item.names.map( (x) => {
//      if(x.name.hasOwnProperty('given_utf8') ) 
//      {
//         x.name.given = convertUtf8(x.name.given_utf8); 
//         delete x.name.given_utf8; 
//      }
//      if(x.name.hasOwnProperty('family_utf8') ) 
//      {
//         x.name.family = convertUtf8(x.name.family_utf8); 
//         delete x.name.family_utf8; 
//      }
//   }
//
//   )
//   console.log(item.names);
//   //item.names[0].name.given = convertUtf8(item.names[0].name.given_utf8);
//   //delete item.names[0].name
//
//   //item.names[0].name.family = convertUtf8(item.names[0].name.family_utf8);
//}) ; 
//
