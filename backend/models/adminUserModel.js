const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    isApproved: { 
      type: Boolean, 
      default: false },
    },
  { timestamps: true }
);

module.exports = mongoose.model("AdminUser", adminUserSchema);
