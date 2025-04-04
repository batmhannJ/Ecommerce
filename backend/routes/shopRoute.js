const express = require('express');
const router = express.Router();
const Seller = require('../models/sellerModels');
// GET /api/shops?municipality=Quezon City
// In your router file:
router.get('/page', async (req, res) => {
    console.log("Shop route accessed");
    console.log("SHOP ROUTEEEEEE");

    try {
        const { municipality } = req.query;

        if (!municipality) {
            return res.status(400).json({ error: "Municipality parameter is required" });
        }

        console.log("Searching for shops in:", municipality);
        
        // Use regex for partial match instead of exact match
        const sellers = await Seller.find({
            businessLocation: { $regex: municipality, $options: 'i' },  // Case-insensitive partial match
            isApproved: true
        }).select('shopName businessLocation image rating reviewCount minOrder freeDeliveryMinimum');

        console.log(`Found ${sellers.length} approved shops matching "${municipality}"`);
        
        res.json(sellers);
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
