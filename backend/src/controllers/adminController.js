const Order = require('../models/deliveryModel'); 
const User = require('../models/User');
const BusinessRule = require('../models/BusinessRule');
const DeliveryHistory = require('../models/DeliveryHistory');

// 1. Revenue Analytics (Calculated from DeliveryHistory)
const getRevenueAnalytics = async (req, res) => {
  try {
    const result = await DeliveryHistory.aggregate([
      { $match: { final_status: 'delivered' } }, 
      {
        $facet: {
          "totals": [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total_cost' },
                platformEarnings: { $sum: '$platform_earnings' },
                totalDeliveries: { $sum: 1 },
              },
            }
          ],
          "monthlyBreakdown": [
            {
              $group: {
                _id: { $dateToString: { format: "%b", date: "$completed_at" } },
                revenue: { $sum: "$total_cost" },
                monthNum: { $first: { $month: "$completed_at" } }
              }
            },
            { $sort: { monthNum: 1 } },
            { $project: { name: "$_id", revenue: 1, _id: 0 } }
          ]
        }
      }
    ]);

    const data = {
      stats: result[0].totals[0] || { totalRevenue: 0, platformEarnings: 0, totalDeliveries: 0 },
      chartData: result[0].monthlyBreakdown || []
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Courier Performance Tracking
const getCourierPerformance = async (req, res) => {
  try {
    const courierPerformance = await Order.aggregate([
      { $match: { driver_id: { $ne: null } } },
      { $group: { _id: '$driver_id', totalDeliveries: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'driverDetails' } },
      { $unwind: '$driverDetails' },
      {
        $project: { _id: 0, driverId: '$_id', driverName: '$driverDetails.full_name', totalDeliveries: 1 },
      },
      { $sort: { totalDeliveries: -1 } },
    ]);
    res.status(200).json({ success: true, data: courierPerformance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Business Rule Management
const getBusinessRules = async (req, res) => {
  try {
    const rules = await BusinessRule.find();
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateBusinessRule = async (req, res) => {
  try {
    const updatedRule = await BusinessRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedRule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. User Management
const getEntrepreneurs = async (req, res) => {
    try {
        const users = await User.find({ role: 'entrepreneur' }).select('-password_hash');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getDrivers = async (req, res) => {
    try {
        const users = await User.find({ role: 'driver' }).select('-password_hash');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const verifyDriver = async (req, res) => {
    try {
        const updatedDriver = await User.findByIdAndUpdate(req.params.id, { is_verified: true }, { new: true });
        res.status(200).json({ success: true, data: updatedDriver });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Active Order Monitoring
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. Delay Handling
const checkAndMarkDelays = async (req, res) => {
  try {
    const now = new Date();
    const delayedOrders = await Order.updateMany(
      { status: { $ne: 'delivered' }, expected_delivery_time: { $lt: now }, is_delayed: { $ne: true } },
      { $set: { is_delayed: true } }
    );
    res.status(200).json({ success: true, data: delayedOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. Order History
const getOrderHistory = async (req, res) => {
    try {
        const history = await DeliveryHistory.find().sort({ completed_at: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
  getRevenueAnalytics,
  getCourierPerformance,
  getBusinessRules,
  updateBusinessRule,
  getEntrepreneurs,
  getDrivers,
  verifyDriver,
  getAllOrders,
  checkAndMarkDelays,
  getOrderHistory
};