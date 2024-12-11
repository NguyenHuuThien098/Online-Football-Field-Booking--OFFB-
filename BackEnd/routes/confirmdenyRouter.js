const express = require('express');
const router = express.Router();
const FieldController = require('../controllers/confirmdenycontroller'); // Import controller
const { authenticateUser, authorizeRole } = require('../middleware/auth');
// Lấy danh sách các sân của chủ sở hữu và các yêu cầu đặt sân của họ
router.get('/owner/:ownerId/bookings',authenticateUser, authorizeRole(['field_owner']), FieldController.getBookingsForOwner);

// Xác nhận yêu cầu đặt sân
router.post('/bookings/:bookingId/confirm',authenticateUser, authorizeRole(['field_owner']), FieldController.confirmBooking);

// Từ chối yêu cầu đặt sân
router.post('/bookings/:bookingId/reject', authenticateUser, authorizeRole(['field_owner']),FieldController.rejectBooking);

module.exports = router;
