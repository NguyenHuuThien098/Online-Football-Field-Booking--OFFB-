const express = require('express');
const router = express.Router();
const HistoryController = require('../controllers/HistoryController');


// Route cho lịch sử đặt sân của người chơi (Player)
router.get('/player/:userId/bookings', HistoryController.getUserBookingHistory);


// Route cho lịch sử đặt sân của các sân thuộc sở hữu của chủ sân (Field Owner)
router.get('/fieldowner/:ownerId/bookings', HistoryController.getFieldOwnerBookings);


module.exports = router;
