const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Product = require("../models/productModels");

const getCartWithProductDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const populatedCartItems = await Promise.all(
      cart.cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);

        // If the product is deleted, return null
        if (!product) return null;

        return {
          ...item.toObject(),
          productId: item.productId.toString(), // Ensure productId is a string
          cartItemId: item.cartItemId.toString(),
          product: {
            ...product.toObject(),
            id: product.id.toString(), // Ensure id is a string
            image: Array.isArray(product.image)
              ? product.image
              : [product.image || "default.jpg"],
          },
        };
      })
    );

    // Filter out null values (deleted products)
    const validCartItems = populatedCartItems.filter((item) => item !== null);

    // If there are invalid items, update the cart in the database
    if (validCartItems.length !== cart.cartItems.length) {
      await Cart.updateOne({ userId }, { cartItems: validCartItems });
    }

    res.status(200).json({
      ...cart.toObject(),
      cartItems: validCartItems, // Only valid items are returned
    });
  } catch (error) {
    console.error("Error fetching cart. Error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

module.exports = { getCartWithProductDetails };
