const express = require('express');
const playerController = require('../controllers/playerController');


const router = express.Router();


// Routes cho Player
router.post('/google-login', playerController.googleLogin);
router.get('/fields', playerController.searchFields);    
router.post('/book-field', playerController.bookField);
router.get('/bookings/:userId', playerController.getUserBookings);
router.delete('/bookings/:bookingId', playerController.cancelBooking);
router.get('/home', playerController.playerHome);        


module.exports = router;