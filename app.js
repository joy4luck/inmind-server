/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var route_demo = require('./routes/demo');
var route_message = require('./routes/message');
var route_plant = require('./routes/plant');
var route_user = require('./routes/user');

var AuthProvider = require('./data/authProvider').AuthProvider;
var authProvider = new AuthProvider('localhost', 27017);

var fs = require('fs');
//var http = require('http');
var https = require('https');
var path = require('path');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var app = express();

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

// all environments
app.configure(function(){
  app.set('port', 443);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.basicAuth(function(user, pass, callback) {
    console.log("Ping from: " + user);
    var result = authProvider.login(user, pass, function(err, res){
      callback(null, res);
    });
  }));

  /*
  function requireHTTPS(req, res, next) {
      if (!req.secure) {
          return res.redirect(['https://', req.get('host'), req.url].join(''));
      }
      next();
  }
  app.use(requireHTTPS);
  app.use(function(req, res, next){
    console.log(req);
    next();
  });
  */
  app.use(app.router);
});

// development only
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~ ROUTING ~~~~~~~~~~~~~~~~~~~~~~

// homepage
app.get('/', routes.home);

// original webpage based posting
app.get('/demo/new', route_demo.demo_get);
app.post('/demo/new', route_demo.demo_post);

// messages
app.get('/messages', route_message.get_all_messages);
app.get('/messages/check', route_message.get_messages);
app.post('/messages', route_message.post_message);

// plants
app.get('/plants', route_plant.home);
app.get('/plants/check', route_plant.get_plants);
app.post('/plants', route_plant.post_plant);
app.post('/plants/update', route_plant.update_plant);

// users
app.get('/users', route_user.new_user);
app.get('/users/check', route_user.get_users);
app.get('/users/IV', route_user.get_IV);
app.get('/users/success', route_user.success);
app.get('/users/nomatch', route_user.nomatch);
app.get('/users/bad', route_user.bad);
app.post('/users', route_user.post_user);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~ START ~~~~~~~~~~~~~~~~~~~~~~

var httpsPort = app.get('port');
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(httpsPort, function(){
  console.log('InMind HTTPS server listening on port ' + httpsPort);
});
