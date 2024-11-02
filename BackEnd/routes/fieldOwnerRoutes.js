const express = require('express');
const fieldOwnerController = require('../controllers/fieldOwnerController');


const router = express.Router();


// Routes cho Field Owner
router.post('/google-login', fieldOwnerController.googleLogin);
router.post('/add-field', fieldOwnerController.addField);
router.put('/update-field/:fieldId', fieldOwnerController.updateField);
router.delete('/delete-field/:fieldId', fieldOwnerController.deleteField);
router.get('/fields/:ownerId', fieldOwnerController.getOwnedFields);
router.get('/home', fieldOwnerController.fieldOwnerHome);


module.exports = router;
