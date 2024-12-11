const express = require('express');
const playerController = require('../controllers/playerController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Routes cho Player
// Đăng nhập bằng Google
router.post('/google-login', playerController.googleLogin);

// Route để tìm kiếm sân
router.get('/fields', authenticateUser, authorizeRole(['player']), playerController.searchFields);

// Route để đặt sân
router.post('/book-field', authenticateUser, authorizeRole(['player']), playerController.bookField);

// Route để lấy danh sách đặt sân của Player
router.get('/bookings/:userId', authenticateUser, authorizeRole(['player']), playerController.getUserBookings);

// Route để hủy đặt sân
router.delete('/bookings/:bookingId', authenticateUser, authorizeRole(['player']), playerController.cancelBooking);

// Trang chủ của Player
router.get('/home', authenticateUser, authorizeRole(['player']), playerController.playerHome);

module.exports = router;