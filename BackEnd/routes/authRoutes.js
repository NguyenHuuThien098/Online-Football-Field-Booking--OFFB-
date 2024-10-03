const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser, authorizeRole } = require('../middleware/auth'); // Import middleware


// Định nghĩa các route cho đăng ký và đăng nhập
router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/PlayerPage', authController.playerpage);
// router.post('/FieldOwnerDashboard', authController.fieldownerdashboard);

router.get('/protected-route', authenticateUser, authorizeRole(['field_owner', 'player']), (req, res) => {
    res.send('Đây là một route được bảo vệ!');
});

module.exports = authRouters;