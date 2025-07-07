const Password = require('../models/Password');
const { encrypt, decrypt } = require('../utils/crypto');

// @desc    Lấy tất cả mật khẩu của người dùng đã đăng nhập
// @route   GET /api/passwords
// @access  Private - Riêng tư (cần JWT token)
exports.getPasswords = async (req, res) => {
    try {
        console.log('📋 Đang lấy danh sách mật khẩu cho user ID:', req.user.id);

        // Chỉ tìm những mật khẩu chưa bị đánh dấu là đã xóa
        const passwords = await Password.find({ user: req.user.id, isDeleted: false }).select('-encryptedPassword').sort({ createdAt: -1 });

        console.log('✅ Đã lấy', passwords.length, 'mật khẩu');
        res.status(200).json({ success: true, count: passwords.length, data: passwords });
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách mật khẩu:', error);
        res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
    }
};

// @desc    Tạo mật khẩu mới cho người dùng đã đăng nhập
// @route   POST /api/passwords
// @access  Private - Riêng tư (cần JWT token)
exports.createPassword = async (req, res) => {
    try {
        const { serviceName, username, password, category } = req.body;

        console.log('🔨 Đang tạo mật khẩu mới cho dịch vụ:', serviceName, 'user ID:', req.user.id);

        if (!serviceName || !username || !password) {
            console.log('❌ Thiếu thông tin bắt buộc');
            return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
        }

        console.log('🔐 Đang mã hóa mật khẩu...');
        const encryptedPassword = encrypt(password);

        const newPassword = await Password.create({
            serviceName,
            username,
            encryptedPassword,
            category, // Thêm danh mục
            user: req.user.id // Liên kết với người dùng đã đăng nhập
        });

        // Không gửi lại mật khẩu đã mã hóa
        const responseData = {
            _id: newPassword._id,
            serviceName: newPassword.serviceName,
            username: newPassword.username,
            category: newPassword.category,
            createdAt: newPassword.createdAt
        };

        console.log('✅ Đã tạo mật khẩu mới cho:', serviceName);
        res.status(201).json({ success: true, data: responseData });
    } catch (error) {
        console.error('❌ Lỗi tạo mật khẩu:', error);
        res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
    }
};

// @desc    Get and decrypt a single password
// @route   GET /api/passwords/:id/decrypt
// @access  Private
exports.getDecryptedPassword = async (req, res) => {
    try {
        const passwordEntry = await Password.findById(req.params.id);

        if (!passwordEntry) {
            return res.status(404).json({ success: false, error: 'Password not found' });
        }

        // Check if the password belongs to the logged-in user
        if (passwordEntry.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this resource' });
        }

        const decryptedPassword = decrypt(passwordEntry.encryptedPassword);

        res.status(200).json({ success: true, decryptedPassword });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update a password
// @route   PUT /api/passwords/:id
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        let passwordEntry = await Password.findById(req.params.id);

        if (!passwordEntry) {
            return res.status(404).json({ success: false, error: 'Password not found' });
        }

        // Check if the password belongs to the logged-in user
        if (passwordEntry.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this resource' });
        }

        const { serviceName, username, password, category } = req.body;

        const updateData = {};
        if (serviceName) updateData.serviceName = serviceName;
        if (username) updateData.username = username;
        if (category) updateData.category = category;

        // If a new password is provided, encrypt and include it
        if (password) {
            updateData.encryptedPassword = encrypt(password);
        }

        const updatedPassword = await Password.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select('-encryptedPassword');

        res.status(200).json({ success: true, data: updatedPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Soft delete a password (move to trash)
// @route   DELETE /api/passwords/:id
// @access  Private
exports.deletePassword = async (req, res) => {
    try {
        let passwordEntry = await Password.findOne({ _id: req.params.id, user: req.user.id });

        if (!passwordEntry) {
            return res.status(404).json({ success: false, error: 'Password not found or not authorized' });
        }

        // If already deleted, do nothing
        if (passwordEntry.isDeleted) {
            return res.status(200).json({ success: true, message: 'Password already in trash' });
        }

        passwordEntry.isDeleted = true;
        passwordEntry.deletedAt = Date.now();
        await passwordEntry.save();

        res.status(200).json({ success: true, message: 'Password moved to trash' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all soft-deleted passwords (trash)
// @route   GET /api/passwords/trash
// @access  Private
exports.getDeletedPasswords = async (req, res) => {
    try {
        const passwords = await Password.find({ user: req.user.id, isDeleted: true })
            .select('-encryptedPassword')
            .sort({ deletedAt: -1 });
        res.status(200).json({ success: true, count: passwords.length, data: passwords });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Restore a password from the trash
// @route   PUT /api/passwords/:id/restore
// @access  Private
exports.restorePassword = async (req, res) => {
    try {
        let passwordEntry = await Password.findOne({ _id: req.params.id, user: req.user.id });

        if (!passwordEntry) {
            return res.status(404).json({ success: false, error: 'Password not found or not authorized' });
        }

        if (!passwordEntry.isDeleted) {
            return res.status(400).json({ success: false, error: 'Password is not in the trash' });
        }

        passwordEntry.isDeleted = false;
        passwordEntry.deletedAt = null;
        await passwordEntry.save();

        // Return the restored password data, excluding the encrypted part
        const responseData = { ...passwordEntry.toObject() };
        delete responseData.encryptedPassword;

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Permanently delete a password
// @route   DELETE /api/passwords/:id/permanent
// @access  Private
exports.deletePasswordPermanently = async (req, res) => {
    try {
        const passwordEntry = await Password.findOne({ _id: req.params.id, user: req.user.id });

        if (!passwordEntry) {
            return res.status(404).json({ success: false, error: 'Password not found or not authorized' });
        }

        // For safety, only allow permanent deletion if it's already in the trash
        if (!passwordEntry.isDeleted) {
            return res.status(400).json({ success: false, error: 'Password must be in the trash before permanent deletion' });
        }

        await Password.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
