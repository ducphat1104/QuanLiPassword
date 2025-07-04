const CryptoJS = require('crypto-js');

const secretKey = process.env.ENCRYPTION_KEY;

if (!secretKey) {
    throw new Error("ENCRYPTION_KEY is not set in the environment variables.");
}

/**
 * Encrypts a text using AES.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text.
 */
const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

/**
 * Decrypts a text using AES.
 * @param {string} ciphertext - The text to decrypt.
 * @returns {string} - The decrypted text.
 */
const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
