const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const AdminUser = require("../models/adminUserModel");
const {
  signup,
  login,
  getAdminById,
  updateAdmin,
  getAdmins,
  searchAdmin,
} = require("../controllers/adminController");

// router.post('/signup', signup);
router.post("/login", login);
router.post("/signup", signup); 
router.get("/admin/:id", getAdminById);
router.patch("/editadmin/:id", updateAdmin);
router.get("/admins", getAdmins);
router.get("/api/admin/search", searchAdmin);

router.delete("/deleteadmin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await AdminUser.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/approved/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const seller = await AdminUser.findOne({ _id: id, isApproved: true });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found or not approved" });
    }

    res.status(200).json(seller);
  } catch (error) {
    console.error("Error fetching approved seller:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the 'id' from the route parameters
    const deletedSeller = await AdminUser.findByIdAndDelete(id);

    if (!deletedSeller) {
      return res
        .status(404)
        .json({ success: false, errors: ["Admin not found"] });
    }

    res.json({ success: true, message: "Admin declined successfully." });
  } catch (err) {
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, errors: ["Server Error"] });
  }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Generate OTP (6 digits)
    const otp = getRandomInt(100000, 999999); // Generate 6-digit OTP
    console.log(`Generated OTP: ${otp}`);

    // Save OTP in database (optional: set expiration time)
    await AdminUser.updateOne({ email }, { otp, otpExpiry: Date.now() + 10 * 60 * 1000 }); // Expires in 10 minutes

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Error sending OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  console.log('Stored OTP:', admin.otp);
  console.log('Provided OTP:', otp);
  console.log('Expiry:', admin.otpExpiry, 'Current Time:', Date.now());
  
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    // Find admin by email
    const admin = await AdminUser.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Check OTP and expiration
    if (admin.otp === otp && admin.otpExpiry > Date.now()) {
      // Clear OTP after successful verification
      await AdminUser.updateOne({ email }, { $unset: { otp: '', otpExpiry: '' } });

      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Error verifying OTP' });
  }
});


module.exports = router;
