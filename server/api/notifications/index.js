const express = require('express');
const notificationController = require('./notifications.controller');
const router = express.Router();


router.get('/getAllNotifications', notificationController.getAllNotifications);
router.get('/getNewNotifications', notificationController.getNewNotifications);
router.post('/submitResponse', notificationController.submitResponse);
router.put('/updateNotificationData', notificationController.updateNotificationData);

module.exports = router;