const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  totalAmount: {
    value: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  buyer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      amount: {
        value: { type: Number, required: true },
      },
      totalAmount: {
        value: { type: Number, required: true },
      },
    },
  ],
  redirectUrl: {
    success: { type: String, required: true },
    failure: { type: String, required: true },
    cancel: { type: String, required: true },
  },
  requestReferenceNumber: { type: String, required: true },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
