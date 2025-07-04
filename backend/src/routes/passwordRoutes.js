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

// The auth middleware is applied to all routes in this file
router.use(auth);

// Routes for /api/passwords
router.route('/')
    .get(getPasswords)       // GET all passwords for the user
    .post(createPassword);    // POST a new password

// Routes for /api/passwords/:id
router.route('/:id')
    .put(updatePassword)     // PUT (update) a specific password
    .delete(deletePassword); // DELETE a specific password

// Route to get a decrypted version of a specific password
router.get('/:id/decrypt', getDecryptedPassword);

// Trash-related routes
router.get('/trash', getDeletedPasswords);
router.put('/:id/restore', restorePassword);
router.delete('/:id/permanent', deletePasswordPermanently);

module.exports = router;
