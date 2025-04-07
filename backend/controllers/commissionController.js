// server/controllers/commissionController.js
const Transaction = require('../models/transactionModel');
const Product = require('../models/productModels');

exports.getSellerCommissions = async (req, res) => {
  try {
    // Fetch all transactions
    const transactions = await Transaction.find()
      .populate('product', 'new_price') // Assuming product is a reference to Product model
      .populate('seller', 'name');      // Assuming seller is a reference to User model

    // Calculate commissions for each transaction
    const commissionData = transactions.map(transaction => {
      const transactionAmount = transaction.amount;
      const productBasePrice = transaction.product.new_price;
      const commission = transactionAmount - productBasePrice;

      return {
        transactionId: transaction._id,
        productName: transaction.product.name,
        sellerId: transaction.seller._id,
        sellerName: transaction.seller.name,
        transactionAmount,
        productBasePrice,
        commission
      };
    });

    // Calculate total commission per seller
    const sellerCommissions = {};
    let totalCommission = 0;

    commissionData.forEach(item => {
      if (!sellerCommissions[item.sellerId]) {
        sellerCommissions[item.sellerId] = {
          sellerName: item.sellerName,
          totalCommission: 0,
          transactions: []
        };
      }
      sellerCommissions[item.sellerId].totalCommission += item.commission;
      sellerCommissions[item.sellerId].transactions.push({
        productName: item.productName,
        amount: item.transactionAmount,
        basePrice: item.productBasePrice,
        commission: item.commission
      });
      totalCommission += item.commission;
    });

    res.json({
      success: true,
      commissions: commissionData,
      sellerSummary: sellerCommissions,
      totalCommission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching commissions',
      error: error.message
    });
  }
};