const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
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
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
  adminuserId: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);

