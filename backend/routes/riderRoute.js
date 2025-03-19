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

/*router.get('/profile', async (req, res) => {
    try {
      const rider = await Rider.findById(req.user.id).select('-password');
      
      // Get today's date (start and end)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get today's deliveries count
      const todayDeliveries = await Delivery.countDocuments({
        riderId: req.user.id,
        status: 'completed',
        completedAt: { $gte: today, $lt: tomorrow }
      });
      
      // Get today's earnings
      const todayEarningsResult = await Delivery.aggregate([
        {
          $match: {
            riderId: req.user.id,
            status: 'completed',
            completedAt: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$riderPayment' }
          }
        }
      ]);
      
      const todayEarnings = todayEarningsResult.length > 0 ? todayEarningsResult[0].totalEarnings : 0;
      
      // Get rider's average rating
      const ratingResult = await Delivery.aggregate([
        {
          $match: {
            riderId: req.user.id,
            riderRating: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$riderRating' }
          }
        }
      ]);
      
      const rating = ratingResult.length > 0 ? ratingResult[0].averageRating.toFixed(1) : '0.0';
      
      // Combine all data
      const riderData = {
        ...rider.toObject(),
        todayDeliveries,
        todayEarnings,
        rating
      };
      
      res.json({ rider: riderData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get active deliveries
  router.get('/active-deliveries', async (req, res) => {
    try {
      const activeDeliveries = await Delivery.find({
        riderId: req.user.id,
        status: { $in: ['assigned', 'in_progress', 'picked_up'] }
      }).sort({ createdAt: -1 });
      
      res.json({ deliveries: activeDeliveries });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get recent deliveries
  router.get('/recent-deliveries', async (req, res) => {
    try {
      const recentDeliveries = await Delivery.find({
        riderId: req.user.id,
        status: 'completed'
      })
      .sort({ completedAt: -1 })
      .limit(5);
      
      res.json({ deliveries: recentDeliveries });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get notifications
  router.get('/notifications', async (req, res) => {
    try {
      const notifications = await Notification.find({
        riderId: req.user.id,
        read: false
      })
      .sort({ createdAt: -1 })
      .limit(10);
      
      res.json({ notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Toggle online status
  router.post('/toggle-status', async (req, res) => {
    try {
      const { isOnline } = req.body;
      
      const rider = await Rider.findByIdAndUpdate(
        req.user.id,
        { isOnline },
        { new: true }
      );
      
      res.json({ success: true, isOnline: rider.isOnline });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Start delivery
  router.post('/start-delivery/:id', async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.id);
      
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }
      
      if (delivery.riderId.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to update this delivery' });
      }
      
      delivery.status = 'in_progress';
      delivery.startedAt = new Date();
      await delivery.save();
      
      res.json({ success: true, delivery });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Complete delivery
  router.post('/complete-delivery/:id', async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.id);
      
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }
      
      if (delivery.riderId.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to update this delivery' });
      }
      
      delivery.status = 'completed';
      delivery.completedAt = new Date();
      await delivery.save();
      
      res.json({ success: true, delivery });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });*/


module.exports = router;