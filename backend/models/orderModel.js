const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  }],
  amount: { type: Number, required: true },
  address: {
    id: { type: String, required: true }, // e.g., "address1"
  },
  payment: { type: Boolean, required: true },
  status: { type: String, required: true },
  dateTime: { type: Date, required: true },
});
module.exports = mongoose.model('order', orderSchema); // Capital 'O' for consistency