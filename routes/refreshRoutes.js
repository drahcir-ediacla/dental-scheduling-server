const express = require('express');
const router = express.Router();
const RefreshTokenController = require('../controllers/refreshTokenController');


router.get('/refresh', RefreshTokenController.handleRefreshToken);

module.exports = router;
