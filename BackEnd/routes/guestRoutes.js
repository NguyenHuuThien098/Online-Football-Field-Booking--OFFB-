// guestRoutes.js
const express = require('express');
const guestController = require('../controllers/guestController'); // Đảm bảo bạn đã nhập đúng đường dẫn
const router = express.Router();


// Route tìm sân cho guest
router.get('/search', guestController.searchFields);


// Route đặt sân cho guest (chuyển đến player)
router.post('/book', guestController.bookField);


module.exports = router;
