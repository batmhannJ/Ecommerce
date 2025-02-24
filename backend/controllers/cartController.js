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
        const product = await Product.findOne({ id: item.productId });
        return {
          ...item.toObject(),
          productId: item.productId.toString(), // Ensure productId is a string
          cartItemId: item.cartItemId.toString(),
          product: product
            ? {
                ...product.toObject(),
                id: product.id.toString(), // Ensure id is a string
                image: Array.isArray(product.image)
                  ? product.image
                  : [product.image || 'default.jpg'],
              }
            : null,
        };
      })
    );
    

    res.status(200).json({
      ...cart.toObject(),
      cartItems: populatedCartItems,
    });
  } catch (error) {
    console.error("Error fetching cart. Error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};


module.exports = { getCartWithProductDetails };
