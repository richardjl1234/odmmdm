var deepeq = require('deep-equal') ; 

a = {x: 1, y: {m: 2, n:3}}
b = {y: { n:3, m: 2}, x: 1}

console.log(deepeq(a,b)); 

a = {x: 2, y: {m: 2, n:3}}
b = {y: { n:3, m: 2}, x: 1}

console.log(deepeq(a,b)); 
a = {x: 2, y: {m: {y:'y', x:['x', 1,3]}, n:3}}
b = {y: { n:3, m: {x:['x', 1, 3], y:'y'}}, x: 2}

console.log(deepeq(a,b)); 

z =new Set([a,b]); 
console.log(z) ; 

c = a;
zz = new Set([a,c]) ; 
console.log(zz); 


zzz = new Set([{a:1}, {a:1}]); 
console.log(zzz); 
