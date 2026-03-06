const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");

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

//user crud controller
const {
  listUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require('../controllers/adminUsersController');

router.use(auth, role("admin"));

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

//user management routes
router.get('/users', listUsers);                  // Get all users (with pagination)
router.get('/users/:id', getUserById);            // Get single user
router.post('/users', createUserByAdmin);         // Create user
router.put('/users/:id', updateUserByAdmin);      // Update user
router.delete('/users/:id', deleteUserByAdmin);   // Delete user

module.exports = router;