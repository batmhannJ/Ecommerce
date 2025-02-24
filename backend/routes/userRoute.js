const express = require("express");
const router = express.Router();
const Users = require("../models/userModels");
const authMiddleware = require("../middleware/auth");
const { getUsers } = require("../controllers/userController"); // Adjust path as needed

router.post("/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  // First, check if the CAPTCHA token is present
  if (!recaptchaToken) {
    return res
      .status(400)
      .json({ success: false, errors: "Please complete the CAPTCHA." });
  }

  const secretKey = "6LcCKEcqAAAAAPPobVGRQtrDKHWj50SLLr2WzCUV"; // Your reCAPTCHA secret key
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
  try {
    // Verify reCAPTCHA
    const captchaResponse = await axios.post(verificationUrl);
    console.log("CAPTCHA response:", captchaResponse.data);
    const { success: captchaSuccess } = captchaResponse.data;

    if (!captchaSuccess) {
      return res
        .status(400)
        .json({ success: false, errors: "CAPTCHA verification failed." });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, errors: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, errors: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
});

// Route to get user data
/*router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);  // req.user.id comes from the middleware
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ 
            name: user.name, 
            phone: user.phone, 
            email: user.email 
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});*/

router.get("/api/users/search", getUsers);

// Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Edit user
router.patch("/edituser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await Users.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Update user details
router.patch("/edituser-mobile/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body; // Destructure the user data from the request body

  try {
    // Update the user in the database
    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { name, phone, email }, // Update only the provided fields
      { new: true } // Return the updated document
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the updated user back as a response
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/deleteuser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Users.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Add this route to your existing router file

router.patch("/edituser/address", async (req, res) => {
  const { userId, addressData } = req.body;

  // Validate userId
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    // Update the user's address
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { address: addressData }, // Assuming your schema has an 'address' field
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route to get user details by ID
router.get("/get-user-details/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await Users.findById(userId).select("name email phone"); // Select only the needed fields

    if (user) {
      return res.status(200).json({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
