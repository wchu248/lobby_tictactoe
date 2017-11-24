var mongoModel = require('../models/mongoModel.js');

var collection = "users";

exports.init = function(app) {
  app.get('/', index)
  app.get('/create', doCreate);    // CRUD Create
  app.get('/retrieve', doRetrieve);  // CRUD Retrieve
}

index = function(req, res) {
  res.render('index', {error_message: ""});
}

// CRUD Create
doCreate = function(req, res) {
  // get the username query ONLY
  if (req.query.username == "" || req.query.password == "") {
    res.render('index', {error_message: "Please fill out all fields to register."});
    return;
  } else {
    var query = '{ \"username\": \"' + req.query.username + '\" }';
  }
  console.log(JSON.parse(query));
  // first see if someone with that username exists already
  mongoModel.retrieve(collection, JSON.parse(query), function(modelData) {
    if (modelData.length) {
      // if so, show error message
      res.render('index', {error_message: "Username taken. Please choose another one."});
    } else {
      // if not, then create the user
      mongoModel.create(collection, req.query, function(result) {
        var success = (result ? "Create successful" : "Create unsuccessful");
        res.render('lobby', {username: req.query.username});
      });
    }
  })
}

// CRUD Retrieve
doRetrieve = function(req, res) {
  console.log(req.query);
  mongoModel.retrieve(collection, req.query, function(modelData) {
    if (modelData.length) {
      console.log('found someone!');
      res.render('lobby', {username: modelData[0].username});
    } else {
      res.render('index', {error_message: "Username and/or password not found. Please try again"});
    }
  })
}