const Order = require('../models/deliveryModel'); 
const DriverLocation = require('../models/DriverLocation'); // Member 3 ගේ model එක

// @desc    Create a new Order
const createDelivery = async (req, res) => {
  try {
    const order = new Order(req.body);
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get an Order by ID
const getDeliveryById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details with driver's live location (NEW TRACKING LOGIC)
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    let driverLoc = null;
    if (order.driver_id) {
      // Member 3 ගේ table එකෙන් අලුත්ම location එක ගන්නවා
      driverLoc = await DriverLocation.findOne({ driver_id: order.driver_id });
    }
    res.json({ order, driverLocation: driverLoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an Order
const updateDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.driver_id = req.body.driver_id || order.driver_id;
      order.status = req.body.status || order.status;
      order.vehicle_type = req.body.vehicle_type || order.vehicle_type;
      order.pickup_address = req.body.pickup_address || order.pickup_address;
      order.dropoff_address = req.body.dropoff_address || order.dropoff_address;
      order.total_cost = req.body.total_cost || order.total_cost;
      order.is_delayed = req.body.is_delayed !== undefined ? req.body.is_delayed : order.is_delayed;
      // updateDelivery function එක ඇතුළත මේ පේළි දෙක දාන්න
      order.receiver_name = req.body.receiver_name || order.receiver_name;
      order.receiver_phone = req.body.receiver_phone || order.receiver_phone;
      order.receiver_email = req.body.receiver_email || order.receiver_email;
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get My Deliveries
const getMyDeliveries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const query = {};

  if (req.query.user_id) query.user_id = req.query.user_id;
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) query.dropoff_address = { $regex: req.query.search, $options: 'i' };

  try {
    const orders = await Order.find(query).skip(skip).limit(limit).sort({created_at: -1});
    const count = await Order.countDocuments(query);
    res.json({ orders, page, pages: Math.ceil(count / limit), count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDelivery,
  getDeliveryById,
  updateDelivery,
  getMyDeliveries,
  getOrderTracking // Export කරන්න අමතක කරන්න එපා
};