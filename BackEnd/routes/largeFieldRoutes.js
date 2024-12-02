const express = require('express');
const router = express.Router();
const largeFieldController = require('../controllers/largeFieldController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Route để tạo sân lớn
router.post('/', authenticateUser, authorizeRole(['admin', 'field_owner']), largeFieldController.createLargeField);

// Route để lấy thông tin sân lớn theo ID
router.get('/:largeFieldId', largeFieldController.getLargeFieldById);

// Route để cập nhật sân lớn
router.put('/:largeFieldId', authenticateUser, authorizeRole(['admin', 'field_owner']), largeFieldController.updateLargeField);

// Route để xóa sân lớn
router.delete('/:largeFieldId', authenticateUser, authorizeRole(['admin', 'field_owner']), largeFieldController.deleteLargeField);

// Route để lấy danh sách tất cả các sân lớn
router.get('/', largeFieldController.getAllLargeFields);

// Route để lấy danh sách sân nhỏ thuộc sân lớn
router.get('/:largeFieldId/fields', largeFieldController.getFieldsByLargeField);

module.exports = router;