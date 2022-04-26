const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactSchema = new Schema({
  fname: {
    type: String
  },
  email: {
    type: String
  },
  phoneno: {
    type: Number
  },
  question: {
    type: String
  },
  date: {
    type: Date
  }
});

module.exports = mongoose.model('Contact', contactSchema);

