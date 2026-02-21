const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Section 3: Orders Collection (Active Deliveries)
  
  // 'order_id' is handled automatically by Mongoose as '_id'
  
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the Users Collection
    required: true,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the Users Collection (Driver)
    default: null, // PDF says "null until assigned"
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'picked_up', 'in_transit'],
    default: 'available',
    required: true,
  },
  vehicle_type: {
    type: String,
    enum: ['bike', 'tuktuk', 'van', 'truck'], // derived from User/Business Rules contexts
    required: true,
  },
  package_size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true,
  },
  
  // Page 2: Location and Cost Details
  
  pickup_address: {
    type: String,
    required: true,
  },
  pickup_lat: {
    type: Number,
    required: true,
  },
  pickup_lng: {
    type: Number,
    required: true,
  },
  dropoff_address: {
    type: String,
    required: true,
  },
  dropoff_lat: {
    type: Number,
    required: true,
  },
  dropoff_lng: {
    type: Number,
    required: true,
  },
  distance_km: {
    type: Number,
    required: true,
  },
  total_cost: {
    type: Number,
    required: true,
  },
}, {
  // This automatically manages 'created_at' as defined in the PDF
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;