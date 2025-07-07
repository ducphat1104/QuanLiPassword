const mongoose = require('mongoose');

// Schema cho model Password - Mật khẩu
const PasswordSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên dịch vụ'],
        trim: true,
    },
    username: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên đăng nhập'],
        trim: true,
    },
    encryptedPassword: {
        type: String,
        required: [true, 'Vui lòng cung cấp mật khẩu'],
    },
    category: {
        type: String,
        trim: true,
        default: 'Chưa phân loại',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến model User
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true, // Index để tăng hiệu suất truy vấn
    },
    deletedAt: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('Password', PasswordSchema);
