// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');

// Route cập nhật thông tin người dùng
router.put('/me', authenticateUser, UserController.updateUser); // Cập nhật thông tin của người dùng hiện tại

// Route lấy thông tin người dùng
router.get('/me', authenticateUser, UserController.getUser); // Lấy thông tin của người dùng hiện tại

module.exports = router;
