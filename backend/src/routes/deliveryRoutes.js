const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
    createDelivery,
    updateDelivery,
    deleteDelivery,
    getMyDeliveries,
    getOrderTracking
} = require('../controllers/deliveryController');

// All routes are protected by JWT Auth
router.use(auth);

// Entrepreneur specific routes
router.get('/my', role('entrepreneur'), getMyDeliveries);
router.post('/', role('entrepreneur'), createDelivery);

// Item specific routes
router.get('/:id/track', getOrderTracking);
router.put('/:id', role('entrepreneur'), updateDelivery);
router.delete('/:id', role('entrepreneur'), deleteDelivery);

module.exports = router;