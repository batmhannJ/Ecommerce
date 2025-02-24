const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel");

// Fetch cart for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "No cart found for this user" });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save or update the cart for a user
router.post("/", async (req, res) => {
  const { userId, cartItems } = req.body;

  console.log("Incoming Add to Cart Request: ", { userId, cartItems }); // Debugging

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Update the existing cart
      cart.cartItems = cartItems;
      console.log("Updating existing cart for user:", userId); // Debugging
      await cart.save();
    } else {
      // Create a new cart
      cart = new Cart({
        userId,
        cartItems,
      });
      console.log("Creating new cart for user:", userId); // Debugging
      await cart.save();
    }

    res.status(200).json({ message: "Cart saved successfully" });
    console.log("Cart saved successfully for user:", userId); // Debugging
  } catch (err) {
    console.error("Error saving cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Clear the cart for a user after checkout
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOneAndDelete({ userId });
    if (!cart) {
      return res.status(404).json({ message: "No cart found to delete" });
    }
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/cart", async (req, res) => {
  const { userId, cartItems } = req.body;

  const itemsToAdd = cartItems.map((item) => ({
    productId: item.productId,
    selectedSize: item.selectedSize,
    adjustedPrice: item.adjustedPrice,
    quantity: item.quantity,
  }));

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, cartItems: itemsToAdd });
  } else {
    cart.cartItems.push(...itemsToAdd);
  }

  try {
    await cart.save();
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error saving cart:", error);
    res.status(500).json({ message: "Error saving cart", error });
  }
});

router.delete("/api/cart/:userId/:cartItemId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    // Find the cart for the user and remove the product
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the product from the cart
    cart.cartItems = cart.cartItems.filter(
      (item) => item.productId !== productId
    );
    await cart.save(); // Save the updated cart

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
