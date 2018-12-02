var express    = require("express");
var login = require('./routes/loginroutes');
var upload = require('./routes/fileroutes');
var bodyParser = require('body-parser');
/*
Module:multer
multer is middleware used to handle multipart form data
*/
var multer = require('multer');
var multerupload2 = multer({ dest: 'publishapp/' });
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var router = express.Router();

// test route
router.get('/', function(req, res) {
    res.json({ message: 'welcome to our upload module apis' });
});

//route to handle user registration
router.post('/register',login.register);
router.post('/login',login.login);
//route to handle file printing and listing
router.post('/analyseapk',multerupload2.any(), upload.analyseapk);
router.post('/analyseios',multerupload2.any(), upload.analyseios);
router.post('/publishapp', upload.publishapp);
router.get('/:applink', upload.downloadapp);
router.post('/getappinfo', upload.getappinfo);
router.get('/getipa/:applink', upload.downloadIPA);
router.get('/getipaicon/:applink', upload.downloadIPAIcon);
app.use('/api', router);
app.listen(4000);