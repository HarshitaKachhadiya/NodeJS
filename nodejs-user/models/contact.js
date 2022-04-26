const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contactSchema = new Schema({
  fname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneno: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: new Date().toISOString()
  }
});

module.exports = mongoose.model('Contact', contactSchema);

