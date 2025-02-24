const express = require("express");
const router = express.Router();
const { updateProductStock } = require("../controllers/productController");
const Product = require("../models/productModels");

// Route to update stock levels
router.post("/updateStock", async (req, res) => {
  try {
    const { updates } = req.body;

    for (const { id, size, quantity } of updates) {
      await updateProductStock(id, size, quantity);
    }

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Failed to update stock" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ message: "Failed to retrieve products" });
  }
});

module.exports = router;
