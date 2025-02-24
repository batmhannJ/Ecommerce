const Users = require("../models/userModels"); // Adjust the path to your User model

// Get all users (or search users based on a term)
const getUsers = async (req, res) => {
  try {
    const term = req.query.term || ""; // Get search term from query or default to empty string

    // Example search logic (case-insensitive)
    const users = await Users.find({
      $or: [{ name: new RegExp(term, "i") }, { email: new RegExp(term, "i") }],
    });

    res.json(users); // Send the found users
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

module.exports = {
  getUsers,
};
