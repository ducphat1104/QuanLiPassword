const express = require('express');
const router = express.Router();

// Import các controller functions cho xác thực
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
// Import middleware xác thực JWT
const auth = require('../middleware/authMiddleware');
// Import các validation rules và error handler
const {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
    handleValidationErrors
} = require('../middleware/validation');

// @route   POST api/auth/register
// @desc    Đăng ký người dùng mới
// @access  Public - Công khai
router.post('/register', validateRegister, handleValidationErrors, register);

// @route   POST api/auth/login
// @desc    Xác thực người dùng và lấy token
// @access  Public - Công khai
router.post('/login', validateLogin, handleValidationErrors, login);

// @route   GET api/auth/me
// @desc    Lấy thông tin người dùng hiện tại
// @access  Private - Riêng tư (cần JWT token)
router.get('/me', auth, getMe);

// @route   PUT api/auth/profile
// @desc    Cập nhật thông tin profile người dùng (username)
// @access  Private - Riêng tư (cần JWT token)
router.put('/profile', auth, validateProfileUpdate, handleValidationErrors, updateProfile);

// @route   PUT api/auth/change-password
// @desc    Đổi mật khẩu người dùng
// @access  Private - Riêng tư (cần JWT token)
router.put('/change-password', auth, validatePasswordChange, handleValidationErrors, changePassword);

module.exports = router;
