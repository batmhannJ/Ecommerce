const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  address: {
    street: String,
    barangay: String,
    municipality: String,
    province: String,
    region: String,
    zip: String,
    country: { type: String, default: "Philippines" },
  }, 
  address1: {
    street: String,
    reference: String,  // To store the full reference string
    latitude: Number,   // To store latitude as a number
    longitude: Number,  // To store longitude as a number
    country: { type: String, default: "Philippines" }, // Kept as per your original schema
  },
  address2: {
    street: String,
    reference: String,  // To store the full reference string
    latitude: Number,   // To store latitude as a number
    longitude: Number,  // To store longitude as a number
    country: { type: String, default: "Philippines" }, // Kept as per your original schema
  },
  cartData: {
    type: Object,
  },
  otp: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
