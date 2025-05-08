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

/*const getUserCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // First, find the cart for this user
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ userId, cartItems: [] });
      await cart.save();
    }
    
    // Create an array to store cart items with their product details
    const populatedCartItems = [];
    
    // Populate each cart item with product details
    for (const item of cart.cartItems) {
      try {
        let productId = item.productId;
        
        // Check if productId is a valid ObjectId, if not, handle appropriately
        let product;
        
        if (mongoose.Types.ObjectId.isValid(productId)) {
          // If it's a valid ObjectId, query directly
          product = await Product.findById(productId);
        } else {
          // If it's not a valid ObjectId (like a number), try to find by numeric ID if you have a field for that
          // Assuming you have a 'numericId' field in your Product model
          product = await Product.findOne({ numericId: Number(productId) });
          
          // If you don't have a separate field, you might need to implement a different query strategy
          // For example: product = await Product.findOne({ someOtherField: productId });
        }
        
        if (product) {
          // Add product details to cart item
          populatedCartItems.push({
            cartItemId: item._id,
            productId: item.productId,
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            adjustedPrice: item.adjustedPrice,
            product: product
          });
        } else {
          // Product not found, but still include cart item with minimal info
          populatedCartItems.push({
            cartItemId: item._id,
            productId: item.productId,
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            adjustedPrice: item.adjustedPrice,
            product: null // No product found
          });
          console.log(`Product with ID ${productId} not found`);
        }
      } catch (err) {
        console.error(`Error processing cart item with productId ${item.productId}:`, err);
        // Still include the item, but with null for product
        populatedCartItems.push({
          cartItemId: item._id,
          productId: item.productId,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          adjustedPrice: item.adjustedPrice,
          product: null
        });
      }
    }
    
    res.status(200).json({
      cartItems: populatedCartItems,
      _id: cart._id
    });
    
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};*/

exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ user: userId }).populate('cartItems.productId');
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // This line might be causing the issue if productId is a number
    const cartItems = await Promise.all(
      cart.cartItems.map(async (item) => {
        const product = await Product.findOne({ _id: item.productId }); // Error here
        return {
          productId: item.productId,
          selectedSize: item.selectedSize,
          adjustedPrice: item.adjustedPrice,
          quantity: item.quantity,
          cartItemId: item._id,
          product: product,
        };
      })
    );

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

module.exports = { getCartWithProductDetails };
