const express = require('express');
const fieldOwnerController = require('../controllers/fieldOwnerController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Routes cho Field Owner
router.post('/google-login', fieldOwnerController.googleLogin);

// Route để thêm sân lớn
router.post('/add-large-field', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.addLargeField);

// Route để thêm sân nhỏ
router.post('/add-smallfield', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.addSmallField);

// Route để cập nhật sân
router.put('/update-field/:fieldId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.updateField);

// Route để xóa sân
router.delete('/delete-field/:fieldId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.deleteField);

// Route để lấy danh sách sân của Field Owner
router.get('/fields/:ownerId', authenticateUser, authorizeRole(['field_owner']), fieldOwnerController.getOwnedFields);

router.get('/home', fieldOwnerController.fieldOwnerHome);

module.exports = router;
