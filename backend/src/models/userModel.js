const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'driver', 'admin'],
    default: 'user',
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  // Add other fields as necessary from your application's requirements
});

const User = mongoose.model('User', userSchema);

module.exports = User;
