var faker = require("faker");
var fs = require("fs");
var mysql = require('mysql');

var pool  = mysql.createPool({
  connectionLimit : 10,
  connectTimeout  : 60 * 60 * 1000,
  acquireTimeout   : 60 * 60 * 1000,
  timeout         : 60 * 60 * 1000,
  host            : 'image.cylha9dqlktv.us-west-2.rds.amazonaws.com',
  user            : 'root',
  password        : 'objectdetection',
  database        : 'image'
});

var path = require('path');
var AWS = require('aws-sdk');
//var io = require('socket.io')();

AWS.config.update({ accessKeyId: 'AKIAIVRIUIAM76T56TYQ', secretAccessKey: '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' });

var appDir = path.dirname(require.main.filename);

//
// var con = mysql.createConnection({
//   host: "image.cylha9dqlktv.us-west-2.rds.amazonaws.com",
//   user: "root",
//   password: "objectdetection",
//   database: "image",
// //  port: 3306
// });



var appRouter = function (app) {

  let io = app.get("socketio");

  app.get("/", function (req, res) { // any time there's a get request
    res.sendFile(path.join(appDir+'/public_files/html/view_images.html'));
  });


  app.get("/listCameras", function(req, res){
    console.log("Connected!");
    var sql = "SELECT cam_identifier FROM image";
    pool.query(sql, function (error, results, fields) {
      if (error) throw error;
      res.status(200).send(results);
    });
  })

  app.get("/listImages", function(req, res){
      var s3 = new AWS.S3();
      var params = {
        Bucket: "rwds-images",
      };
      s3.listObjects(params, function(err, data) {
       if (err) console.log(err, err.stack); // an error occurred
       else     //console.log(data);           // successful response
       res.status(200).send(data);
      });
  });


  app.get("/imageDetails/:key", function(req, res){

    pool.getConnection(function(err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query("SELECT * FROM image WHERE image_name='"+req.params.key+"'", function (error, results, fields) {
        res.status(200).send(results);
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) throw error;

        // Don't use the connection here, it has been returned to the pool.
      });
    });

    // var sql = "SELECT * FROM image WHERE image_name='"+req.params.key+"'";
    // pool.query(sql, function (error, results, fields) {
    // if (error){
    //   console.log("there was an error in app.get('/imageDetails/:key', function(req, res)");
    //   throw error;
    // }
    //   res.status(200).send(results);
    // });

  })



  app.get("/user", function (req, res) {
    var data = ({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email()
    });
    res.status(200).send(data);
  });

 app.get("/users/:num", function (req, res) {
   var users = [];
   var num = req.params.num;

   if (isFinite(num) && num  > 0 ) {
     for (i = 0; i <= num-1; i++) {
       users.push({
           firstName: faker.name.firstName(),
           lastName: faker.name.lastName(),
           username: faker.internet.userName(),
           email: faker.internet.email()
        });
     }

     res.status(200).send(users);

   } else {
     res.status(400).send({ message: 'invalid number supplied' });
   }

 });

 // app.get("/createTable", function(req, res){
 //    console.log("Connected!");
 //    var sql = "CREATE TABLE image (image_name VARCHAR(255), image_date DATE)";
 //    pool.query(sql, function (error, results, fields) {
 //      if (error) throw error;
 //    });
 // });

 app.post("/insertImage", function(req, res){
   var image = req.body.image;
   var image_name=req.body.imageName;
   var image_timestamp=req.body.imageTimestamp;
   var cam_identifier=req.body.camIdentifier;
   var num_weapons=req.body.numWeapons;

   // io.on('message', function (socket) {
   //
   //   socket.on('my other event', function (data) {
   //     console.log(data);
   //   });
   // });

   io.sockets.emit('alert', {
     message: 'new object detection alert',
     imageName: image_name,
     imageTimestamp: image_timestamp,
     numWeapons: num_weapons,
     camIdentifier: cam_identifier
   });


      pool.getConnection(function(err, connection) {
        if (err) throw err; // not connected!

        connection.query("INSERT INTO image (image_name, image_timestamp, cam_identifier, num_weapons)"+
                  " VALUES ('"+image_name+"', '"+image_timestamp+"', "+cam_identifier+", "+num_weapons+")", function (error, results, fields) {

          connection.release();

          if (error) throw error;

        });
      });

    res.send("successfully inserted 1 image");

    //upload image to s3
    var s3 = new AWS.S3();
    var base64Data = new Buffer(req.body.image, "base64");
    var params = {Bucket: 'rwds-images', Key: image_name, Body: base64Data, ContentType: 'image/jpg'};
    s3.upload(params, function(err, data) {
      //console.log(err, data);
    });




 }); //insertImage

 app.post("/deleteImage", function(req, res){
   let id = req.body.id;

   console.log("about to delete image with id "+id);

   pool.getConnection(function(err, connection) {
     if (err) throw err; // not connected!
     connection.query("SELECT image_name FROM image WHERE image_id="+id, function (error, results, fields) {
       console.log("deleting image with id"+id);
       console.log("deleting image with name"+results[0].image_name+"from AWS S3");
       //delete image from S3
       var s3 = new AWS.S3();
       var params = {  Bucket: 'rwds-images', Key: results[0].image_name };
        s3.deleteObject(params, function(err, data) {
          if (err) console.log(err, err.stack);  // error
          else     console.log("Image successfully deleted");                 // deleted
        });

       connection.release();
       if (error) throw error;
     });
   });

   pool.getConnection(function(err, connection) {
     if (err) throw err; // not connected!
     connection.query("DELETE FROM image WHERE image_id ="+id, function (error, results, fields) {
       connection.release();
       if (error) throw error;
     });
   });

   res.status(200).send("successfully deleted image with id "+id);



 }); //deleteImage


}

module.exports = appRouter;
