var fs = require("fs");
var path = require('path');
var writePath = 'filestored/';
var productPath = 'ptoducts/';
var cmd = require('node-cmd');
var async = require('async');
var jsonfile = require('jsonfile');
var mysql = require('mysql');
// var bcrypt = require('bcrypt');
var jsonfile = require('jsonfile');
const PkgReader = require('reiko-parser');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'cloudios',
  password: 'mycloudios123',
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

exports.analyseapk = function (req, res) {
  var files = req.files;
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
              var bundleID = appid;
              bundleID = bundleID.replace("com.", "");
              bundleID = bundleID.replace(".", "");
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
                "modified":today
              }
              connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = "Android" AND appversionname = ?',[bundleID, appversionname], (error, results, fields) => {
                if (results.length > 0) {
                 res.send({
                   "code":400,
                   "msg":"app already published",
                   bundleid: bundleID
                 });
                } else {
                  res.send({
                    "code": 200,
                    "msg": "apk analyse sucessfully",
                    data: apk
                  });
                  // connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = "Android"',[bundleID], (error, results, fields) => {
                  //   if (results.length > 0) {
                  //     fs.unlink(writePath + bundleID + ".apk", (err) => {
                  //       console.log(err);
                  //       fs.rename(filepath, writePath + bundleID + ".apk", (err) => {
                  //         if (err){
                  //           res.send({
                  //             "code":400,
                  //             "msg":"cannot rename",
                  //               });
                  //         } else {
                  //           res.send({
                  //             "code":200,
                  //             "msg":"apk analyse sucessfully",
                  //             data: apk
                  //               });
                  //         }
                  //       });
                  //     });
                  //   } else {
                  //     fs.unlink(writePath + bundleID + ".apk", (err) => {
                  //       fs.rename(filepath, writePath + bundleID + ".apk", (err) => {
                  //         if (err){
                  //           res.send({
                  //             "code":400,
                  //             "msg":"cannot rename",
                  //               });
                  //         } else {
                  //           res.send({
                  //             "code":200,
                  //             "msg":"apk analyse sucessfully",
                  //             data: apk
                  //               });
                  //         }
                  //       });
                  //     });
                  //   }
                  // });
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

exports.analyseios = function (req, res) {
  var files = req.files;
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
              var bundleID = appid;
              bundleID = bundleID.replace("com.", "");
              bundleID = bundleID.replace(".", "");
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
                "appicon":appicon,
                "created":today,
                "modified":today
              }
              connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = "iOS" AND appversionname = ?',[bundleID, appversionname], (error, results, fields) => {
                if (results.length > 0) {
                 res.send({
                   "code":400,
                   "msg":"app already published",
                   bundleid: bundleID
                 });
                } else {
                  connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = "iOS"',[bundleID], (error, results, fields) => {
                    if (results.length > 0) {
                      fs.unlink(writePath + bundleID + ".ipa", (err) =>  {
                        console.log(err);
                        fs.rename(filepath, writePath + bundleID + ".ipa", (err) => {
                          if (err){
                            res.send({
                              "code":400,
                              "msg":"cannot rename",
                                });
                                return;
                          } else {
                            res.send({
                              "code":200,
                              "msg":"ipa analyse sucessfully",
                              data: ipa
                                });
                                return;
                          }
                        });
                      });
                    } else {
                      fs.rename(filepath, writePath + bundleID + ".ipa", (err) => {
                        if (err){
                          res.send({
                            "code":400,
                            "msg":"cannot rename",
                              });
                              return;
                        } else {
                          res.send({
                            "code":200,
                            "msg":"ipa analyse sucessfully",
                            data: ipa
                              });
                              return;
                        }
                      });
                    }
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

exports.publishapp = async function (req, res) {
  var appinfo = req.param('appinfo');
  connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ? AND appversionname = ?',[appinfo.applinkid, appinfo.platform, appinfo.appversionname], function (error, results, fields) {
    if (results.length > 0) {
     res.send({
       "code":400,
       "msg":"app already published"
     });
     return;
    } else {
      connection.query('SELECT * FROM apps WHERE applinkid = ? AND platform = ?',[appinfo.applinkid, appinfo.platform], async function (error, results, fields) {
        if (results.length > 0) {
          if (parseFloat(results[0].appversionname) < parseFloat(appinfo.appversionname) ) {
            const destPath = productPath + appinfo.applinkid + "/";
            if (! await fs.existsSync(destPath)){
              await fs.mkdirSync(destPath);
            }
            await fs.readFile(writePath + appinfo.originalname, (err, data) => {
              if (err) {
                console.log("err ocurred", err);
                res.send({
                  "code": "400",
                  "msg": "error read file"
                });
                return;
              }
            });
            const destname = '';
            if (appinfo.platform == 'Android') {
              destname = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".apk";
            } else {
              destname = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".ipa";
            }
            await fs.writeFile(destname, data, (err) => {
              if (err) {
                console.log("err ocurred", err);
                res.send({
                  "code": "400",
                  "msg": "error write file"
                });
                return;
              }
            });
            connection.query('UPDATE apps SET appversionname = ? WHERE applinkid = ? AND platform = ?', [appinfo.appversionname, appinfo.applinkid, appinfo.platform], function(err, result) {
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
          } else {
            res.send({
              "code": "200",
              "msg": "already updated"
            });
          }
        } else {
          const destPath = productPath + appinfo.applinkid + "/";
          if (! await fs.existsSync(destPath)){
            await fs.mkdirSync(destPath);
          }
          await fs.readFile(writePath + appinfo.originalname, (err, data) => {
            if (err) {
              console.log("err ocurred", err);
              res.send({
                "code": "400",
                "msg": "error read file"
              });
              return;
            }
          });
          const destname = '';
          if (appinfo.platform == 'Android') {
            destname = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".apk";
          } else {
            destname = destPath + appinfo.applinkid + "_" + appinfo.appversionname + ".ipa";
          }
          await fs.writeFile(destname, data, (err) => {
            if (err) {
              console.log("err ocurred", err);
              res.send({
                "code": "400",
                "msg": "error write file"
              });
              return;
            }
          });
          connection.query('INSERT INTO apps SET ?',appinfo, function (error, results, fields) {
            if (error) {
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
    }
  });
}

exports.getappinfo = function (req, res) {
  const applink = req.param('applink');
  const platform = req.param('platform');
  if (platform == 'Windows') {
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
  } else {
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
  }
}

exports.downloadapp = function (req, res) {
  platform = req.query.platform;
  console.log(req.props);
  if (platform == 'Android') {
    var file = writePath + req.params.applink + ".apk";
  } else if (platform == 'iOS') {
    var file = writePath + req.params.applink + ".ipa";
  }
  res.download(file); // Set disposition and send it.
}