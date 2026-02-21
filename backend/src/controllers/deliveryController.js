const Order = require('../models/deliveryModel'); // MAKE SURE THIS PATH IS CORRECT

// @desc    Create a new Order
// @route   POST /api/deliveries
// @access  Public
const createDelivery = async (req, res) => {
  try {
    // 1. We pass req.body directly because your Postman JSON keys 
    //    now match the Mongoose Schema keys exactly (user_id, pickup_lat, etc.)
    const order = new Order(req.body);
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    // 2. Return the ACTUAL error message to see what is wrong
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get an Order by ID
// @route   GET /api/deliveries/:id
// @access  Public
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

// @desc    Update an Order (Status, Driver, etc.)
// @route   PUT /api/deliveries/:id
// @access  Public
const updateDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // 3. Update fields based on what is sent in the body
      //    We use logical OR (||) to keep existing values if not sent
      order.driver_id = req.body.driver_id || order.driver_id;
      order.status = req.body.status || order.status;
      order.vehicle_type = req.body.vehicle_type || order.vehicle_type;
      
      // Update location/cost details if provided
      order.pickup_address = req.body.pickup_address || order.pickup_address;
      order.dropoff_address = req.body.dropoff_address || order.dropoff_address;
      order.total_cost = req.body.total_cost || order.total_cost;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get orders with pagination & filtering
// @route   GET /api/deliveries/my
// @access  Public
const getMyDeliveries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by User ID (Sender) or Driver ID if provided in query
  if (req.query.user_id) {
    query.user_id = req.query.user_id;
  }
  
  // Filter by Status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Search logic (Updated to search 'dropoff_address' instead of old 'deliveryAddress')
  if (req.query.search) {
    query.dropoff_address = { $regex: req.query.search, $options: 'i' };
  }

  try {
    const orders = await Order.find(query).skip(skip).limit(limit);
    const count = await Order.countDocuments(query);
    res.json({
      orders, // Renamed from deliveries to orders
      page,
      pages: Math.ceil(count / limit),
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDelivery,
  getDeliveryById,
  updateDelivery,
  getMyDeliveries,
};