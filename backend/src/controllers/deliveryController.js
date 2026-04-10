const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('../models/deliveryModel'); 
const DriverLocation = require('../models/DriverLocation'); 
const { calculateFare } = require('../utils/pricingLogic'); 

// @desc    Create a new Order
const createDelivery = async (req, res) => {
  try {
    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, package_size } = req.body;
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${pickup_lng},${pickup_lat};${dropoff_lng},${dropoff_lat}?overview=false`;
    const osrmRes = await axios.get(osrmUrl);
    
    if (!osrmRes.data.routes || osrmRes.data.routes.length === 0) {
        return res.status(400).json({ message: "Could not calculate a valid road route." });
    }

    const actualRoadKm = osrmRes.data.routes[0].distance / 1000;
    const activePricingRule = {
        base_fare: 100, per_km_rate: 50, small_multiplier: 1.0,
        medium_multiplier: 1.2, large_multiplier: 1.5,
        driver_cut_percent: 80, platform_cut_percent: 20
    };

    const fare = calculateFare(actualRoadKm, package_size, activePricingRule);

    const order = new Order({
      ...req.body,
      user_id: req.user ? req.user.id : req.body.user_id,
      distance_km: fare.distance_km,
      total_cost: fare.total_cost,
      driver_earnings: fare.driver_earnings,
      platform_earnings: fare.platform_earnings,
      status: "available" 
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery by ID
const getDeliveryById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's deliveries
const getMyDeliveries = async (req, res) => {
    try {
        const query = req.user ? { user_id: req.user.id } : {};
        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update delivery info
const updateDelivery = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * FIXED: Added the missing deleteDelivery function definition
 */
const deleteDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order tracking and driver location
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("driver_id", "full_name phone_number");
    if (!order) return res.status(404).json({ message: "Order not found" });

    let driverLoc = null;
    if (order.driver_id) {
        const driverId = order.driver_id._id || order.driver_id;
        driverLoc = await DriverLocation.findOne({ driver_id: driverId }).sort({ recorded_at: -1 });
    }
    res.json({ order, driverLocation: driverLoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order tracking and driver location by human-readable Order ID or MongoDB ID
const getOrderByReadableId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Try finding by readable order_id first, then by MongoDB _id
    let order = await Order.findOne({ order_id: orderId }).populate("driver_id", "full_name phone_number");
    
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId).populate("driver_id", "full_name phone_number");
    }
    
    if (!order) {
      return res.status(404).json({ message: "Order not found with the provided ID." });
    }

    // Security Check: Only the owner (Entrepreneur) can track their own order
    const requesterId = req.user.id;
    const ownerId = order.user_id.toString();

    if (requesterId !== ownerId) {
      return res.status(403).json({ 
        message: "Forbidden: You do not have permission to track this order." 
      });
    }

    let driverLocation = null;
    if (order.driver_id) {
      driverLocation = await DriverLocation.findOne({ 
        driver_id: order.driver_id 
      }).sort({ recorded_at: -1 });
    }

    res.json({
      success: true,
      order,
      driverLocation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDelivery,
  getDeliveryById,
  updateDelivery,
  deleteDelivery, 
  getMyDeliveries,
  getOrderTracking,
  getOrderByReadableId
};