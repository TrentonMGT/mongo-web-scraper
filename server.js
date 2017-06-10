//Dependencies_________________________________________
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const logger = require('morgan'); // for debugging
const request = require('request'); // for web-scraping
const cheerio = require('cheerio'); // for web-scraping

// Import the Notes and Article as Local models
const Comment = require('./models/Note.js');
const Article = require('./models/Article.js');

const port = process.env.PORT || 3000;
// Initialize Express for debugging & body parsing
var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}))

// Serve Static Content
app.use(express.static(process.cwd() + '/public'));

// Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Database Configuration with Mongoose
// ---------------------------------------------------------------------------------------------------------------
// Connect to localhost if not a production environment
if(process.env.NODE_ENV == 'production'){
  mongoose.connect('mongodb://heroku_8z2dx2j6:umq0mcg5b12k5a6450ijkhauao@ds115712.mlab.com:15712/heroku_8z2dx2j6');
}
else{
  mongoose.connect('mongodb://localhost/articleScraper');
}
var db = mongoose.connection;

// Show any Mongoose errors
db.on('error', (err) => {
  console.log('Mongoose Error: ', err);
});

// Once logged in to the db through mongoose, log a success message
db.once('open', () => {
  console.log('Mongoose connection successful.');
});


// DROP DATABASE (FOR MY PERSONAL REFERENCE ONLY - YOU CAN IGNORE)
// Article.remove({}, function(err) {
//    console.log('collection removed')
// });

// Import Routes/Controller
var router = require('./controllers/controller.js');
app.use('/', router);


//Connection
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});