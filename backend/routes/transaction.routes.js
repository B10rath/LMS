const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/admin.controller');
const {authenticateToken,isAdmin} = require('../middleware/auth');


router.post('/', authenticateToken,isAdmin, transactionController.issueBook);
router.get('/', authenticateToken,isAdmin, transactionController.getAllTransactions);
router.put('/:id', authenticateToken,isAdmin, transactionController.updateBookStock);
router.post('/add', authenticateToken,isAdmin, transactionController.addBook);
router.get('/all', authenticateToken,isAdmin, transactionController.getAllUsers);
router.put('/return/:id', authenticateToken,isAdmin, transactionController.returnBook);
router.put('/renew/:id', authenticateToken,isAdmin, transactionController.renewBook);

module.exports = router;

