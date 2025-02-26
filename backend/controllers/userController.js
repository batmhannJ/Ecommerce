const Users = require("../models/userModels"); 

const getUsers = async (req, res) => {
  try {
    const term = req.query.term || ""; 
    const users = await Users.find({
      $or: [{ name: new RegExp(term, "i") }, { email: new RegExp(term, "i") }],
    });

    res.json(users); 
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

module.exports = {
  getUsers,
};
