const express = require('express');
const feedbackMessageCtrl = require('./feedbackMessages.controller');
const router = express.Router();

router.get('/find', feedbackMessageCtrl.getAdminFeedback);
router.post('/create', feedbackMessageCtrl.saveFeedbackMessage);
router.put('/update', feedbackMessageCtrl.updateFeedbackMessage);

module.exports = router;