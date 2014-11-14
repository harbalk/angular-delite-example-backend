/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express'),
	mongo =  require('mongodb'),
	engines = require('consolidate'),
	cors = require('cors');

// setup middleware
var app = express();
app.use(require('connect').bodyParser())
app.use(cors());
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
//app.set('view engine', 'jade');
app.engine('html', engines.ejs);
app.set('view engine', 'html');
app.set('views', __dirname + '/public'); //optional since express defaults to CWD/views
app.all('*', function(req, res, next) {
  res.header("Access-Control-Expose-Headers", "Content-Range");
  next();
 });


// render index page
app.get('/', function(req, res, next){
	console.log("serving index");
	res.render('index');
});

// There are many useful environment variables available in process.env,
// please refer to the following document for detailed description:
// http://ng.w3.bluemix.net/docs/FAQ.jsp#env_var

// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
try {
	process.mongo_creds = services["mongodb-2.2"][0]["credentials"];
} catch(e) {
	process.mongo_creds = {
		host: "localhost",
		port: "27017",
		url: "mongodb://localhost:27017/books"
	};
}

var books = require("./controllers/Book.js")

app.get('/book', books.findAll);
app.post('/book', books.add);
//app.get('/book/:id', books.findById);
//app.put('/book/:id', books.update);
app.put('/book/:id', books.update);
app.delete('/book/:id', books.delete);
// TODO: Get service credentials and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port, process.mongo_creds);

