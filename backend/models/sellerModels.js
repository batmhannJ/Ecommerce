// models/sellerModels.js
const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: {
    type: String,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false }, // Admin approval field
  idPicture: { type: String }, // Field for storing uploaded ID picture path
  otp: { type: String }, // Field to store OTP temporarily
});

module.exports = mongoose.model("Seller", SellerSchema);
