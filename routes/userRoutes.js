const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');


router.get('/get/user/auth', UserController.getAuthUser);
router.get('/get/users', UserController.getallUsers);

module.exports = router;
