const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  selectedSize: { type: String, required: true }, // Ensure 'size' is defined here
  adjustedPrice: { type: Number, required: true }, // Ensure 'price' is defined here
  quantity: { type: Number, required: true },
  cartItemId: { type: mongoose.Schema.Types.ObjectId, auto: true },
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartItems: [cartItemSchema], // Ensure this is an array of cart items
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
