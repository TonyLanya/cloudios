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
                  // var base64Data = pkgInfo.icon.replace(/^data:image\/png;base64,/, "");
                  const appid = pkgInfo.package;
                  var applinkid = makeid();
                  // bundleID = bundleID.replace("com.", "");
                  // bundleID = bundleID.replace(".", "");
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
                  connection.query('SELECT * FROM apps WHERE appid = ? AND platform = "Android" AND appversionname = ? AND email = ?',[appid, appversionname, email], (error, results, fields) => {
                    if (results.length > 0) {
                     res.send({
                       "code":400,
                       "msg":"app already published",
                       "applinkid" : results[0].applinkid
                     });
                    } else {
                      res.send({
                        "code": 200,
                        "msg": "apk analyse sucessfully",
                        data: apk
                      });
                    }
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
                  // var base64Data = pkgInfo.icon.replace(/^data:image\/png;base64,/, "");
                  const appid = pkgInfo.CFBundleIdentifier;
                  // var bundleID = appid;
                  // bundleID = bundleID.replace("com.", "");
                  // bundleID = bundleID.replace(".", "");
                  var applinkid = makeid();
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
                  connection.query('SELECT * FROM apps WHERE appid = ? AND platform = "iOS" AND appversionname = ? AND email = ?',[appid, appversionname, email], (error, results, fields) => {
                    if (results.length > 0) {
                     res.send({
                       "code":400,
                       "msg":"app already published",
                       "applinkid": results[0].applinkid
                     });
                    } else {
                      res.send({
                        "code": 200,
                        "msg": "ipa analyse sucessfully",
                        data: ipa
                      });
                    }
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
      connection.query('SELECT * FROM apps WHERE appid = ? AND platform = ? AND appversionname = ? AND email = ?',[appinfo.appid, appinfo.platform, appinfo.appversionname, appinfo.email], function (error, results, fields) {
        if (results.length > 0) {
         res.send({
           "code":400,
           "msg":"app already published"
         });
         return;
        } else {
          connection.query('SELECT * FROM apps WHERE appid = ? AND platform = ? AND email = ?',[appinfo.appid, appinfo.platform, appinfo.email], async function (error, results, fields) {
            if (results.length > 0) {
              if (parseFloat(results[0].appversionname) < parseFloat(appinfo.appversionname) ) {
                const userPath = productPath + resultUser[0].email + "/";
                if (! fs.existsSync(userPath)){
                  fs.mkdirSync(userPath);
                }
                const destPath = userPath + appinfo.applinkid + "/";
                if (! fs.existsSync(destPath)){
                  fs.mkdirSync(destPath);
                }
                console.log(writePath + appinfo.originalname);
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
                                        "url": "http://localhost:4000/" + appinfo.applinkid + "/" + appinfo.applinkid + "_" + appinfo.appversionname + ".ipa"
                                      },
                                      {
                                        "kind": "display-image",
                                        "needs-shine": true,
                                        "url": "http://localhost:4000<span style=\"font-family: Arial, Helvetica, sans-serif;\">/" + appinfo.applinkid + "/" + appinfo.applinkid + ".png" + "</string>"
                                      },
                                      {
                                        "kind": "full-size-image",
                                        "needs-shine": true,
                                        "url": "http://localhost:4000/" + appinfo.applinkid + "/" + appinfo.applinkid + ".png"
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
                                        connection.query('UPDATE apps SET appversionname = ?, url = ? WHERE appid = ? AND platform = ? AND email = ?', [appinfo.appversionname, url, appinfo.appid, appinfo.platform, appinfo.email], function(err, result) {
                                          if (err) {
                                            res.send({
                                              "code": "400",
                                              "msg": "error"
                                            });
                                          } else {
                                            res.send({
                                              "code": "200",
                                              "msg": "success update version"
                                            });
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
                                connection.query('UPDATE apps SET appversionname = ? WHERE appid = ? AND platform = ? AND email = ?', [appinfo.appversionname, appinfo.applinkid, appinfo.platform, appinfo.email], function(err, result) {
                                  if (err) {
                                    res.send({
                                      "code": "400",
                                      "msg": "error"
                                    });
                                  } else {
                                    res.send({
                                      "code": "200",
                                      "msg": "success update version"
                                    });
                                  }
                                });
                              }
                            }
                          });
                      }
                    });
                  }
                });
              } else {
                res.send({
                  "code": "200",
                  "msg": "already updated"
                });
              }
            } else {
              const userPath = productPath + resultUser[0].email + "/";
              if (! fs.existsSync(userPath)){
                fs.mkdirSync(userPath);
              }
              const destPath = userPath + appinfo.applinkid + "/";
              if (! fs.existsSync(destPath)){
                fs.mkdirSync(destPath);
              }
              console.log(writePath + appinfo.originalname);
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
                      fs.writeFile(desticon, base64Data, 'base64', function(err) {
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
                                    "url": "http://localhost:4000/" + appinfo.applinkid + "/" + appinfo.applinkid + "_" + appinfo.appversionname + ".ipa"
                                  },
                                  {
                                    "kind": "display-image",
                                    "needs-shine": true,
                                    "url": "http://localhost:4000<span style=\"font-family: Arial, Helvetica, sans-serif;\">/" + appinfo.applinkid + "/" + appinfo.applinkid + ".png" + "</string>"
                                  },
                                  {
                                    "kind": "full-size-image",
                                    "needs-shine": true,
                                    "url": "http://localhost:4000/" + appinfo.applinkid + "/" + appinfo.applinkid + ".png"
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
                                      delete appinfo.originalname;
                                      appinfo["url"] = url;
                                      appinfo["email"] = resultUser[0].email;
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
                              delete appinfo.originalname;
                              appinfo["email"] = resultUser[0].email;
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
                  });
                }
              });
            }
          });
        }
      });
    }
  });
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