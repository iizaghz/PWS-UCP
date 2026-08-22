const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJwt } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateJwt, authController.me);
router.post('/logout', authenticateJwt, authController.logout);

module.exports = router;
