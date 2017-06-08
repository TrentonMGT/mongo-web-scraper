// Require Mongoose
var mongoose = require('mongoose');

// Create a Schema Class
var Schema = mongoose.Schema;

var Comment = mongoose.model('Comment', {
  // Author's Name
  author: {
    type: String
  },
  // Comment Content
  content: {
    type: String
  }
});

module.exports = Comment;