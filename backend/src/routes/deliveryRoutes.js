const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getDeliveryById,
  updateDelivery,
  getMyDeliveries,
  getOrderTracking // මේක උඩින් import කරගන්න
} = require('../controllers/deliveryController');

router.route('/my').get(getMyDeliveries); 
router.route('/').post(createDelivery);

// Tracking route එක ID එකට පස්සේ දාන්න
router.route('/:id').get(getDeliveryById).put(updateDelivery);
router.route("/:id/track").get(getOrderTracking);

module.exports = router;