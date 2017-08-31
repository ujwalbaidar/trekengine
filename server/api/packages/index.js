const express = require('express');
const packagesCtrl = require('./packages.controller');
const router = express.Router();


router.post('/submit', packagesCtrl.createPackage);
router.get('/getAll', packagesCtrl.getPackage);
router.get('/byQuery', packagesCtrl.getPackageByQuery);
router.get('/getPackageById', packagesCtrl.getPackageById);

router.put('/update', packagesCtrl.updatePackage);
router.delete('/delete', packagesCtrl.deletePackage);

module.exports = router;