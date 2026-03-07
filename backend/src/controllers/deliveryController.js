const axios = require('axios');
const Order = require('../models/deliveryModel');
const DriverLocation = require('../models/DriverLocation');
const { calculateFare } = require('../utils/pricingLogic');

// @desc    Create a new delivery request
// @route   POST /api/deliveries
const createDelivery = async (req, res) => {
    try {
        const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, package_size } = req.body;

        // Call OSRM API for road distance
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${pickup_lng},${pickup_lat};${dropoff_lng},${dropoff_lat}?overview=false`;
        const osrmRes = await axios.get(osrmUrl);

        if (!osrmRes.data.routes || osrmRes.data.routes.length === 0) {
            return res.status(400).json({ message: "Could not calculate a valid road route." });
        }

        const actualRoadKm = osrmRes.data.routes[0].distance / 1000;

        // Pricing rules defined by admin
        const activePricingRule = {
            base_fare: 100,
            per_km_rate: 50,
            small_multiplier: 1.0,
            medium_multiplier: 1.2,
            large_multiplier: 1.5,
            driver_cut_percent: 80,
            platform_cut_percent: 20
        };

        const fare = calculateFare(actualRoadKm, package_size, activePricingRule);

        const orderData = {
            ...req.body,
            user_id: req.user.id, // Set ownership from JWT token
            distance_km: fare.distance_km,
            total_cost: fare.total_cost,
            driver_earnings: fare.driver_earnings,
            platform_earnings: fare.platform_earnings,
            status: "available"
        };

        const order = new Order(orderData);
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: "Creation failed: " + error.message });
    }
};

// @desc    Get all deliveries for the logged-in Entrepreneur
// @route   GET /api/deliveries/my
const getMyDeliveries = async (req, res) => {
    try {
        // Strict ownership filtering: Only fetch orders where user_id matches token ID
        const query = { user_id: req.user.id };
        const orders = await Order.find(query).sort({ created_at: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific order details and tracking info
// @route   GET /api/deliveries/:id/track
const getOrderTracking = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Verify ownership
        if (order.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: "Access denied" });
        }

        let driverLoc = null;
        if (order.driver_id) {
            driverLoc = await DriverLocation.findOne({ driver_id: order.driver_id })
                .sort({ recorded_at: -1 });
        }
        res.json({ order, driverLocation: driverLoc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a delivery request (Only if status is 'available')
// @route   PUT /api/deliveries/:id
const updateDelivery = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Ownership check
        if (order.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Business Rule: Disable update if status is not 'available' (Driver already picked it up)
        if (order.status !== "available") {
            return res.status(400).json({ message: "Order cannot be modified because it's already assigned or in transit" });
        }

        // Update fields
        order.receiver_name = req.body.receiver_name || order.receiver_name;
        order.receiver_phone = req.body.receiver_phone || order.receiver_phone;
        order.receiver_email = req.body.receiver_email || order.receiver_email;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete/Cancel a delivery request (Only if status is 'available')
// @route   DELETE /api/deliveries/:id
const deleteDelivery = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Ownership check
        if (order.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Business Rule: Disable delete if a driver is already involved
        if (order.status !== "available") {
            return res.status(400).json({ message: "Order cannot be deleted because a driver has already accepted it" });
        }

        await order.deleteOne();
        res.json({ message: "Delivery request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createDelivery,
    getMyDeliveries,
    getOrderTracking,
    updateDelivery,
    deleteDelivery
};