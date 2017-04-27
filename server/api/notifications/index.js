const express = require('express');
const notificationController = require('./notifications.controller');
const router = express.Router();


router.get('/getAllNotifications', notificationController.getAllNotifications);
router.post('/submitResponse', notificationController.submitResponse);

module.exports = router;