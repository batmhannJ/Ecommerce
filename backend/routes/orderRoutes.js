const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');

// POST /api/add-new-orders
router.post('/add-new-orders', async (req, res) => {
  try {
    const { userId, uidAddress, total, typePayment, products } = req.body;

    // Validate required fields
    if (!userId || !products || !Array.isArray(products) || !total || !uidAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, products, total, or uidAddress',
      });
    }

    // Map products to items (assuming ProductCart has similar fields)
    const items = products.map(product => ({
      productId: product.uidProduct,
      name: product.nameProduct,
      price: product.price,
      quantity: product.quantity,
      image: product.imageProduct,
    }));

    // Construct address object (minimal example, expand as needed)
    const address = {
      id: uidAddress,
      // Add more address details if available from your app (e.g., street, city)
    };

    // Determine payment status based on typePayment
    const paymentStatus = typePayment === 'CASH ON DELIVERY' ? false : true; // Example logic

    // Create new order
    const newOrder = new Order({
      userId,
      items,
      amount: total,
      address,
      payment: paymentStatus,
    });

    // Save to MongoDB
    const savedOrder = await newOrder.save();

    res.status(201).json({
      status: 'success',
      message: 'Order added successfully',
      data: savedOrder,
    });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add order',
    });
  }
});

module.exports = router;