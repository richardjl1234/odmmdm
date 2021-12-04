*_this application currently only implemented in local, not deployed to bluemix yet_*

# Solution to the MDM file creation for ODM application

## Files contained in this repo:
1. `read_xxxx.sql`  where xxxx stands for the 1st level properties required by MDM repository
1. `read_fdr.sql` This is the sql statement to get all feeders from ODM database 
`SELECT DISTINCT CFDRSRC FROM ODMPRD.ODMT_EMPLOYEE; `
1. `app.js`  The main node.js program to :
    1.  Based on the feeder codes provided in the query result from `read_fdr.sql`, for each feeder, run all the `read_xxxx.sql` to get query results for a given property for that feeder.    
    1.  The query results for "name", "email", "address", "phone", "identifier" are created for a given feeders. 
    1.  For every data subject, there might be multiple records for a given property. For example, one can have multiple addresses in ODM database. Program will wrap multiple records to be one single property. For example, email record(s) will be  assigned to be "emails" properties in the json file and emails property will contain an array which holds all email records for that data subject.
    1.  Program repeats the above steps to get all the results for all feeders based on the result in the `read_fdr.sql`
    1.  All those results will be saved in the intermediate files. The file name will be `feeder_properties.json`. For example, `HHA_emails.json`
    1.  For all feeders, assemble the above json files to create one single data object in json file. All properties (names, emails, identifiers, addresses, phones) will be assigned to each subject. One single file for each feeder will be created. 
    1.  The program also handle utf8 strings for both name field as well as address field
    1.  Something need to be further improved. when the utf8 name/address is same as non-utf8 name/address, we need to find some way to remove those duplicate. (or we only handle utf8 for Japan people??)


 1. `node temp.js` is to merge the result into one single json file.    
 
 
 ## How to run the node js application. We need to assign bigger memory heap size. 
 
`node --max-old-space-size=4096 app.js`

## about UTF-8 processing
+ currently, F table contains the utf8 string, when selecting, we use ##UTF8## in the result to tag the utf8 string
+ use traverse function in merge process to convert those ##UTF8## stirng to string. 

# Node.js db2 connection to on-premise z/OS DB2

The application can be running on your local machine as well as running on Bluemix. 
You can reply the sameple SQL statement in the application which fits your database.

## get this repository into your local
1. make sure git is installed in your local machine
1. use git clone command to clone this repository to your local machine

## Run the app locally

1. [Install Node.js][]
1. cd into this project's root directory
1. Run `npm install` to install the app's dependencies
1. Run `./switch2env.sh local`
1. Run `sh .profile` to copy the license file to the right place
1. Run `npm start` to start the app in your local machine.
1. Access the running app in a browser at <http://localhost:8080>

[Install Node.js]: https://nodejs.org/en/download/

## Instruction to run this application on bluemix org:ODMODMR space:dev
1. Make sure bluemix cli has already been installed in your local machine. Please download&install Bluemix Cli in your machine. 
1. cd into this project's root directory
1. Run `./switch2env.sh dev`
1. Run `bluemix login --sso --no-iam`  //this command is only needed when you use bluemix cli for the first time in your local machine. Once successfully logged in, this step is not needed anymore. 
1. Run `./deploy.sh dev` to deploy the code into bluemix server. 
1. once the deployment process is done, input the address https://db2conndev.w3ibm.mybluemix.net/
1. If you want to deploy your application in a difference bluemix region, organzation, space, please modify the deploy.sh. Also please make sure you have the proper authorization to the org/space you specified in the deploy.sh 

## Confirm the output to make sure the connection to on-premise database and CEDP successfully
1. In the web browser, the sample result data from CEDP is shown. 
1. In the console, you see the sample result records from on-premise MF DB as well. The sample json file is created in the root directory as well. In bluemix, please go to the dashboard -> your application -> log. From there you can see the console.log output.  

## A Few Points to enable the successful connection
1. The secure gateway must be setup before the connection to ODM database. When you want bluemix application access on-premise database, secure gateway setup is mandatory. 
1. the licence file is needed as well to enable the connection to z/OS DB2. the file is db2consv_zs.lic. This file is not shared in github for security reason. please copy the lic file only on your local machine. 
1. When running the file in local, the host name for ODM is the address for the on-premise MF server. When running application on application on bluemix, then the host name has to be the mapped host name which is given by security gateway. 
1. .env file is the configration file, you need 2 sets of .env (namely .env_local .env_test). the .env file will be different between the two environments. .env file is not included in this repo since it contains credentials data. 
1. both CEDP connection and ODM connection use the same ibm_db package. When setup the connection for CEDP, in the connection parameter, you need to specify the truststore and use SSL connection. 
1. The truststore (.jks) file is not shared in this repo either. please copy it to your local root directory and should not be shared.
1. .profile is used during the deployment of the bluemix application. it will be executed automatically so that the license file can be copied to corresponding licence folder, which is needed for z/OS db2 connection. 
1. reference to ibm_db npm package, refer to this link: https://www.npmjs.com/package/ibm_db

## example of .env_dev and .env_local

1. .env_local
#ODM database UAT
```
ODM_DB_NAME=USIBMVRDD1H
ODM_USERID=*your userid*
ODM_USERID_PASSWORD=*your password*
ODM_SCHEMA=ODMUAT
ODM_HOST=stfmvs1.pok.ibm.com
ODM_PORT=5000

CEDP_DB_NAME=BLUDB
CEDP_USERID=*your userid*
CEDP_USERID_PASSWORD=*your password*
CEDP_TRUSTSTORE=ibm-truststore.jks
CEDP_TRUSTSTORE_PASSWORD=*the password to the truststore*
CEDP_HOST=dashdb-super-cdo-dal13-05.services.dal.bluemix.net
CEDP_PORT=50001
```

1. .env_dev
```
ODM_DB_NAME=USIBMVRDD1H
ODM_USERID=*your userid*
ODM_USERID_PASSWORD=*your password*
ODM_SCHEMA=ODMUAT
ODM_HOST=cio-sg-01.integration.ibmcloud.com
ODM_PORT=15290

CEDP_DB_NAME=BLUDB
CEDP_USERID=*your userid for dashdb*
CEDP_USERID_PASSWORD=*password*
CEDP_TRUSTSTORE=ibm-truststore.jks
CEDP_TRUSTSTORE_PASSWORD=*password for the truststore*
CEDP_HOST=dashdb-super-cdo-dal13-05.services.dal.bluemix.net
CEDP_PORT=50001

```

## create Docker image from Dockerfile and run Docker container in your local machin

1. Ensure Docker tool is installed in your machine
1. In your local machine, go to the root directory of this repo
1. Run the following command: 
``` 
docker build -t dashdb1 .        
docker run -it -p 8080:8080 dashdb1 
```
1. Now, you started the docker container dashdb1, in the command line, enter the following 2 commands: 
``` 
./swithc2env.sh local
 npm start
```
1. in your browser in host machine, input `localhost:8080` and you will be able to see the result from CEDP in browser, and the result of odm database on the console, terminal of your dashdb1

1. the `docker build` command usually will take several minutes, since it will need to create the images and install all the dependencies in the image. Just be patient to wait it completed. 

1. once the image dashdb1 is created, the command `docker build` is not needed to run anymore. you can always run `docker run` to start the container since the image is already created in your loacl machine. 

1. Command `docker images` will list all the images in your local machine. 


