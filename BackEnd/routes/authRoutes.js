// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser, authorizeRole, authenticateToken } = require('../middleware/auth')

// Định nghĩa các route cho đăng ký và đăng nhập
router.post('/register/google', authController.registerWithGoogle);
router.post('/login/google', authController.loginWithGoogle);

// Route để lấy danh sách người chơi do chủ sân làm chủ
router.get('/field-owner/:uid/players', authenticateUser, authorizeRole(['field_owner']), authController.getPlayersByFieldOwner);

// Route bảo vệ cho người dùng
router.get('/api/auth', authenticateUser, authorizeRole(['field_owner', 'player', 'admin']), (req, res) => {
    res.send('Đây là một route được bảo vệ!');
});


// Route để kiểm tra token
router.get('/check-token', authenticateToken, (req, res) => {
    res.sendStatus(200); // Nếu token hợp lệ, trả về 200
});
module.exports = router;