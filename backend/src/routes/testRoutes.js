const express = require('express');
const router = express.Router();
const BusinessRule = require('../models/BusinessRule');
const { calculateFare } = require('../utils/pricingLogic');

// POST /api/test/calculate
router.post('/calculate', async (req, res) => {
    try {
        const { distance, vehicle_type, package_size } = req.body;

        // Find the rules for the selected vehicle
        const rule = await BusinessRule.findOne({ vehicle_type });

        if (!rule) {
            return res.status(404).json({ message: "No pricing rules found for this vehicle type." });
        }

        const pricing = calculateFare(distance, package_size, rule);
        res.json({ success: true, pricing });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;