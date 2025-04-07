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
  businessLocation: {
    type: String, 
    required: true
  },
  // Adding structured location data
  businessLocationDetails: {
    region: {
      code: { type: String },
      name: { type: String }
    },
    province: {
      code: { type: String },
      name: { type: String }
    },
    city: {
      code: { type: String },
      name: { type: String }
    },
    barangay: {
      code: { type: String },
      name: { type: String }
    }
  }
});

module.exports = mongoose.model("Seller", SellerSchema);