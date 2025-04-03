const express = require("express");
const router = express.Router();
const Transaction = require("../models/transactionModel");
const Product = require("../models/productModels"); // Import the Product model
const mongoose = require("mongoose");  // Add this line

router.get("/totalAmount", async (req, res) => {
  try {
    console.log("Received request for totalAmount");

    const transactions = await Transaction.find({});
    console.log(`Fetched ${transactions.length} transactions`);

    if (!transactions.length) {
      console.log("No transactions found, returning 0");
      return res.json(0); // Return 0 if no transactions found
    }

    const totalAmount = transactions.reduce((total, transaction) => {
      const amount = Number(transaction.amount);
      if (isNaN(amount)) {
        console.warn(
          `Invalid amount for transaction ID ${transaction.transactionId}:`,
          transaction.amount
        );
        return total;
      }
      return total + amount;
    }, 0);

    console.log(`Calculated totalAmount: ${totalAmount}`);
    res.json(totalAmount); // Send the calculated total amount
  } catch (error) {
    console.error("Error in /transactions/totalAmount route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/averageOrderValue", async (req, res) => {
  try {
    console.log("Received request for averageOrderValue");

    const result = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          averageOrderValue: { $avg: "$amount" },
        },
      },
    ]);

    const averageOrderValue =
      result.length > 0 ? result[0].averageOrderValue : 0;

    console.log(`Calculated averageOrderValue: ${averageOrderValue}`);
    res.json(averageOrderValue);
  } catch (error) {
    console.error("Error in /transactions/averageOrderValue route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/mostProducedProduct", async (req, res) => {
  try {
    console.log("Received request for mostProducedProduct");

    const result = await Transaction.aggregate([
      {
        $group: {
          _id: "$item", // Group by product
          totalQuantity: { $sum: "$quantity" }, // Sum of quantities
        },
      },
      {
        $sort: { totalQuantity: -1 }, // Sort by totalQuantity in descending order
      },
      {
        $limit: 1, // Limit to the top result
      },
    ]);

    const mostProducedProduct = result.length > 0 ? result[0]._id : "N/A";

    console.log(`Most Produced Product: ${mostProducedProduct}`);
    res.json(mostProducedProduct);
  } catch (error) {
    console.error("Error in /transactions/mostProducedProduct route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get sales by product
router.get("/salesByProduct", async (req, res) => {
  try {
    // Aggregate sales by product
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: "$item", // Group by product
          totalSales: { $sum: "$amount" }, // Sum of amounts
        },
      },
      {
        $sort: { totalSales: -1 }, // Sort by totalSales in descending order
      },
    ]);

    // Map the result to the format needed for the frontend
    const salesByProduct = result.map((item) => ({
      product: item._id,
      totalSales: item.totalSales,
    }));

    console.log("Sales by Product:", salesByProduct);
    res.json(salesByProduct);
  } catch (error) {
    console.error("Error in /transactions/salesByProduct route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//SALES BY CATEGORY
router.get("/salesByCategory", async (req, res) => {
  try {
    // Step 1: Get all transactions
    const transactions = await Transaction.find({});

    // Step 2: Map item names to categories
    const itemNames = transactions.map((transaction) => transaction.item);
    const products = await Product.find({ name: { $in: itemNames } });

    // Create a map of item names to categories
    const itemToCategory = {};
    products.forEach((product) => {
      itemToCategory[product.name] = product.category;
    });

    // Step 3: Aggregate sales by category
    const categorySales = transactions.reduce((acc, transaction) => {
      const category = itemToCategory[transaction.item] || "Unknown"; // Default to 'Unknown' if category is not found
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});

    // Convert to array of objects
    const salesByCategory = Object.entries(categorySales).map(
      ([category, totalSales]) => ({
        category,
        totalSales,
      })
    );

    console.log("Sales by Category:", salesByCategory);
    res.json(salesByCategory);
  } catch (error) {
    console.error("Error in /transactions/salesByCategory route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get weekly sales growth
// Route to get daily sales growth
router.get("/salesGrowthRate", async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $project: {
          day: { $dayOfMonth: "$date" },
          month: { $month: "$date" },
          year: { $year: "$date" },
          totalSales: "$amount",
        },
      },
      {
        $group: {
          _id: { day: "$day", month: "$month", year: "$year" },
          totalSales: { $sum: "$totalSales" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }, // Sort by year, month, and day
      },
    ]);

    const salesGrowthRate = result.map((item) => ({
      date: `${item._id.year}-${item._id.month
        .toString()
        .padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`, // Format date as YYYY-MM-DD
      totalSales: item.totalSales,
    }));

    console.log("Daily Sales Growth Rate:", salesGrowthRate);
    res.json(salesGrowthRate);
  } catch (error) {
    console.error("Error in /transactions/salesGrowthRate route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get top purchases product
router.get("/topPurchasesProduct", async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $unwind: "$items" }, // Unwind items array
      {
        $group: {
          _id: "$items.name",
          totalPurchases: { $sum: "$items.quantity" },
        },
      }, // Group by item name and sum quantities
      { $sort: { totalPurchases: -1 } }, // Sort in descending order
      { $limit: 5 }, // Limit to top 5 items
    ]);

    console.log("Top Purchases Product Result:", result); // Log result for debugging

    // Check if result is empty
    if (result.length === 0) {
      console.log("No items found in the database for top purchases product.");
    }

    const topPurchasesProduct = result.map((item) => ({
      product: item._id || "Unknown",
      totalPurchases: item.totalPurchases,
    }));

    res.json(topPurchasesProduct);
  } catch (error) {
    console.error("Error in /transactions/topPurchasesProduct route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/api/transactions", async (req, res) => {
  try {
    const {
      date,
      name,
      contact,
      item,
      quantity,
      amount,
      address,
      transactionId,
      status,
      userId,
    } = req.body;

    // Create a new transaction record
    const transaction = new Transaction({
      date,
      name,
      contact,
      item,
      quantity,
      amount,
      address,
      transactionId,
      status,
      userId,
    });

    const savedOrder = await transaction.save();
    
    // Broadcast the new pending order to all connected riders
    io.emit("newPendingOrder", savedOrder);

    await transaction.save();
    console.log("Saved Transaction:", transaction);

    res
      .status(201)
      .json({ success: true, message: "Transaction saved successfully." });
  } catch (error) {
    console.error("Error saving transaction:", error);
    res
      .status(500)
      .json({ success: false, message: "Error saving transaction." });
  }
});

// POST transaction route
router.post("/", async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET transactions route
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).send(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
});


// DELETE specific transaction by ID route
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Transaction deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting transaction." });
  }
});

router.post("/updateTransactionStatus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionId: id },
      { $set: { status: status } }
    );

    if (!updatedTransaction) {
      return res.status(666).json({ message: "Transaction not found" });
    }

    res.json({
      message: "Transaction status updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/userTransactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Sort transactions by date in descending order (latest first)
    const transactions = await Transaction.find({ userId: userId })
      .sort({ date: -1 });

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this user" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/pendingOrders', async (req, res) => {
  try {
    console.log('Attempting to fetch pending orders');
    // Check if mongoose is connected
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    const orders = await Transaction.find({ 
      status: 'Cart Processing',
    });
    console.log('Retrieved pending orders:', orders ? orders.length : 'none');
    res.json(orders);
  } catch (error) {
    console.error('Error in pendingOrders:', error);
    res.status(500).json({ message: error.message });
  }
});

// The other two endpoints should look similar
router.get('/to-deliver', async (req, res) => {
  try {
    const orders = await Transaction.find({ 
      status: 'Out for Delivery', // or whatever status you use
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/delivered', async (req, res) => {
  try {
    const orders = await Transaction.find({ 
      status: 'Delivered', // or whatever status you use
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/delivered/today/count', async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find delivered orders from today only
    const count = await Transaction.countDocuments({
      status: 'Delivered',
      deliveredAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.json({ 
      count: count,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error counting today\'s delivered orders:', error);
    res.status(500).json({ message: error.message });
  }
});
  
  // Update order status
  router.put('/:orderId/status', async (req, res) => {
    try {
      const { status } = req.body;
      
      const updates = { 
        status 
      };
      
      // If status is DELIVERED, add delivery timestamp
      if (status === 'DELIVERED') {
        updates.deliveredAt = new Date();
      }
      
      const order = await Transaction.findByIdAndUpdate(
        req.params.orderId,
        updates,
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // In your routes file (e.g., routes/transactions.js or similar)

// Stats endpoint for order statistics
router.get('/stats', async (req, res) => {
  try {
    const period = req.query.period || 'today';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let statsData = [];
    
    if (period === 'today') {
      // Create hourly data for today
      const transactions = await Transaction.find({
        date: { $gte: today }
      });
      
      // Initialize hourly buckets (0-23 hours)
      statsData = Array.from({length: 24}, (_, i) => ({
        hour: i,
        count: 0
      }));
      
      // Count transactions per hour
      transactions.forEach(transaction => {
        const hour = new Date(transaction.date).getHours();
        statsData[hour].count += 1;
      });
      
    } else if (period === 'week') {
      // Get start of the week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const transactions = await Transaction.find({
        date: { $gte: startOfWeek }
      });
      
      // Initialize daily buckets (0-6 for Sunday-Saturday)
      statsData = Array.from({length: 7}, (_, i) => ({
        dayOfWeek: i,
        count: 0
      }));
      
      // Count transactions per day of week
      transactions.forEach(transaction => {
        const dayOfWeek = new Date(transaction.date).getDay();
        statsData[dayOfWeek].count += 1;
      });
      
    } else if (period === 'month') {
      // Get start of the month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const transactions = await Transaction.find({
        date: { $gte: startOfMonth }
      });
      
      // Group by week of month (1-4/5)
      statsData = Array.from({length: 5}, (_, i) => ({
        weekOfMonth: i + 1,
        count: 0
      }));
      
      // Count transactions per week of month
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        // Calculate week of month (1-indexed)
        const weekOfMonth = Math.ceil((date.getDate()) / 7);
        if (weekOfMonth <= 5) {
          statsData[weekOfMonth - 1].count += 1;
        }
      });
    }
    
    res.json(statsData);
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics data' });
  }
});

  
// GET specific transaction route
router.get("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).send("Transaction not found");
    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
});


module.exports = router;
