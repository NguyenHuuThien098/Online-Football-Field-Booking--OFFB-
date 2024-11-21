const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Lấy danh sách tất cả tài khoản
router.get('/users', adminController.getAllUsers);

// Lấy thông tin chi tiết tài khoản
router.get('/users/:uid', adminController.getUserById);

// Xóa tài khoản
router.delete('/users/:uid', adminController.deleteUser);

// Thay đổi vai trò tài khoản
router.patch('/users/:uid/role', adminController.updateUserRole);

// Đăng nhập Google với vai trò admin
router.post('/login/google', adminController.googleLogin);

module.exports = router;
