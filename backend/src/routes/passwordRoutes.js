const express = require('express');
const router = express.Router();
const {
    getPasswords,
    createPassword,
    getDecryptedPassword,
    updatePassword,
    deletePassword,
    getDeletedPasswords,
    restorePassword,
    deletePasswordPermanently
} = require('../controllers/passwordController');
const auth = require('../middleware/authMiddleware');

// Middleware xác thực được áp dụng cho tất cả routes trong file này
router.use(auth);

// Routes cho /api/passwords
router.route('/')
    .get(getPasswords)       // GET - Lấy tất cả mật khẩu của người dùng
    .post(createPassword);    // POST - Tạo mật khẩu mới

// Routes cho /api/passwords/:id
router.route('/:id')
    .put(updatePassword)     // PUT - Cập nhật mật khẩu cụ thể
    .delete(deletePassword); // DELETE - Xóa mật khẩu cụ thể

// Route để lấy phiên bản đã giải mã của mật khẩu cụ thể
router.get('/:id/decrypt', getDecryptedPassword);

// Routes liên quan đến thùng rác
router.get('/trash', getDeletedPasswords);           // Lấy danh sách mật khẩu đã xóa
router.put('/:id/restore', restorePassword);         // Khôi phục mật khẩu từ thùng rác
router.delete('/:id/permanent', deletePasswordPermanently); // Xóa vĩnh viễn mật khẩu

module.exports = router;
