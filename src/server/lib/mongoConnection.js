var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
  //, assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/apollo';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  //assert.equal(null, err);
  console.log("Connected correctly to server");
  exports.mongodb=db;
  // exports.mongodbUrl = url;
  // console.log(url);
  //console.log(db);
  //db.close();
});

mongoose.connect(url);