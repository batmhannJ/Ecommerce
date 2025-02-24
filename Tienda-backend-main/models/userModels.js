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
