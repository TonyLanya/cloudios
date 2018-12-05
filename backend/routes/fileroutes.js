var fs = require("fs");
var path = require('path');
var writePath = 'filestored/';
var productPath = 'products/';
var cmd = require('node-cmd');
var async = require('async');
var jsonfile = require('jsonfile');
var mysql = require('mysql');
// var bcrypt = require('bcrypt');
var jsonfile = require('jsonfile');
var plist = require('plist');
var OSS = require('ali-oss');
var randomstring = require("randomstring");
let client = new OSS({
  region: 'oss-cn-beijing',
  accessKeyId: 'LTAIt1PD1OoGyIM6',
  accessKeySecret: '2uCvjFcqPOLsPELtNSxXzB93Ns4ut8',
  bucket: 'gamedownloads'
});
const PkgReader = require('reiko-parser');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cloudios',
  insecureAuth: true
});
connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected ... nn");
  } else {
    console.log("Error connecting database ... nn", err);
  }
});

class Database {
  constructor( config ) {
      this.connection = mysql.createConnection( config );
  }
  query( sql, args ) {
      return new Promise( ( resolve, reject ) => {
          this.connection.query( sql, args, ( err, rows ) => {
              if ( err )
                  return reject( err );
              resolve( rows );
          } );
      } );
  }
  close() {
      return new Promise( ( resolve, reject ) => {
          this.connection.end( err => {
              if ( err )
                  return reject( err );
              resolve();
          } );
      } );
  }
}

var database = new Database({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cloudios',
  insecureAuth: true
});

function makeid() {
  var text = "";
  var possibletext = "abcdefghijklmnopqrstuvwxyz";
  var possibledigit = "0123456789";

  for (var i = 0; i < 4; i++) {
      if ( i % 2 == 1) {
          text += possibledigit.charAt(Math.floor(Math.random() * possibledigit.length));
      } else {
          text += possibletext.charAt(Math.floor(Math.random() * possibletext.length));
      }
  }

  return text;
}

exports.analyseapk = function (req, res) {
  var files = req.files;
  var email = req.body.email;
  var applinkid = req.body.applinkid;
  connection.query('SELECT * FROM users WHERE email = ?',[email], (error, results, fields) => {
    if (results.length < 1) {
      res.send({
        'code':400,
        'msg': 'Email not found'
      });
    } else {
      if(files.length !== 1 ) {
        res.send({
          'code':404,
          'msg': 'Not allowed multiple files or none files'
        });
        return;
      } else {
        async.each(files, (file, eachcallback) => {
          async.waterfall([
            function (callback) {
              fs.readFile(file.path, (err, data) => {
                if (err) {
                  console.log("err ocurred1", err);
                }
                else {
                  callback(null, data);
                }
              });
            },
            function (data, callback) {
              fs.writeFile(writePath + file.originalname, data, (err) => {
                if (err) {
                  console.log("error occured2", err);
                }
                else {
                  callback(null, 'three');
                }
              });
            },
            function (arg1, callback) {
              const filepath = writePath + file.originalname;
              
              const reader = new PkgReader(filepath, 'apk', { withIcon: true });
              reader.parse((err, pkgInfo) => {
                if (err) {
                  console.error(err);
                  res.send({
                    "code":400,
                    "msg":"cannot parse apk file"
                      });
                  return;
                } else {
                  const appid = pkgInfo.package;
                  const appname = pkgInfo.application.label;
                  const appversioncode = pkgInfo.versionCode;
                  const appversionname = pkgInfo.versionName;
                  const appminversion = pkgInfo.compileSdkVersionCodename;
                  const appicon = pkgInfo.icon;
                  var today = new Date();
                  var apk={
                    "appid":appid,
                    "appname":appname,
                    "appversioncode":appversioncode,
                    "appversionname":appversionname,
                    "appminversion":appminversion,
                    "platform":"Android",
                    "appicon":appicon,
                    "originalname":file.originalname,
                    "created":today,
                    "modified":today,
                    "applinkid":applinkid
                  }
                  res.send({
                    "code": 200,
                    "msg": "apk analyse sucessfully",
                    data: apk
                  });
                }
              });
              callback(null, "done analyse files");
              //         })
            }
          ], function (err, result) {
            // result now equals 'done'
            // console.log("waterfall result",file.originalname);
            eachcallback();
          });
        }, function (err) {
          if (err) {
            console.log("error ocurred in each", err);
            res.send({
              "code":400,
              "failed":"error ocurred"
            });
            return;
          }
          else {
            console.log("finished prcessing");
          }
        });
      }
    }
  });
}

exports.analyseios = function (req, res) {
  var files = req.files;
  var email = req.body.email;
  var applinkid = req.body.applinkid;
  connection.query('SELECT * FROM users WHERE email = ?',[email], (error, results, fields) => {
    if (results.length < 1) {
      res.send({
        'code':400,
        'msg': 'Email not found'
      });
    } else {
      if(files.length !== 1 ) {
        res.send({
          'code':404,
          'msg': 'Not allowed multiple files or none files'
        });
        return;
      } else {
        async.each(files, function (file, eachcallback) {
          async.waterfall([
            function (callback) {
              fs.readFile(file.path, (err, data) => {
                if (err) {
                  console.log("err ocurred", err);
                }
                else {
                  callback(null, data);
                }
              });
            },
            function (data, callback) {
              fs.writeFile(writePath + file.originalname, data, (err) => {
                if (err) {
                  console.log("error occured", err);
                }
                else {
                  callback(null, 'three');
                }
              });
            },
            function (arg1, callback) {
              // console.log("callback recieved",arg2);
              //run printing commands here
              // cmd.get('lpr '+writePath + file.originalname,
              //         function(data){
              const filepath = writePath + file.originalname;
              
              const reader = new PkgReader(filepath, 'ipa', { withIcon: true });
              reader.parse((err, pkgInfo) => {
                if (err) {
                  console.error(err);
                  res.send({
                    "code":400,
                    "msg":"cannot parse ipa file"
                      });
                      return;
                } else {
                  const appid = pkgInfo.CFBundleIdentifier;
                  const appname = pkgInfo.CFBundleDisplayName;
                  const appversioncode = pkgInfo.DTPlatformVersion;
                  const appversionname = pkgInfo.CFBundleShortVersionString;
                  const appminversion = pkgInfo.MinimumOSVersion;
                  const appicon = pkgInfo.icon;
                  var today = new Date();
                  var ipa={
                    "appid":appid,
                    "appname":appname,
                    "appversioncode":appversioncode,
                    "appversionname":appversionname,
                    "appminversion":appminversion,
                    "platform":"iOS",
                    "originalname":file.originalname,
                    "appicon":appicon,
                    "created":today,
                    "modified":today,
                    "applinkid": applinkid
                  }
                  res.send({
                    "code": 200,
                    "msg": "ipa analyse sucessfully",
                    data: ipa
                  });
                }
              });
              callback(null, "done analyse files");
            }
          ], function (err, result) {
            eachcallback();
          });
        }, function (err) {
          if (err) {
            console.log("error ocurred in each", err);
            res.send({
              "code":400,
              "failed":"error ocurred"
            });
            return;
          }
          else {
            console.log("finished prcessing");
          }
        });
      }
    }
  });
}

exports.publishapp = async function (req, res) {
  var appinfo = req.param('appinfo');
  var email = req.param('email');
  connection.query('SELECT * FROM users WHERE email = ?',[email], (error, resultUser, fields) => {
    if (resultUser.length < 1) {
      res.send({
        'code':400,
        'msg': 'Email not found'
      });
    } else {
      // connection.query('SELECT * FROM apps WHERE appid = ? AND platform = ? AND email = ?',[appinfo.appid, appinfo.platform, appinfo.email], async function (error, results, fields) {
      //   if (results.length > 0) {
      //     if (parseFloat(results[0].appversionname) < parseFloat(appinfo.appversionname) ) {
      const userPath = productPath + email + "/";
      if (! fs.existsSync(userPath)){
        fs.mkdirSync(userPath);
      }
      const destPath = userPath + appinfo.applinkid + "/";
      if (! fs.existsSync(destPath)){
        fs.mkdirSync(destPath);
      }
      fs.readFile(writePath + appinfo.originalname, (err, data) => {
        if (err) {
          console.log("err ocurred", err);
          res.send({
            "code": "400",
            "msg": "error read file"
          });
        }
        else {
          var destname = '';
          if (appinfo.platform == 'Android') {
            destname = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".apk";
          } else {
            destname = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".ipa";
          }
          console.log(destname);
          fs.writeFile(destname, data, (err) => {
            if (err) {
              console.log("err ocurred", err);
              res.send({
                "code": "400",
                "msg": "error write file"
              });
            } else {
              var base64Data = appinfo.appicon.replace(/^data:image\/png;base64,/, "");
              const desticon = destPath + appinfo.applinkid + ".png";
              fs.writeFile(desticon, base64Data, 'base64', (err) => {
                  if (err) {
                    console.log("err");
                    res.send({
                      "code": "400",
                      "msg": "error write icon file"
                    });
                  } else {

                    if (appinfo.platform == 'iOS') {

                      var json = {
                        "items":
                          [
                          {
                            "assets":
                            [
                            {
                              "kind": "software-package",
                              "url": "http://localhost:4000/" + email + "/" + appinfo.applinkid + "/" + appinfo.applinkid + "_" + appinfo.appversionname + ".ipa"
                            },
                            {
                              "kind": "display-image",
                              "needs-shine": true,
                              "url": "http://localhost:4000<span style=\"font-family: Arial, Helvetica, sans-serif;\">/" + email + "/" + appinfo.applinkid + "/" + appinfo.applinkid + ".png" + "</string>"
                            },
                            {
                              "kind": "full-size-image",
                              "needs-shine": true,
                              "url": "http://localhost:4000/" + email + "/" + appinfo.applinkid + "/" + appinfo.applinkid + ".png"
                            }],
                            "metadata":
                            {
                              "bundle-identifier": appinfo.appid,
                              "bundle-version": appinfo.appversionname,
                              "kind": "software",
                              "subtitle": appinfo.appname,
                              "title": appinfo.appname
                            }
                          }
                          ]
                      };
                      const destplist = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".plist";
                      fs.writeFile(destplist, plist.build(json), (err) => {
                        if (err) {
                          console.log(err);
                          res.send({
                            "code": "400",
                            "msg": "error"
                          });
                        } else {
                          client.put(destplist, destplist)
                            .then((result) => {
                              const url = result.url;
                              appinfo["url"] = url;
                              connection.query('SELECT * FROM apps WHERE applinkid = ? AND email = ? AND platform = ?', [appinfo.applinkid, email, appinfo.platform], (err, results, fields) => {
                                if (err) {
                                  res.send({
                                    "code": "400",
                                    "msg": "error"
                                  });
                                } else {
                                  if (results.length > 0) {
                                    connection.query('DELETE FROM apps WHERE applinkid = ? AND email = ? AND platform = ?', [appinfo.applinkid, email, appinfo.platform], (err, results, fields) => {
                                      if (err) {
                                        res.send({
                                          "code": "400",
                                          "msg": "error"
                                        });
                                      } else {
                                        delete appinfo.originalname;
                                        appinfo["email"] = email;
                                        connection.query('INSERT INTO apps SET ?',appinfo, function (error, results, fields) {
                                          if (error) {
                                            console.log(error);
                                            res.send({
                                              "code": "400",
                                              "msg": "error"
                                            });
                                          } else {
                                            res.send({
                                              "code": "200",
                                              "msg": "success publish"
                                            });
                                          }
                                        });
                                      }
                                    });
                                  } else {
                                    delete appinfo.originalname;
                                    appinfo["email"] = email;
                                    connection.query('INSERT INTO apps SET ?',appinfo, function (error, results, fields) {
                                      if (error) {
                                        console.log(error);
                                        res.send({
                                          "code": "400",
                                          "msg": "error"
                                        });
                                      } else {
                                        res.send({
                                          "code": "200",
                                          "msg": "success publish"
                                        });
                                      }
                                    });
                                  }
                                }
                              });
                            })
                            .catch((err) => {
                              console.log(err);
                              res.send({
                                "code": "400",
                                "msg": "cannot upload to oss server"
                              });
                            });
                        }
                      });
                    } else {
                      ///android
                      connection.query('SELECT * FROM apps WHERE applinkid = ? AND email = ? AND platform = ?', [appinfo.applinkid, email, appinfo.platform], (err, results, fields) => {
                        if (err) {
                          res.send({
                            "code": "400",
                            "msg": "error"
                          });
                        } else {
                          if (results.length > 0) {
                            connection.query('DELETE FROM apps WHERE applinkid = ? AND email = ? AND platform = ?', [appinfo.applinkid, email, appinfo.platform], (err, results, fields) => {
                              if (err) {
                                res.send({
                                  "code": "400",
                                  "msg": "error"
                                });
                              } else {
                                delete appinfo.originalname;
                                appinfo["email"] = email;
                                connection.query('INSERT INTO apps SET ?',appinfo, function (error, results, fields) {
                                  if (error) {
                                    console.log(error);
                                    res.send({
                                      "code": "400",
                                      "msg": "error"
                                    });
                                  } else {
                                    res.send({
                                      "code": "200",
                                      "msg": "success publish"
                                    });
                                  }
                                });
                              }
                            });
                          } else {
                            delete appinfo.originalname;
                            appinfo["email"] = email;
                            connection.query('INSERT INTO apps SET ?',appinfo, function (error, results, fields) {
                              if (error) {
                                console.log(error);
                                res.send({
                                  "code": "400",
                                  "msg": "error"
                                });
                              } else {
                                res.send({
                                  "code": "200",
                                  "msg": "success publish"
                                });
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                });
            }
          });
        }
      });
    }
  });
}

exports.removelink = async function (req, res) {
  var applinkid = req.param('link');
  var email = req.param('email');
  connection.query('DELETE FROM apps where applinkid = ? AND email = ?', [applinkid, email], err => {
    if (err){
      res.send({
        "code": "400",
        "msg": "error"
      });
    } else {
      connection.query('DELETE FROM links where applinkid = ? AND email = ?', [applinkid, email], err => {
        if (err) {
          res.send({
            "code": "400",
            "msg": "error"
          });
        } else {
          res.send({
            "code": "200",
            "msg": "success"
          });
        }
      });
    }
  });
}

exports.checklink = function (req, res) {
  var applinkid = req.param('link');
  var email = req.param('email');
  connection.query('SELECT * FROM links WHERE applinkid = ? AND email = ?', [applinkid, email], (err, results) => {
    if (err) {
      console.log(err);
      res.send({
        "code": "400",
        "msg": "error"
      });
    } else {
      if (results.length > 0) {
        res.send({
          "code": "200",
          "msg": "not available"
        });
      } else {
        res.send({
          "code": "200",
          "msg": "available"
        });
      }
    }
  })
}

exports.createlink = function (req, res) {
  var applinkid = req.param('link');
  var email = req.param('email');
  connection.query('SELECT * FROM links WHERE applinkid = ? AND email = ?', [applinkid, email], (err, results) => {
    if (err) {
      console.log(err);
      res.send({
        "code": "400",
        "msg": "error"
      });
    } else {
      if (results.length > 0) {
        res.send({
          "code": "200",
          "msg": "not available"
        });
      } else {
        connection.query('INSERT INTO links (email, applinkid) VALUES (?, ?)',[email, applinkid], function (error) {
          if (error) {
            console.log(error);
            res.send({
              "code": "400",
              "msg": "error"
            });
          } else {
            res.send({
              "code": "200",
              "msg": "success"
            });
          }
        });
      }
    }
  })
}

exports.getappinfo = function (req, res) {
  const applink = req.param('applink');
  const platform = req.param('platform');
  if (platform == 'Android' || platform == 'iOS') {
    connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ?', [applink, platform], function (error, results, fields) {
      if (error) {
        res.send({
          "code": "400",
          "msg": "error"
        });
        return;
      } else {
        res.send({
          "code": "200",
          "msg": "success",
          "data": results
        });
        return;
      }
    });
  } else {
    connection.query('SELECT * FROM apps WHERE applinkid = ?', [applink], function (error, results, fields) {
      if (error) {
        res.send({
          "code": "400",
          "msg": "error"
        });
        return;
      } else {
        res.send({
          "code": "200",
          "msg": "success",
          "data": results
        });
        return;
      }
    });
  }
}

exports.getapps = function (req, res) {
  const email = req.param('email');
  connection.query('SELECT * FROM apps WHERE email = ?', [email], function (error, results, fields) {
    if (error) {
      res.send({
        "code": "400",
        "msg": "error"
      });
      return;
    } else {
      res.send({
        "code": "200",
        "msg": "success",
        "data": results
      });
      return;
    }
  });
}

exports.getlinks = async function (req, res) {
  const email = req.param('email');
  connection.query('SELECT * FROM links WHERE email = ?', [email], async function (error, res1, fields) {
    if (error) {
      res.send({
        "code": "400",
        "msg": "error"
      });
      return;
    } else {
      const promiseA = [];
      const promiseI = [];
      for(i=0;i<res1.length;i++){
        promiseA.push(database.query('SELECT * FROM apps WHERE email = ? AND applinkid = ? AND platform = "Android"', [email, res1[i].applinkid]));
        promiseI.push(database.query('SELECT * FROM apps WHERE email = ? AND applinkid = ? AND platform = "iOS"', [email, res1[i].applinkid]));
      }
      for(i=0;i<promiseA.length;i++){
        await Promise.resolve(promiseA[i])
        .then(response => {
          if(response.length > 0) {
            res1[i]["Android"] = response[0];
          } else {
            res1[i]["Android"] = [];
          }
        });
      }
      for(i=0;i<promiseI.length;i++){
        await Promise.resolve(promiseI[i])
        .then(response => {
          if(response.length > 0) {
            res1[i]["iOS"] = response[0];
          } else {
            res1[i]["iOS"] = [];
          }
        });
      }
      res.send({
        "code": "200",
        "msg": "success",
        "res": res1
      });
      // Promise.all(promises)
      // .then((response1, response2) => {
      //   res.send({
      //     "code": "200",
      //     "msg": "success",
      //     "data1": response1,
      //     "data1": response2,
      //     "res": res1
      //   });
      // })
      return;
    }
  });
}

exports.downloadapp = function (req, res) {
  platform = req.query.platform;
  console.log(req.params.applink);
  console.log(platform);
  if (platform == 'Android') {
    connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ?', [req.params.applink, 'Android'], function (error, results, fields) {
      if (error) {
        res.send({
          "code": "400",
          "msg": "error"
        });
        return;
      } else {
        var file = productPath + results[0].applinkid + "/" + results[0].applinkid + "_" + results[0].appversionname + ".apk";
        res.download(file);
      }
    });
  } else if (platform == 'iOS') {
    connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ?', [req.params.applink, 'iOS'], function (error, results, fields) {
      if (error) {
        console.log(error);
        res.send({
          "code": "400",
          "msg": "error"
        });
        return;
      } else {
        var file = productPath + results[0].applinkid + "/" + results[0].applinkid + "_" + results[0].appversionname + ".plist";
        console.log(file);
        res.download(file);
      }
    });
  }
}

exports.downloadIPA = function (req, res) {
  connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ?', [req.params.applink, 'iOS'], function (error, results, fields) {
    if (error) {
      res.send({
        "code": "400",
        "msg": "error"
      });
      return;
    } else {
      var file = productPath + results[0].applinkid + "/" + results[0].applinkid + "_" + results[0].appversionname + ".ipa";
      res.download(file);
    }
  });
}

exports.downloadIPAIcon = function (req, res) {
  connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ?', [req.params.applink, 'iOS'], function (error, results, fields) {
    if (error) {
      res.send({
        "code": "400",
        "msg": "error"
      });
      return;
    } else {
      var file = productPath + results[0].applinkid + "/" + results[0].applinkid + ".png";
      res.download(file);
    }
  });
}