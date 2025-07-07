const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Lấy token từ header
    const token = req.header('x-auth-token');

    // Kiểm tra xem có token không
    if (!token) {
        console.log('❌ Không có token, từ chối truy cập cho:', req.originalUrl);
        return res.status(401).json({ msg: 'Không có token, từ chối ủy quyền' });
    }

    // Xác minh token
    try {
        console.log('🔍 Đang xác minh JWT token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Thêm thông tin user từ payload vào request object
        req.user = decoded.user;
        console.log('✅ Token hợp lệ cho user ID:', req.user.id);
        next();
    } catch (err) {
        console.log('❌ Token không hợp lệ:', err.message);
        res.status(401).json({ msg: 'Token không hợp lệ' });
    }
};
