const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const { signup, getPendingRiders,
} = require('../controllers/riderController');
const Rider = require('../models/riderModel');
const bcrypt = require("bcrypt"); // Add this line

const jwt = require("jsonwebtoken"); // Import jsonwebtoken here
const generateAuthToken = (seller) => {
  const token = jwt.sign({ id: seller._id }, "admin_token", {
    expiresIn: "1h",
  }); // Replace 'your_jwt_secret' with your secret key
  return token;
};
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/images/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Setup file fields for upload
const uploadFields = upload.fields([
  { name: 'idPicture', maxCount: 1 },
  { name: 'driverLicense', maxCount: 1 },
  { name: 'vehicleRegistration', maxCount: 1 }
]);

// Rider signup validation
const signupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('vehicleType').isIn(['motorcycle', 'bicycle', 'car', 'van']).withMessage('Invalid vehicle type'),
  body('plateNumber').notEmpty().withMessage('Plate number is required')
];

// Rider signup route
router.post('/signup', uploadFields, signupValidation, signup);
router.get("/pending", getPendingRiders);

router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the seller by ID and update 'isApproved' to true
    const updatedSeller = await Rider.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true } // Return the updated document
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Rider not found." });
    }

    res.status(200).json({ success: true, rider: updatedSeller });
  } catch (error) {
    console.error("Error approving rider:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});


router.get("/rider", async (req, res) => {
  try {
    const users = await Rider.find({ isApproved: true });
    res.json(users);
  } catch (error) {
    console.error("Error fetching approved sellers:", error);
    res.status(500).json({ error: "Failed to fetch approved sellers" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const seller = await Rider.findOne({ email });

    if (!seller) {
      return res
        .status(400)
        .json({ success: false, message: "Seller not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Include the isApproved status in the response
    const token = generateAuthToken(seller); // Assume you have a function to generate a JWT
    res.status(200).json({
      success: true,
      token,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        isApproved: seller.isApproved,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;