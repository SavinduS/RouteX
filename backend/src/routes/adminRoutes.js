const express = require('express');
const router = express.Router();
const {
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
  checkAndMarkDelays,
} = require('../controllers/adminController');

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/courier-performance', getCourierPerformance);

// Business Rules
router.get('/rules', getBusinessRules);
router.put('/rules/:id', updateBusinessRule);

// Users & Drivers
router.get('/users/entrepreneurs', getEntrepreneurs);
router.get('/users/drivers', getDrivers);
router.put('/users/verify-driver/:id', verifyDriver);

// User Specific Actions
router.get('/users/entrepreneur/:userId/orders', getUserOrders);
router.get('/users/entrepreneur/:userId/inquiries', getUserInquiries);
router.put('/inquiries/reply/:id', replyToInquiry);

// Orders Management
router.get('/orders', getAllOrders);
router.get('/orders/history', getOrderHistory);
router.put('/orders/mark-delayed', checkAndMarkDelays);

module.exports = router;