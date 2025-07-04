const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: [true, 'Please provide a service name'],
        trim: true,
    },
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        trim: true,
    },
    encryptedPassword: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    category: {
        type: String,
        trim: true,
        default: 'Chưa phân loại',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true, // Index for better query performance
    },
    deletedAt: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('Password', PasswordSchema);
