const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const secondaryPasswordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rememberDuration: {
        type: Number,
        default: 30, // minutes
        min: 0,
        max: 1440 // max 24 hours
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
secondaryPasswordSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
secondaryPasswordSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Update timestamp on save
secondaryPasswordSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('SecondaryPassword', secondaryPasswordSchema);
