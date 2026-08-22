const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const { authenticateJwt } = require('../middleware/authMiddleware');

router.use(authenticateJwt);

router.get('/', usageController.getUsage);
router.get('/stats', usageController.getStats);
router.get('/endpoints', usageController.getEndpoints);

module.exports = router;
