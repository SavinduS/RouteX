const Order = require('../models/deliveryModel'); 
const User = require('../models/User');
const BusinessRule = require('../models/BusinessRule');
const DeliveryHistory = require('../models/DeliveryHistory');
const Inquiry = require('../models/Inquiry');
const { getLkrToUsdRate } = require('../utils/exchangeService');

// 1. Revenue Analytics with Third-Party Currency Conversion
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date(0);
    const now = new Date();
    
    if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === 'month') startDate = new Date(now.setMonth(now.getMonth() - 1));

    const result = await DeliveryHistory.aggregate([
      { $match: { final_status: 'delivered', completed_at: { $gte: startDate } } }, 
      {
        $facet: {
          "totals": [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total_cost' },
                platformEarnings: { $sum: '$platform_earnings' },
                driverEarnings: { $sum: '$driver_earnings' },
                totalDeliveries: { $sum: 1 },
              },
            }
          ],
          "monthlyBreakdown": [
            {
              $group: {
                _id: { $dateToString: { format: "%b %d", date: "$completed_at" } },
                revenue: { $sum: "$total_cost" },
                date: { $first: "$completed_at" }
              }
            },
            { $sort: { date: 1 } },
            { $project: { name: "$_id", revenue: 1, _id: 0 } }
          ]
        }
      }
    ]);

    const rawStats = result[0].totals[0] || { totalRevenue: 0, platformEarnings: 0, driverEarnings: 0, totalDeliveries: 0 };
    
    const usdRate = await getLkrToUsdRate();

    const statsWithCurrency = {
        ...rawStats,
        usdRate: usdRate, 
        totalRevenueUSD: (rawStats.totalRevenue * usdRate).toFixed(2),
        platformEarningsUSD: (rawStats.platformEarnings * usdRate).toFixed(2),
        driverEarningsUSD: (rawStats.driverEarnings * usdRate).toFixed(2)
    };
    
    const data = {
      stats: statsWithCurrency, 
      chartData: result[0].monthlyBreakdown || []
    };

    res.status(200).json({ success: true, data });
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Revenue calculation failed', error: error.message }); 
  }
};

// 2. Courier Performance
const getCourierPerformance = async (req, res) => {
  try {
    const courierPerformance = await DeliveryHistory.aggregate([
      { $match: { final_status: 'delivered' } }, 
      { $group: { _id: '$driver_id', totalDeliveries: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'driverDetails' } },
      { $unwind: '$driverDetails' },
      { $project: { _id: 0, driverId: '$_id', driverName: '$driverDetails.full_name', totalDeliveries: 1 } },
      { $sort: { totalDeliveries: -1 } },
    ]);
    res.status(200).json({ success: true, data: courierPerformance });
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Courier metrics fetch failed', error: error.message }); 
  }
};

// 3. Business Rule Management
const getBusinessRules = async (req, res) => {
  try {
    const rules = await BusinessRule.find();
    res.status(200).json({ success: true, data: rules });
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Failed to fetch rules', error: error.message }); 
  }
};

const updateBusinessRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // VALIDATION: Request body is empty check
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'Update data is required' });
    }

    const updatedRule = await BusinessRule.findByIdAndUpdate(id, req.body, { 
        new: true, 
        runValidators: true 
    });

    if (!updatedRule) {
        return res.status(404).json({ success: false, message: 'Business Rule ID not found' });
    }

    res.status(200).json({ success: true, data: updatedRule });
  } catch (error) { 
    res.status(400).json({ success: false, message: 'Update failed', error: error.message }); 
  }
};

// 4. User Management
const getEntrepreneurs = async (req, res) => {
    try {
        const users = await User.find({ role: 'entrepreneur' }).select('-password_hash');
        res.status(200).json({ success: true, data: users });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Failed to fetch entrepreneurs', error: error.message }); 
    }
};

const getDrivers = async (req, res) => {
    try {
        const users = await User.find({ role: 'driver' }).select('-password_hash');
        res.status(200).json({ success: true, data: users });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Failed to fetch drivers', error: error.message }); 
    }
};

const verifyDriver = async (req, res) => {
    try {
        const updatedDriver = await User.findByIdAndUpdate(req.params.id, { is_verified: true }, { new: true });
        
        if (!updatedDriver) {
            return res.status(404).json({ success: false, message: 'User ID not found' });
        }

        res.status(200).json({ success: true, data: updatedDriver });
    } catch (error) { 
        res.status(400).json({ success: false, message: 'Verification failed', error: error.message }); 
    }
};

// 5. Order Monitoring
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    
    const orders = await Order.find(filter)
      .populate('user_id', 'full_name') 
      .sort({ created_at: -1 });
      
    res.status(200).json({ success: true, data: orders });
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Orders fetch failed', error: error.message }); 
  }
};

const getOrderHistory = async (req, res) => {
    try {
        const history = await DeliveryHistory.find().sort({ completed_at: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'History fetch failed', error: error.message }); 
    }
};

// 6. User Specific Data
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.params.userId }).sort({ created_at: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'User orders fetch failed', error: error.message }); 
    }
};

const getUserInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: inquiries });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'User inquiries fetch failed', error: error.message }); 
    }
};

const replyToInquiry = async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ success: false, message: 'Reply text is required' });

        const updated = await Inquiry.findByIdAndUpdate(
            req.params.id, 
            { admin_reply: reply, status: 'replied' }, 
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Inquiry not found' });

        res.status(200).json({ success: true, message: 'Reply saved/updated successfully', data: updated });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Failed to update inquiry', error: error.message }); 
    }
};

const deleteInquiryReply = async (req, res) => {
    try {
        const updated = await Inquiry.findByIdAndUpdate(
            req.params.id, 
            { admin_reply: '', status: 'pending' }, 
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Inquiry not found' });

        res.status(200).json({ success: true, message: 'Reply deleted and status reset to pending', data: updated });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Failed to delete reply', error: error.message }); 
    }
};

// 7. Delay Handling
const checkAndMarkDelays = async (req, res) => {
  try {
    const now = new Date();
    const result = await Order.updateMany(
      { status: { $ne: 'delivered' }, expected_delivery_time: { $lt: now }, is_delayed: { $ne: true } },
      { $set: { is_delayed: true } }
    );
    res.status(200).json({ success: true, message: `${result.modifiedCount} orders marked as delayed` });
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Delay check failed', error: error.message }); 
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
  getOrderHistory,
  getUserOrders,
  getUserInquiries,
  replyToInquiry,
  deleteInquiryReply,
  checkAndMarkDelays,
};