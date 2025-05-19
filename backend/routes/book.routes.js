const bookController = require('../controllers/book.controller');
const express = require('express'); 
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

router.get('/', authenticateToken, bookController.getAllBooks);

module.exports = router;