/*jshint node:true*/
var express = require('express'),
    mongo   = require('mongodb'),
    engines = require('consolidate'),
    cors    = require('cors');

// setup middleware
var app = express();
app.use(require('connect').bodyParser())
app.use(cors());
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.engine('html', engines.ejs);
app.set('view engine', 'html');
app.set('views', __dirname + '/public'); //optional since express defaults to CWD/views
app.all('*', function (req, res, next) {
    res.header("Access-Control-Expose-Headers", "Content-Range");
    next();
});

// render index page
app.get('/', function (req, res, next) {
    console.log("serving index");
    res.render('index');
});

var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
try {
    process.mongo_creds = services["mongodb-2.4"][0]["credentials"];
} catch (e) {
    process.mongo_creds = {
        host: "localhost",
        port: "27017",
        url: "mongodb://localhost:27017/books"
    };
}

var books = require("./controllers/Book.js")
app.get('/reset', books.reset);
app.get('/book', books.find);
app.post('/book', books.add);
app.put('/book/:id', books.update);
app.delete('/book/:id', books.delete);

var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);
app.listen(port, host);
console.log('App started on port ' + port, process.mongo_creds);