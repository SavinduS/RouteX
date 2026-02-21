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
  checkAndMarkDelays,
} = require('../controllers/adminController');

router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/courier-performance', getCourierPerformance);
router.get('/rules', getBusinessRules);
router.put('/rules/:id', updateBusinessRule);
router.get('/users/entrepreneurs', getEntrepreneurs); // New
router.get('/users/drivers', getDrivers); // New
router.put('/users/verify-driver/:id', verifyDriver);
router.get('/orders', getAllOrders);
router.put('/orders/mark-delayed', checkAndMarkDelays);

module.exports = router;