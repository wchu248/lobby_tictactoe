var morgan = require("morgan");
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var express = require("express");
var http = require('http');
var app = express();

// Set views directory
app.use(express.static(__dirname + '/public'));

// Define how to log events
app.use(morgan('tiny'));

// parse application/x-www-form-urlencoded, with extended qs library
app.use(bodyParser.urlencoded({extended: true}));

// Load all routes in routes directory
fs.readdirSync('./routes').forEach(function (file) {
  // There might be non-js file iin dir that should not be loaded
  if (path.extname(file) == '.js') {
    console.log("Adding routes in " + file);
    require('./routes/'+file).init(app);
  }
})

// catch any routes not already handled with error message
app.use(function(req,res) {
  var message = 'Error, did not understand path ' + req.path;
  // set status to 404 not found and render message to user
  res.status(404).render('error', {'message':message});
});

var httpServer = http.Server(app);
var sio = require('socket.io');
var io = sio(httpServer);
httpServer.listen(50000, function() {
  console.log("Listening on port:" + this.address().port);
});
app.set('socket.io', io);
var gameSockets = require('./routes/serverSocket.js');
gameSockets.init(io);