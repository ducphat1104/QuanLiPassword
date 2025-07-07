const { body, validationResult } = require('express-validator');

/**
 * Quy tắc validation cho đăng ký người dùng mới
 * Kiểm tra username và password theo các tiêu chuẩn bảo mật
 */
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),
];

/**
 * Quy tắc validation cho đăng nhập
 * Kiểm tra username và password có được cung cấp không
 */
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Tên đăng nhập là bắt buộc'),

    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc'),
];

/**
 * Quy tắc validation cho cập nhật profile
 * Kiểm tra username theo cùng tiêu chuẩn với đăng ký
 */
const validateProfileUpdate = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới'),
];

/**
 * Quy tắc validation cho đổi mật khẩu
 * Kiểm tra mật khẩu cũ, mới và đảm bảo mật khẩu mới khác mật khẩu cũ
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại là bắt buộc'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
            }
            return true;
        }),
];

/**
 * Middleware xử lý lỗi validation
 * Kiểm tra kết quả validation và trả về lỗi nếu có
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            msg: 'Dữ liệu không hợp lệ',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
    handleValidationErrors
};
