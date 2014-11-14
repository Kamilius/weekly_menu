var express = require('express'),
    app = express();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.use(express.static(__dirname + '/build'));

var server = app.listen(3000, function() {
  var host = server.address().address,
      port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});