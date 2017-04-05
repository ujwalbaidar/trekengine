const express = require('express');
const featuresController = require('./feature.controller');
const router = express.Router();


router.post('/submit', featuresController.createFeature);
router.get('/getAll', featuresController.getFeature);
router.put('/update', featuresController.updateFeature);
router.delete('/delete', featuresController.deleteFeature);

module.exports = router;