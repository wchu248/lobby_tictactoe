var mongoModel = require('../models/mongoModel.js');

var collection = "users";

exports.init = function(app) {
  app.get('/', index)
  app.put('/create', doCreate);    // CRUD Create
  app.get('/retrieve', doRetrieve);  // CRUD Retrieve
}

index = function(req, res) {
  res.render('index', {login_error_message: ""});
}

// CRUD Create
doCreate = function(req, res) {
  if (Object.keys(req.query).length == 0) {
    res.render('message', {title: 'User CRUD Actions', obj: "No create message body found"});
    return;
  }
  mongoModel.create(collection, req.query, function(result) {
    var success = (result ? "Create successful" : "Create unsuccessful");
    res.render('message', {title: 'User CRUD Actions', obj: success});
  });
}

// CRUD Retrieve
doRetrieve = function(req, res) {
  mongoModel.retrieve(collection, req.query, function(modelData) {
    if (modelData.length) {
      console.log('found someone!');
      res.render('lobby', {username: modelData[0].username});
    } else {
      res.render('index', {login_error_message: "Username and/or password not found. Please try again"});
    }
  })
}