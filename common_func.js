ibmdb = require('ibm_db') ; 
//require('dotenv').load(); 

module.exports = {
   queryODM:function(sql) {
      db_parm = "DRIVER={DB2};"+"DATABASE="+process.env.ODM_DATABASE_PROD+";"+"UID="+process.env.USER+";"+"PWD="+process.env.PASSWORD+";"+"HOSTNAME="+process.env.ODM_SERVER+";"+"PORT="+process.env.ODM_PORT_PROD; 
      //console.log(db_parm) ; 
      return new Promise(function(resolve,reject) {
         ibmdb.open(db_parm, function(err, conn)
            {
               if(err) {
                  //console.error("error: ", err.message);
                  reject("error" + err.message) ; 
               } else {
                  //console.log(sql) ; 
                  conn.query(sql , function(err, records, moreResultSets) 
                     {
                        if(err){
                           reject(err); 
                        }else{
                           conn.close(function(){ 
                              //console.log("Connection Closed"); 
                           });
                           resolve(records); 
                        }
                     });
               }
            });
      }); 
   }

}
