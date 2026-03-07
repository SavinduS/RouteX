const Order = require('../models/deliveryModel');
const DriverLocation = require('../models/DriverLocation');

// @desc    Create a new delivery request
// @route   POST /api/deliveries
const createDelivery = async (req, res) => {
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
// @desc    Get all deliveries for the logged-in Entrepreneur
// @route   GET /api/deliveries/my
const getMyDeliveries = async (req, res) => {
    try {
        // Strict ownership filtering: Only fetch orders where user_id matches token ID
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific order details and tracking info
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    let driverLoc = null;
    if (order.driver_id) {
      // Member 3 ගේ table එකෙන් අලුත්ම location එක ගන්නවා
      driverLoc = await DriverLocation.findOne({ driver_id: order.driver_id });
        // Verify ownership
        if (order.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: "Access denied" });
        }

        let driverLoc = null;
        if (order.driver_id) {
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
        }
        // Update fields
        order.receiver_name = req.body.receiver_name || order.receiver_name;
        order.receiver_phone = req.body.receiver_phone || order.receiver_phone;
        order.receiver_email = req.body.receiver_email || order.receiver_email;

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get My Deliveries
const getMyDeliveries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
    res.status(500).json({ message: error.message });
  }
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