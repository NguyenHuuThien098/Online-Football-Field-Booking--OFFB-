const express = require('express');
const fieldController = require('../controllers/fieldController');


const router = express.Router();


// Route cho người dùng không đăng nhập
router.get('/available-fields', fieldController.getAvailableFields);


module.exports = router