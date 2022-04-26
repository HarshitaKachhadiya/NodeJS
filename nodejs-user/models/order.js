const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    phoneno: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    },
  },
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("Order", orderSchema);
