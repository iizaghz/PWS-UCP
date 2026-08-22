const express = require('express');
const router = express.Router();
const keysController = require('../controllers/keysController');
const { authenticateJwt } = require('../middleware/authMiddleware');

router.use(authenticateJwt);

router.post('/', keysController.createKey);
router.get('/', keysController.listKeys);
router.get('/:id', keysController.getKey);
router.patch('/:id/revoke', keysController.revokeKey);
router.delete('/:id', keysController.deleteKey);

module.exports = router;
