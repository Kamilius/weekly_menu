var express = require('express'),
    app = express(),
    mongo = require('mongodb'),
    monk = require('monk'),
    db = monk('localhost:27017/nodetest1');

app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/users', function(req, res) {
  var db = req.db,
      collection = db.get('usercollection');

  collection.find({}, {}, function(e, docs) {
    console.log(docs);
    res.json(docs);
  });
});

app.use(express.static(__dirname + '/build'));

var server = app.listen(3000, function() {
  var host = server.address().address,
      port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});