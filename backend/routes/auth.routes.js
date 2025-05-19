const authController = require('../controllers/auth.controller');
const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.logIn);
router.get('/logout',authenticateToken, authController.logout);

module.exports = router;