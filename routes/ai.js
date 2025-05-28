const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// GET /ai/insights
router.get('/insights', aiController.getInsights);

module.exports = router;
