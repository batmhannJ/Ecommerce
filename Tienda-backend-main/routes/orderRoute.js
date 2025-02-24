const express = require("express");
const authMiddleware = require('../middleware/auth');
const { PlaceOrder, verifyOrder, userOrders, listOrders, updateStatus } = require('../controllers/orderController');

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, PlaceOrder);
orderRouter.get('/verify', verifyOrder)
orderRouter.post('/userorders', authMiddleware, userOrders)
orderRouter.get('/list', listOrders)
orderRouter.post('/status', updateStatus)

module.exports = orderRouter;