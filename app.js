/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var express = require('express'),
    app = express();
//configure express further

var config = require('./server/config/config');  //may pass env later

require('./server/config/express')(app, config);

//mongoose goes here

// passport goes here

require ('./server/config/routes.js')(app);

//var neo4j = require('neo4j');
//var db = new neo4j.GraphDatabase('http://localhost:7474');

//require('./lib/neo4jconnect')(app, db);


//require('./lib/mongouser');



app.listen(8089);
  console.log('Express server listening on port 8089');