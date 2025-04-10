// server/routes/commissionRoutes.js
const express = require('express');
const router = express.Router();
const { getSellerCommissions } = require('../controllers/commissionController');

router.get('/seller-commissions', getSellerCommissions);

module.exports = router;