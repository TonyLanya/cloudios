var mysql = require('mysql');
// var bcrypt = require('bcrypt');
var jsonfile = require('jsonfile');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cloudios',
  insecureAuth: true
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn",err);
}
});

exports.register = function(req,res){
  // console.log("req",req.body);
  var today = new Date();
  // bcrypt.hash(req.body.password, 5, function( err, bcryptedPassword) {
   //save to db
   connection.query('SELECT * FROM users WHERE email = ?',[req.body.email], function (error, results, fields) {
     if (results.length > 0) {
      res.send({
        "code":400,
        "msg":"email already exists"
      });
     } else {
      var users={
        "first_name":req.body.first_name,
        "last_name":req.body.last_name,
        "email":req.body.email,
        "password":req.body.password,
        "created":today,
        "modified":today
      }
      connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "msg":"error ocurred"
        });
      }else{
        res.send({
          "code":200,
          "msg":"user registered sucessfully"
            });
      }
      });
     }
   });
}

exports.login = function(req,res){
  var email= req.body.email;
  var password = req.body.password;
  connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    });
    return;
  }else{
    // console.log('The solution is: ', results[0].password,req.body.password,req.body.role);
    if(results.length >0){
      if(results[0].password == password){
        var file = './userdata/userid.json'
        var obj = {email: req.body.email}
        jsonfile.writeFile(file, obj, function (err) {
          if(err){
            console.log("Error ocurred in writing json during login at login handler in login routes",err);
          }
        })
        res.send({
          "code":200,
          "success":"login sucessfull"
        });
        return;

      }
      else{
        res.send({
             "code":204,
             "success":"Email and password does not match"
        });
        return;
      }

    }
    else{
      res.send({
        "code":204,
        "success":"Email does not exits"
          });
      return;
    }
  }
  });
}
