var mysql = require('mysql');

var con = mysql.createConnection({
  host: "76.98.183.9",
  user: "john",
  password: "  ",
  port: 3000
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});
