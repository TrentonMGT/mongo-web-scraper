// Node Dependencies
const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request'); // for web-scraping
const cheerio = require('cheerio'); // for web-scraping

const Comment = require('../models/Note.js');
const Article = require('../models/Article.js');

router.get('/', (req, res) => {

  res.redirect('/scrape');

});

router.get('/articles', (req, res) => {

  Article.find().sort({_id: -1}).populate('comments').exec((err, doc) => {
    // log any errors
    if (err) {
      console.log(err);
    } else {
      var hbsObject = {
        articles: doc
      }
      res.render('index', hbsObject);

    }
  });

});

router.get('/scrape', (req, res) => {

  request('https://news.ycombinator.com/', (error, response, html) => {

    var $ = cheerio.load(html);

    var titlesArray = [];

    $('.title').each((i, element) => {

      var result = {};

      result.title = $(this).children('a').text(); //convert to string for error handling later

      // Collect the Article Link (contained within the "a" tag of the "h2" in the "header" of "this")
      result.link = $(this).children('a').attr('href');

      if (result.title !== "") {

        if (titlesArray.indexOf(result.title) == -1) {

          titlesArray.push(result.title);

          Article.count({
            title: result.title
          }, function(err, test) {

            if (test == 0) {

              var entry = new Article(result);

              // Save the entry to MongoDB
              entry.save((err, doc) => {
                // log any errors
                if (err) {
                  console.log(err// or log the doc that was saved to the DB
                  );
                } else {
                  console.log(doc);
                }
              });

            } else {
              console.log('Redundant Database Content. Not saved to DB.')
            }

          });
        } else {
          console.log('Redundant Hacker News Content. Not Saved to DB.')
        }

      } else {
        console.log('Empty Content. Not Saved to DB.')
      }

    });

    res.redirect("/articles");

  });

});

router.post('/add/comment/:id', (req, res) => {

  var articleId = req.params.id;

  var commentAuthor = req.body.name;

  var commentContent = req.body.comment;

  var result = {
    author: commentAuthor,
    content: commentContent
  };

  var entry = new Comment(result);

  entry.save((err, doc) => {
    // log any errors
    if (err) {
      console.log(err// Or, relate the comment to the article
      );
    } else {

      Article.findOneAndUpdate({
        '_id': articleId
      }, {
        $push: {
          'comments': doc._id
        }
      }, {new: true}).exec((err, doc) => {

        if (err) {
          console.log(err);
        } else {

          res.sendStatus(200);
        }
      });
    }
  });

});

// Delete a Comment Route
router.post('/remove/comment/:id', (req, res) => {

  // Collect comment id
  var commentId = req.params.id;

  // Find and Delete the Comment using the Id
  Comment.findByIdAndRemove(commentId, (err, todo) => {

    if (err) {
      console.log(err);
    } else {
      // Send Success Header
      res.sendStatus(200);
    }

  });

});

// Export Router to Server.js
module.exports = router;
