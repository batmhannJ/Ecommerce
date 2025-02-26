const Seller = require("../models/sellerModels");
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
    const { name, shopName, email, password, businessLocation } = req.body;

    let existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        errors: ["Seller already exists with this email."],
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, errors: ["ID Picture is required."] });
    }
    if (!businessLocation) {
      return res
        .status(400)
        .json({ success: false, errors: ["Business location is required."] });
    }
    if (!shopName) {
      return res
        .status(400)
        .json({ success: false, errors: ["Shop name is required."] });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSeller = new Seller({
      name,
      shopName, 
      email,
      password: hashedPassword, 
      idPicture: req.file.filename, 
      businessLocation,
      isApproved: false,
    });

    await newSeller.save();

    res.status(201).json({
      success: true,
      data: "Seller registered successfully! Waiting for admin approval.",
    });
  } catch (error) {
    console.error("Signup Controller Error:", error);
    res.status(500).json({ success: false, errors: ["Server error."] });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found." });
    }

    if (!seller.isApproved) {
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
    console.error("Error during seller login:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await Seller.find({ isApproved: false });
    res.status(200).json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateSeller = async (req, res) => {
  console.log("Received request to update seller with data:", req.body);
  console.log("Seller ID:", req.params.id);

  const { name, email, phone, shopName, businessLocation, password } = req.body;
  try {
    const updateFields = { name, email, phone, shopName, businessLocation };

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

module.exports = { signup, login, getPendingSellers, updateSeller };
