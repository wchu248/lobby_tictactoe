var mongoModel = require('../models/mongoModel.js');
var collection = "users";

exports.init = function(app) {
  app.get('/', index)
  app.put('/create', doCreate);    // CRUD Create
  app.get('/retrieve', doRetrieve);  // CRUD Retrieve
}

index = function(req, res) {
  res.render('index', {error_message: ""});
}

// CRUD Create
doCreate = function(req, res) {
  // get the username query ONLY
  if (req.query.username == "" || req.query.password == "") {
    res.send('error');
    return;
  } else {
    var query = '{ \"username\": \"' + req.query.username + '\" }';
  }
  // first see if someone with that username exists already
  mongoModel.retrieve(collection, JSON.parse(query), function(modelData) {
    if (modelData.length) {
      // if so, send error message
      res.send('error');
    } else {
      // if not, then create the user and log in
      mongoModel.create(collection, req.query, function(result) {
        var success = (result ? "Create successful" : "Create unsuccessful");
        res.send(req.query.username);
      });
    }
  })
}

// CRUD Retrieve
doRetrieve = function(req, res) {
  var io = req.app.get('socket.io');
  mongoModel.retrieve(collection, req.query, function(modelData) {
    if (modelData.length) {
      res.send(modelData[0].username);
    } else {
      res.send('error');
    }
  });
  return false;
}