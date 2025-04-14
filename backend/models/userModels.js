const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
      reference: String,
      latitude: Number,
      longitude: Number,
      country: { type: String, default: "Philippines" },
    },
    address2: {
      street: String,
      reference: String,
      latitude: Number,
      longitude: Number,
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
    lastLogin: { // Add the lastLogin field here
      type: Date,
    },
    role: { // Add role field if needed (optional, based on your frontend)
      type: String,
      default: "User",
    },
    status: { 
      type: String, 
      enum: ["Active", "Offline"], 
      default: "Offline" 
    }, // Add status field
  },
  { timestamps: true } // This adds createdAt and updatedAt
);

const Users = mongoose.model("Users", UserSchema);
  
module.exports = Users;