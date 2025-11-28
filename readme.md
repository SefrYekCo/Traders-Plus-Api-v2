# Tradersplus API
 
Tradersplus API server on express.js
 
## Installing
 
 1. Install node.js and npm
    - you can download and install it from here: https://nodejs.org/en/download/
 2. Install mongo.db
    - you can download and install mongodb from here: https://docs.mongodb.com/manual/administration/install-community/
 3. Install redis
    - you can download a stable version from here: https://redis.io/download
 4. VSCode Editor required for develop

## Prerequisites
 - start mongodb
 - run: 'npm install' in root directory of project
 
## Service Documentation
Full Documentation of API is available.
See here: http://confluence.sefryek.com:8090/display/PROJ/Traders+Plus
 
## API Documentation
All api available in fittness with testcases
See here: http://fitnesse-a.sefryek.com:9095/TraderPlusTest
 
## Main node should be to start

in the root of project you need to start the server.js file with below command:
node src/server.js

and you can start with PM2 if installed in your operation system:
you can install pm2 as a npm package

npm pm2 --global

and then you can start server with this command:
pm2 start src/eco.config.js --env ${enviroment}

## Enviroments

 - test  
 - development
 - production