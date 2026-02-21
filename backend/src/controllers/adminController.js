const Order = require('../models/deliveryModel'); 
const User = require('../models/userModel');
const BusinessRule = require('../models/BusinessRule');

// 1. Revenue Analytics (Stats + Chart Data)
const getRevenueAnalytics = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $facet: {
          "totals": [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total_cost' },
                totalDeliveries: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'businessrules',
                pipeline: [{ $limit: 1 }],
                as: 'businessRule',
              },
            },
            { $unwind: '$businessRule' },
            {
              $project: {
                _id: 0,
                totalRevenue: 1,
                totalDeliveries: 1,
                platformEarnings: {
                  $multiply: ['$totalRevenue', { $divide: ['$businessRule.platform_cut_percent', 100] }],
                },
              },
            }
          ],
          "monthlyBreakdown": [
            {
              $group: {
                _id: { $dateToString: { format: "%b", date: "$created_at" } },
                revenue: { $sum: "$total_cost" },
                monthNum: { $first: { $month: "$created_at" } }
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
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 2. Courier Performance Tracking
const getCourierPerformance = async (req, res) => {
  try {
    const courierPerformance = await Order.aggregate([
      { $match: { driver_id: { $ne: null } } },
      {
        $group: { _id: '$driver_id', totalDeliveries: { $sum: 1 } },
      },
      {
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'driverDetails' },
      },
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

// 4. User Management (Entrepreneurs & Drivers)
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
        const { id } = req.params;
        const updatedDriver = await User.findByIdAndUpdate(
            id, 
            { is_verified: true }, 
            { new: true }
        ).select('-password_hash');

        if (!updatedDriver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        res.status(200).json({ success: true, data: updatedDriver });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Order Monitoring
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
};