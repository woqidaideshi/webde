var fs = require('fs');
var json = fs.readFileSync('../config.js').toString();
var reg = '(/\\\*([^*]|[\\\r\\\n]|(\\\*+([^*/]|[\\\r\\\n])))*\\\*+/)|(//.*)';  
var reg0 = "(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|(//.*) ";
var res = json.replace(new RegExp(reg, 'g'), '')
console.log(res)
//var exp = new RegExp(reg,json,"g");  
//console.log(exp);