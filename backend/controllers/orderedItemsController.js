const Order = require("../models/orderedItemsModel");

exports.createOrderedList = async (req, res) => {
  try {
    const newOrder = new Order(req.body);

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrderedList = async (req, res) => {
  try {
    const orders = await Order.find({}).populate(
      "buyer",
      "firstName lastName contact address"
    ); // Populate the buyer fields with necessary info

    res.json({
      success: true,
      data: orders, // Include user details with orders
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

exports.getOrderedListById = async (req, res) => {
  try {
    const order = await Order.findOne({
      requestReferenceNumber: req.params.id,
    });
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderedList = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) {
      return;
      res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

exports.deleteOrderedList = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
