// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser, authorizeRole } = require('../middleware/auth')

// Định nghĩa các route cho đăng ký và đăng nhập
router.post('/register', authController.register);
router.post('/login/google', authController.loginWithGoogle);


// Route bảo vệ cho người dùng
router.get('/api/auth', authenticateUser, authorizeRole(['field_owner', 'player']), (req, res) => {
    res.send('Đây là một route được bảo vệ!');
});



module.exports = router;