const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController'); // Import matchController
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Route để tạo trận đấu
router.post('/', authenticateUser, authorizeRole(['field_owner']), matchController.createMatch);

// Route để lấy danh sách trận đấu
router.get('/', matchController.getMatches);

// Route để lấy thông tin một trận đấu theo ID
router.get('/:id', matchController.getMatchById); // Endpoint để lấy thông tin của trận đấu theo ID

// Route để chỉnh sửa trận đấu
router.put('/:id', authenticateUser, authorizeRole(['field_owner']), matchController.editMatch);

// Route để xóa trận đấu
router.delete('/:id', authenticateUser, authorizeRole(['field_owner']), matchController.removeMatch);

module.exports = router;