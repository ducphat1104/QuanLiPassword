const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public - Công khai
exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('🔐 Đang xử lý đăng ký cho username:', username);
        console.log('📝 Dữ liệu nhận được:', { username, passwordLength: password?.length });

        // Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            console.log('❌ Thiếu username hoặc password');
            return res.status(400).json({
                msg: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu',
                missing: {
                    username: !username,
                    password: !password
                }
            });
        }

        // Kiểm tra xem người dùng đã tồn tại chưa
        let user = await User.findOne({ username });
        if (user) {
            console.log('❌ Username đã tồn tại:', username);
            return res.status(400).json({ msg: 'Tên người dùng đã tồn tại' });
        }

        // Tạo instance người dùng mới
        user = new User({
            username,
            password,
        });

        // Hash mật khẩu trước khi lưu
        console.log('🔒 Đang hash mật khẩu...');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log('✅ Đã tạo người dùng mới:', username);

        // Tạo và trả về JWT token
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' }, // Token hết hạn sau 5 giờ
            (err, token) => {
                if (err) throw err;
                console.log('🎫 Đã tạo JWT token cho:', username);
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('❌ Lỗi đăng ký:', err.message);
        res.status(500).send('Lỗi máy chủ');
    }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private - Riêng tư (cần JWT token)
exports.getMe = async (req, res) => {
    try {
        console.log('👤 Đang lấy thông tin người dùng ID:', req.user.id);

        // req.user được gắn từ auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            console.log('❌ Không tìm thấy người dùng ID:', req.user.id);
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        console.log('✅ Đã lấy thông tin người dùng:', user.username);
        res.json(user);
    } catch (err) {
        console.error('❌ Lỗi lấy thông tin người dùng:', err.message);
        res.status(500).send('Lỗi máy chủ');
    }
};

// @desc    Xác thực người dùng và lấy token (Đăng nhập)
// @route   POST /api/auth/login
// @access  Public - Công khai
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('🔐 Đang xử lý đăng nhập cho username:', username);

        // Kiểm tra xem người dùng có tồn tại không
        let user = await User.findOne({ username });
        if (!user) {
            console.log('❌ Không tìm thấy username:', username);
            return res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // So sánh mật khẩu nhập vào với mật khẩu đã hash
        console.log('🔍 Đang kiểm tra mật khẩu...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Mật khẩu không đúng cho username:', username);
            return res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Tạo và trả về JWT token
        console.log('✅ Đăng nhập thành công cho:', username);
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' }, // Token hết hạn sau 5 giờ
            (err, token) => {
                if (err) throw err;
                console.log('🎫 Đã tạo JWT token cho:', username);
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('❌ Lỗi đăng nhập:', err.message);
        res.status(500).send('Lỗi máy chủ');
    }
};

// @desc    Cập nhật thông tin profile người dùng (username)
// @route   PUT /api/auth/profile
// @access  Private - Riêng tư (cần JWT token)
exports.updateProfile = async (req, res) => {
    const { username } = req.body;

    try {
        console.log('👤 Đang cập nhật profile cho user ID:', req.user.id, 'username mới:', username);

        // Kiểm tra username có được cung cấp không
        if (!username || username.trim() === '') {
            console.log('❌ Username không được cung cấp');
            return res.status(400).json({ msg: 'Tên người dùng là bắt buộc' });
        }

        // Kiểm tra username đã tồn tại chưa (loại trừ user hiện tại)
        const existingUser = await User.findOne({
            username: username.trim(),
            _id: { $ne: req.user.id }
        });

        if (existingUser) {
            console.log('❌ Username đã tồn tại:', username);
            return res.status(400).json({ msg: 'Tên người dùng đã tồn tại' });
        }

        // Cập nhật thông tin user
        console.log('🔄 Đang cập nhật username...');
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username: username.trim() },
            { new: true, runValidators: true } // Trả về document mới và chạy validation
        ).select('-password'); // Không trả về password

        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        // Trả về thông tin user đã cập nhật
        res.json({
            success: true,
            msg: 'Cập nhật thông tin thành công',
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Validation đầu vào
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                msg: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                msg: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        // Lấy thông tin user kèm password để verify
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        // Xác minh mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Mật khẩu hiện tại không đúng' });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu trong database
        await User.findByIdAndUpdate(req.user.id, {
            password: hashedNewPassword
        });

        // Trả về kết quả thành công
        res.json({
            success: true,
            msg: 'Đổi mật khẩu thành công'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
