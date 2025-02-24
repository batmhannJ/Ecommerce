const express = require("express");
const router = express.Router();
const AdminUser = require("../models/adminUserModel");

const {
  approveAdmin,
  login,
  getsuperAdminById,
  updateSuperAdmin,
  getPendingAdmins,
} = require("../controllers/superAdminController");

// router.post('/signup', signup);
router.post("/login", login);
router.patch("/approve/:adminId", approveAdmin); // Add this line for approving admins
router.get("/superadmin/:id", getsuperAdminById);
router.patch("/editsuperadmin/:id", updateSuperAdmin);
router.get("/pending", getPendingAdmins);
router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the seller by ID and update 'isApproved' to true
    const updatedSeller = await AdminUser.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true } // Return the updated document
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found." });
    }

    res.status(200).json({ success: true, seller: updatedSeller });
  } catch (error) {
    console.error("Error approving admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});
module.exports = router;
