const express = require('express');
const router = express.Router();
const SecondaryPassword = require('../models/SecondaryPassword');
const auth = require('../src/middleware/authMiddleware');

// @route   GET /api/auth/secondary-password/settings
// @desc    Lấy cài đặt mật khẩu cấp 2
// @access  Private - Riêng tư (cần JWT token)
router.get('/settings', auth, async (req, res) => {
    try {
        console.log('⚙️ Đang lấy cài đặt mật khẩu cấp 2 cho user ID:', req.user.id);

        const secondaryPassword = await SecondaryPassword.findOne({ userId: req.user.id });

        if (!secondaryPassword) {
            console.log('📝 Chưa có cài đặt mật khẩu cấp 2, trả về mặc định');
            return res.json({
                enabled: false,
                rememberDuration: 30
            });
        }

        console.log('✅ Đã lấy cài đặt mật khẩu cấp 2:', { enabled: secondaryPassword.isEnabled, rememberDuration: secondaryPassword.rememberDuration });
        res.json({
            enabled: secondaryPassword.isEnabled,
            rememberDuration: secondaryPassword.rememberDuration
        });
    } catch (error) {
        console.error('❌ Lỗi lấy cài đặt mật khẩu cấp 2:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});

// @route   POST /api/auth/secondary-password/enable
// @desc    Bật mật khẩu cấp 2
// @access  Private - Riêng tư (cần JWT token)
router.post('/enable', auth, async (req, res) => {
    try {
        const { password, rememberDuration = 30 } = req.body;

        console.log('🔧 Đang bật mật khẩu cấp 2 cho user ID:', req.user.id);

        if (!password) {
            console.log('❌ Thiếu mật khẩu');
            return res.status(400).json({ message: 'Mật khẩu là bắt buộc' });
        }

        if (password.length < 6) {
            console.log('❌ Mật khẩu quá ngắn');
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        // Kiểm tra xem mật khẩu cấp 2 đã tồn tại chưa
        let secondaryPassword = await SecondaryPassword.findOne({ userId: req.user.id });

        if (secondaryPassword) {
            // Update existing
            secondaryPassword.password = password;
            secondaryPassword.rememberDuration = rememberDuration;
            secondaryPassword.isEnabled = true;
        } else {
            // Create new
            secondaryPassword = new SecondaryPassword({
                userId: req.user.id,
                password,
                rememberDuration,
                isEnabled: true
            });
        }

        await secondaryPassword.save();

        res.json({
            success: true,
            message: 'Secondary password enabled successfully'
        });
    } catch (error) {
        console.error('Error enabling secondary password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/secondary-password/disable
// @desc    Disable secondary password
// @access  Private
router.post('/disable', auth, async (req, res) => {
    try {
        const secondaryPassword = await SecondaryPassword.findOne({ userId: req.user.id });

        if (!secondaryPassword) {
            return res.status(404).json({ message: 'Secondary password not found' });
        }

        secondaryPassword.isEnabled = false;
        await secondaryPassword.save();

        res.json({
            success: true,
            message: 'Secondary password disabled successfully'
        });
    } catch (error) {
        console.error('Error disabling secondary password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/secondary-password/verify
// @desc    Verify secondary password
// @access  Private
router.post('/verify', auth, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const secondaryPassword = await SecondaryPassword.findOne({
            userId: req.user.id,
            isEnabled: true
        });

        if (!secondaryPassword) {
            return res.status(404).json({ message: 'Secondary password not enabled' });
        }

        const isMatch = await secondaryPassword.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid secondary password' });
        }

        res.json({
            success: true,
            message: 'Secondary password verified successfully'
        });
    } catch (error) {
        console.error('Error verifying secondary password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/secondary-password/settings
// @desc    Update secondary password settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
    try {
        const { rememberDuration } = req.body;

        if (rememberDuration === undefined) {
            return res.status(400).json({ message: 'Remember duration is required' });
        }

        if (rememberDuration < 0 || rememberDuration > 1440) {
            return res.status(400).json({ message: 'Invalid remember duration' });
        }

        const secondaryPassword = await SecondaryPassword.findOne({ userId: req.user.id });

        if (!secondaryPassword) {
            return res.status(404).json({ message: 'Secondary password not found' });
        }

        secondaryPassword.rememberDuration = rememberDuration;
        await secondaryPassword.save();

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating secondary password settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
