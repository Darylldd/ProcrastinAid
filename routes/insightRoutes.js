const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');

router.get('/', insightController.showInsights);

module.exports = router;
