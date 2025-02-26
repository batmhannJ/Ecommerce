const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shopName: { type: String, required: true },
  phone: {
    type: String,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  idPicture: { type: String },
  otp: { type: String },
  businessLocation: { type: String, required: true },
});

module.exports = mongoose.model("Seller", SellerSchema);
