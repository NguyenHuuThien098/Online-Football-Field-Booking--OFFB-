const express = require('express');
const fieldOwnerController = require('../controllers/fieldOwnerController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Route để tạo sân lớn
router.post('/large-field', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.addLargeField);

// Route để tạo sân nhỏ
router.post('/large-field/:largeFieldId/small-field', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.addSmallField);

// Route để cập nhật sân lớn
router.put('/large-field/:fieldId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.updateLargeField);

// Route để cập nhật sân nhỏ
router.put('/large-field/:largeFieldId/small-field/:fieldId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.updateSmallField);

// Route để xóa sân lớn
router.delete('/large-field/:fieldId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.deleteLargeField);

// Route để xóa sân nhỏ
router.delete('/large-field/:largeFieldId/small-field/:fieldId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.deleteSmallField);

// Route để lấy danh sách sân của Field Owner
router.get('/fields/:ownerId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.getOwnedFields);

// Trang chủ của Field Owner
router.get('/home', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.fieldOwnerHome);

module.exports = router;