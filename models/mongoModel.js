var mongoClient = require('mongodb').MongoClient;

var connection_string = "mongodb://wpchu:prep092339@ds259855.mlab.com:59855/67-328_mlab";

// LOOK AT MONGODB EXAMPLE ON CANVAS FOR 
// INFO ABOUT STORING CONNECTION PASSWORDS IN NOW

var mongoDB;
var doError = function(e) {
  console.error("ERROR: " + e);
  throw new Error(e);
}

mongoClient.connect(connection_string, function(err, db) {
  if (err) {
    doError(err);
  }
  console.log("Connected to MongoDB server at: " + connection_string);
  mongoDB = db;
});

// CRUD Create -> Mongo insert
exports.create = function(collection, data, callback) {
  mongoDB.collection(collection).insertOne(
    data,
    function(err, status) {
      if (err) {
        doError(err);
      }
      var success = (status.result.n == 1 ? true : false);
      callback(success);
    }
  );
}

// CRUD Retrive -> Mongo find
exports.retrieve = function(collection, query, callback) {
  mongoDB.collection(collection).find(query).toArray(function(err, docs) {
    if (err) {
      doError(err);
    }
    // docs are MongDB documents, returned as an array of JavaScript objects
    // Use callback provided by controller to send back the docs
    callback(docs);
  });
}

// CRUD Update -> Mongo updateMany
exports.update = function(collection, filter, update, callback) {
  mongoDB.collection(collection) // The collection to update
    .updateMany(                 // Use updateOne to only update 1 document
      filter,                    // filter selects which documents to update
      update,                    // the update operation
      {upsert:true},             // if document not found, insert one with this update
                                 // set upsert false (default) to not do insert
      function(err, status) {    // callback upon error or success
        if (err) {
          doError(err);
        }
        callback('Modified ' + status.modifiedCount + ' and added ' + status.upsertedCount + " documents.");
      }
    );
}

// CRUD Delete -> Mongo deleteMany
exports.delete = function(collection, filter, callback) {
  mongoDB.collection(collection).deleteMany(filter, function(err, status) {
    if (err) {
      doError(err);
    }
    callback('Deleted ' + status.deletedCount + " documents.");
  });
}