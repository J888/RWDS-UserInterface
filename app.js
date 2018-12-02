var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");
//var app = express();


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public_files/html/view_images.html');
});


app.set('socketio', io); //set a reference to io

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));
//
routes(app);
app.use(express.static(__dirname + '/public_files'))
//
// var server = app.listen(3000, function () {
//     console.log("app running on port.", server.address().port);
// });
