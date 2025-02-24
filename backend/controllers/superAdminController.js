const express = require("express"); // Import express
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SuperAdminUser = require("../models/superAdminModel");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();
const { ObjectId } = require('mongodb');
const AdminUser = require("../models/adminUserModel");

const router = express.Router(); // Create a new router

const approveAdmin = async (req, res) => {
    try {
      const { adminId } = req.params;
  
      const admin = await AdminUser.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, errors: ["Admin not found."] });
      }
  
      admin.isApproved = true;
      await admin.save();
  
      res.status(200).json({ success: true, data: "Admin approved successfully!" });
    } catch (error) {
      console.error("Approve Admin Error:", error);
      res.status(500).json({ success: false, errors: ["Server error."] });
    }
  };

  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log("Email from request:", email);
      console.log("Sanitized email:", email.trim());

      console.log("Password from request:", password);
  
      // Search for admin in the database
      const admin = await SuperAdminUser.findOne({
        email: { $regex: `^${email.trim()}$`, $options: "i" }
      });
      
      console.log("Admin Retrieved:", admin);
  
      if (!admin) {
        return res
          .status(400)
          .json({ success: false, errors: "Invalid email or password" });
      }
  
      if (password !== admin.password) {
        return res
          .status(400)
          .json({ success: false, errors: "Invalid email or password" });
      }
  
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.json({ success: true, token, adminId: admin._id });
    } catch (error) {
      console.error("Login Error:", error);
      res
        .status(500)
        .json({ success: false, errors: "An error occurred during login" });
    }
  };
  
  
  const getsuperAdminById = async (req, res) => {
    const userId = req.params.id;
    
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Correct way to create an ObjectId instance
      const admin = await SuperAdminUser.findById(new ObjectId(userId));
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.json(admin);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  const updateSuperAdmin = async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      // Create an object to hold the update fields
      const updateFields = { name, email, phone };
  
      // Only add password if it exists in the request body
      if (password) {
        updateFields.password = password; // Handle password hashing if needed
      }
  
      const updatedAdmin = await SuperAdminUser.findByIdAndUpdate(
        req.params.id,
        updateFields, // Use the constructed object
        { new: true } // This option returns the updated document
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      res.json(updatedAdmin);
    } catch (error) {
      console.error("Error updating admin:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  
const getPendingAdmins = async (req, res) => {
  try {
    // Fetch all sellers where 'isApproved' is false
    const pendingSellers = await AdminUser.find({ isApproved: false });
    res.status(200).json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
  
  module.exports = {
    login,
    approveAdmin, // Export the router so it can be used in the routes
    getsuperAdminById,
    updateSuperAdmin,
    getPendingAdmins,
  };