const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');


router.post('/users/register', AuthController.registerUser);
router.post('/users/login', AuthController.loginUser);
router.get('/user/logout', AuthController.logoutUser);

module.exports = router;
