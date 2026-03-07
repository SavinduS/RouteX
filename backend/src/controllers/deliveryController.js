const axios = require('axios'); // For OSRM API calls
const axios = require('axios'); // For OSRM API calls
const Order = require('../models/deliveryModel'); 
const DriverLocation = require('../models/DriverLocation'); // Member 3's Model

/** 
 * IMPORTANT: Import the Admin's Pricing Logic without modifying it.
 */
const { calculateFare } = require('../utils/pricingLogic'); 

// @desc    Create a new Order with Road Distance Verification & Admin Pricing
// @route   POST /api/deliveries
const createDelivery = async (req, res) => {
  try {
    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, package_size } = req.body;

    /**
     * 1. EXTERNAL API INTEGRATION (OSRM)
     * Fetches actual road distance. OSRM expects [Longitude, Latitude].
     */
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${pickup_lng},${pickup_lat};${dropoff_lng},${dropoff_lat}?overview=false`;
    
    const osrmRes = await axios.get(osrmUrl);
    
    if (!osrmRes.data.routes || osrmRes.data.routes.length === 0) {
        return res.status(400).json({ message: "Could not calculate a valid road route." });
    }

    // Convert meters to Kilometers
    const actualRoadKm = osrmRes.data.routes[0].distance / 1000;

    /**
     * 2. ADMIN PRICING RULES
     */
    const activePricingRule = {
        base_fare: 100,           // LKR
        per_km_rate: 50,          // LKR per KM
        small_multiplier: 1.0,
        medium_multiplier: 1.2,
        large_multiplier: 1.5,
        driver_cut_percent: 80,   // Driver gets 80%
        platform_cut_percent: 20  // Platform takes 20%
    };

    /**
     * 3. CALCULATE FARE
     */
    const fare = calculateFare(actualRoadKm, package_size, activePricingRule);

    /**
     * 4. SAVE ORDER DATA
     */
    const orderData = {
      ...req.body,
      user_id: req.user ? req.user.id : req.body.user_id, // Get ID from JWT if available
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
    console.error("Backend Error (CreateDelivery):", error.message);
    res.status(500).json({ message: "Creation failed: " + error.message });
  }
};

// @desc    Get order details by ID
const getDeliveryById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details with Latest Driver Live Location
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

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

// @desc    Get My Deliveries (For Entrepreneur Dashboard)
const getMyDeliveries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const query = {};

  if (req.query.user_id) query.user_id = req.query.user_id;
  if (req.query.status) query.status = req.query.status;
  
  if (req.query.search) {
      query.$or = [
          { dropoff_address: { $regex: req.query.search, $options: 'i' } },
          { order_id: { $regex: req.query.search, $options: 'i' } }
      ];
  }

  try {
    const orders = await Order.find(query)
                             .skip(skip)
                             .limit(limit)
                             .sort({ created_at: -1 });
                             
    const count = await Order.countDocuments(query);
    res.json({ orders, page, pages: Math.ceil(count / limit), total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an Order (General info update)
const updateDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.receiver_name = req.body.receiver_name || order.receiver_name;
      order.receiver_phone = req.body.receiver_phone || order.receiver_phone;
      order.receiver_email = req.body.receiver_email || order.receiver_email;
      order.status = req.body.status || order.status;
      order.status = req.body.status || order.status;
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createDelivery,
  getDeliveryById,
  updateDelivery,
  getMyDeliveries,
  getOrderTracking
  
};