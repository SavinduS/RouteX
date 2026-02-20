const mongoose = require('mongoose');

const businessRuleSchema = new mongoose.Schema({
    vehicle_type: { 
        type: String, 
        enum: ['bike', 'tuktuk', 'van', 'truck'], 
        required: true,
        unique: true 
    },
    base_fare: { type: Number, required: true },

    per_km_rate: { type: Number, required: true },

    small_multiplier: { type: Number, default: 1.0 },
    medium_multiplier: { type: Number, default: 1.2 },
    large_multiplier: { type: Number, default: 1.5 },
    
    driver_cut_percent: { type: Number, default: 80 },
    platform_cut_percent: { type: Number, default: 20 }
}, { 
    timestamps: { updatedAt: 'updated_at', createdAt: 'created_at' } 
});

module.exports = mongoose.model('BusinessRule', businessRuleSchema);