// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, updateProfile, changePassword, addAddress, deleteAddress } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;
