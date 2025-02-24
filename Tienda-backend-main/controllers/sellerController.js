// controllers/sellerController.js
const Seller = require("../models/sellerModels");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Signup Controller
const signup = async (req, res) => {
  // Handle validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract error messages
    const extractedErrors = errors.array().map((err) => err.msg);
    return res.status(400).json({ success: false, errors: extractedErrors });
  }

  try {
    const { name, email, password } = req.body;

    // Check for existing seller
    let existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res
        .status(400)
        .json({
          success: false,
          errors: ["Seller already exists with this email."],
        });
    }

    // Validate that all fields are provided
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, errors: ["ID Picture is required."] });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new seller
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      idPicture: req.file.filename, // Store the filename
      isApproved: false, // Default to not approved
    });

    await newSeller.save();

    res
      .status(201)
      .json({
        success: true,
        data: "Seller registered successfully! Waiting for admin approval.",
      });
  } catch (error) {
    console.error("Signup Controller Error:", error); // Enhanced error logging
    res.status(500).json({ success: false, errors: ["Server error."] });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the seller by email
    const seller = await Seller.findOne({ email });

    // Check if seller exists
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    // Check if the seller is approved
    if (!seller.isApproved) {
      return res
        .status(403)
        .json({ success: false, message: "Seller is not approved." });
    }

    // Validate password (assuming you have a method to compare passwords)
    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }

    // Create a token or session and send response
    res.status(200).json({ success: true, seller });
  } catch (error) {
    console.error("Error during seller login:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getPendingSellers = async (req, res) => {
  try {
    // Fetch all sellers where 'isApproved' is false
    const pendingSellers = await Seller.find({ isApproved: false });
    res.status(200).json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateSeller = async (req, res) => {
  console.log("Received request to update seller with data:", req.body); // Log incoming data
  console.log("Seller ID:", req.params.id); // Log the seller ID

  const { name, email, phone, password } = req.body;
  try {
    const updateFields = { name, email, phone };

    // Hash password if present
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

    console.log("Seller updated successfully:", updatedSeller); // Log updated seller
    res.json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, getPendingSellers, updateSeller };
