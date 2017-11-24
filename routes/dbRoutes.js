var mongoModel = require('../models/mongoModel.js');

var collection = "users";

exports.init = function(app) {
  app.put('/create', doCreate);    // CRUD Create
  app.get('/retrieve', doRetrieve);  // CRUD Retrieve
  app.post('/update', doUpdate);   // CRUD Update
  app.delete('/delete', doDelete); // CRUD Delete
  app.get('/login', doLogin); // Login
}

// Login
doLogin = function(req, res){
  console.log('allsldf');
  res.render('login');
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
      res.render('results',{title: "User CRUD Test Actions",obj: modelData});
    } else {
      var message = "No documents with " + JSON.stringify(req.query) + " in collection Users found.";
      res.render('message', {title: "User CRUD Actions", obj: message});
    }
  })
}

// CRUD Update
doUpdate = function(req, res) {
  var filter = req.query.find ? JSON.parse(req.query.find) : {};
  if (!req.query.update) {
    res.render('message', {title: "User CRUD Actions", obj: "No update operation defined"});
    return;
  }
  var update = JSON.parse(req.query.update);
  mongoModel.update(collection, filter, update, function(status) {
    res.render('message',{title: "User CRUD Test Actions", obj: status});  
  });
}

// CRUD Delete
doDelete = function(req, res) {
  var filter = req.query.find ? JSON.parse(req.query.find) : {};
  mongoModel.delete(collection, filter, function(status) {
    res.render('message',{title:"User CRUD Test Actions", obj:status});
  })
}