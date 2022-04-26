const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String
  },
  category: {
    type: String
  },
  subcategory: {
    type: String
  },
  size: {
    type: String
  },
  color: {
    type: String
  },
  actprice: {
    type: Number
  },
  price: {
    type: Number
  },
  discount: {
    type: Number
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  date: {
    type: Date
  }
});

module.exports = mongoose.model('Product', productSchema);

