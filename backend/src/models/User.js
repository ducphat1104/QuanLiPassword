const mongoose = require('mongoose');

// Schema cho model User - Người dùng
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên đăng nhập'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Vui lòng cung cấp mật khẩu'],
        minlength: 6,
    },
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('User', UserSchema);
