const CryptoJS = require('crypto-js');

// Lấy khóa mã hóa từ biến môi trường
const secretKey = process.env.ENCRYPTION_KEY;

if (!secretKey) {
    throw new Error("ENCRYPTION_KEY chưa được thiết lập trong biến môi trường.");
}

/**
 * Mã hóa văn bản sử dụng AES
 * @param {string} text - Văn bản cần mã hóa
 * @returns {string} - Văn bản đã được mã hóa
 */
const encrypt = (text) => {
    console.log('🔐 Đang mã hóa văn bản...');
    const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
    console.log('✅ Đã mã hóa thành công');
    return encrypted;
};

/**
 * Giải mã văn bản sử dụng AES
 * @param {string} ciphertext - Văn bản cần giải mã
 * @returns {string} - Văn bản đã được giải mã
 */
const decrypt = (ciphertext) => {
    console.log('🔓 Đang giải mã văn bản...');
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log('✅ Đã giải mã thành công');
    return decrypted;
};

module.exports = { encrypt, decrypt };
