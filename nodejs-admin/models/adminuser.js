const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminuserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneno: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
  resetToken: String,
  resetTokenExpiration: Date,
});


module.exports = mongoose.model("AdminUser", adminuserSchema);
