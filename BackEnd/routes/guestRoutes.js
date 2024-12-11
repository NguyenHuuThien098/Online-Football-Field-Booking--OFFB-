// guestRoutes.js
const express = require('express');
const guestController = require('../controllers/guestController'); // Đảm bảo bạn đã nhập đúng đường dẫn
const router = express.Router();

const fieldController = require('../controllers/fieldController');

// Route để lấy tất cả thông tin sân công khai
router.get('/fields', fieldController.getAllFieldsPublic);


// Route tìm sân cho guest
router.get('/search', guestController.searchFields);


// // Route đặt sân cho guest (chuyển đến player)
// router.post('/book', guestController.bookField);


module.exports = router;
