const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getDeliveryById,
  updateDelivery,
  getMyDeliveries,
} = require('../controllers/deliveryController'); // Ensure file path matches

// Use '/my' BEFORE '/:id' so 'my' isn't treated as an ID
router.route('/my').get(getMyDeliveries); 

router.route('/')
  .post(createDelivery);

router.route('/:id')
  .get(getDeliveryById)
  .put(updateDelivery);

module.exports = router;