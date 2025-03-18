const Rider = require('../models/riderModel');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => err.msg);
      return res.status(400).json({ success: false, errors: extractedErrors });
    }
  
    try {
      const { 
        name, 
        email, 
        password, 
        contactNumber, 
        address, 
        vehicleType, 
        plateNumber 
      } = req.body;
  
      // Check if rider already exists
      let existingRider = await Rider.findOne({ email });
      if (existingRider) {
        return res.status(400).json({
          success: false,
          errors: ["Rider already exists with this email."]
        });
      }
  
      // Validate required files
      if (!req.files || !req.files.idPicture) {
        return res.status(400).json({ 
          success: false, 
          errors: ["ID Picture is required."] 
        });
      }
  
      if (!req.files.driverLicense) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Driver's license is required."] 
        });
      }
  
      if (!req.files.vehicleRegistration) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Vehicle registration is required."] 
        });
      }
  
      // Validate required fields
      if (!vehicleType) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Vehicle type is required."] 
        });
      }
  
      if (!plateNumber) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Plate number is required."] 
        });
      }
  
      if (!address) {
        return res.status(400).json({ 
          success: false, 
          errors: ["Address is required."] 
        });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new rider
      const newRider = new Rider({
        name,
        email,
        password: hashedPassword,
        contactNumber,
        address,
        idPicture: req.files.idPicture[0].filename,
        driverLicense: req.files.driverLicense[0].filename,
        vehicleType,
        plateNumber,
        vehicleRegistration: req.files.vehicleRegistration[0].filename,
        isApproved: false
      });
  
      await newRider.save();
  
      res.status(201).json({
        success: true,
        data: "Rider registered successfully! Waiting for admin approval."
      });
    } catch (error) {
      console.error("Rider Signup Controller Error:", error);
      res.status(500).json({ success: false, errors: ["Server error."] });
    }
  };


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const rider = await Rider.findOne({ email });

    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    if (!rider.isApproved) {
      return res
        .status(403)
        .json({ success: false, message: "Seller is not approved." });
    }

    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }

    res.status(200).json({ success: true, seller });
  } catch (error) {
    console.error("Error during rider login:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getPendingRiders = async (req, res) => {
  try {
    const pendingRiders = await Rider.find({ isApproved: false });
    res.status(200).json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending riders:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateRider = async (req, res) => {
  console.log("Received request to update rider with data:", req.body);
  console.log("Rider ID:", req.params.id);

  const { name, email, phone, shopName, businessLocation, password } = req.body;
  const idPicture = req.file ? req.file.filename : null;

  try {
    const updateFields = { name, email, phone, shopName, businessLocation};

    if (idPicture) {
      updateFields.idPicture = idPicture;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    console.log("Seller updated successfully:", updatedSeller); 
    res.json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, getPendingRiders, updateRider };
