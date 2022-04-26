const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  fname: {
    type: String
  },
  email: {
    type: String
  },
  phoneno: {
    type: Number
  },
  message: {
    type: String
  },
  date: {
    type: Date
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

