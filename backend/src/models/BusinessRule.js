const mongoose = require('mongoose');

const businessRuleSchema = new mongoose.Schema({
    vehicle_type: { 
        type: String, 
        enum: {
            values: ['bike', 'tuktuk', 'van', 'truck'],
            message: '{VALUE} is not a supported vehicle type'
        },
        required: [true, 'Vehicle type is required'],
        unique: true 
    },
    base_fare: { 
        type: Number, 
        required: [true, 'Base fare is required'],
        min: [0, 'Base fare cannot be negative'] 
    },
    per_km_rate: { 
        type: Number, 
        required: [true, 'Rate per km is required'],
        min: [0, 'Rate per km cannot be negative']
    },
    small_multiplier: { 
        type: Number, 
        default: 1.0,
        min: [1, 'Multiplier cannot be less than 1']
    },
    medium_multiplier: { 
        type: Number, 
        default: 1.2,
        min: [1, 'Multiplier cannot be less than 1']
    },
    large_multiplier: { 
        type: Number, 
        default: 1.5,
        min: [1, 'Multiplier cannot be less than 1']
    },
    driver_cut_percent: { 
        type: Number, 
        default: 80,
        min: 0,
        max: 100 
    },
    platform_cut_percent: { 
        type: Number, 
        default: 20,
        min: 0,
        max: 100 
    }
}, { 
    timestamps: { updatedAt: 'updated_at', createdAt: 'created_at' } 
});

module.exports = mongoose.model('BusinessRule', businessRuleSchema);