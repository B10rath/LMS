const Transaction = require('../models/transaction.model');
const Book = require('../models/book.model');
const User = require('../models/user.model');
const generateBookId = require('../utils/generateBookId');
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('bookId').populate('userId', { password: 0 });
        res.status(200).json(transactions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
const issueBook = async (req, res) => {
    const { bookId, admno } = req.body;
    if (!bookId || !admno) {
        return res.status(400).json({ message: 'Book ID and Admission number are required' });
    }
    try {
        const book = await Book.findOne({ bookId });
        const userId = await User.findOne({ admno });
        if (!userId) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (!book.isAvailable) {
            return res.status(400).json({ message: 'Book is not available for issue' });
        }
        
        const retDate = new Date();
        retDate.setMonth(retDate.getMonth() + 1);
        const transaction = new Transaction({
            bookId: book._id,
            userId: userId._id,
            issueDate: new Date(),
            dueDate: retDate,
            status: 'issued'
        });
        await transaction.save();
        book.currentStock -= 1;
        book.isAvailable = book.currentStock > 0;
        await book.save();
        res.status(201).json({ message: 'Book issued successfully', transaction });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const returnBook = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Transaction ID is required' });
    }
    try {
        const transaction = await Transaction.findById(id).populate('bookId');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        transaction.status = 'returned';
        transaction.returnDate = new Date();
        await transaction.save();
        const book = await Book.findById(transaction.bookId._id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        book.currentStock += 1;
        book.isAvailable = true;
        await book.save();
        res.status(200).json({ message: 'Book returned successfully', transaction });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const addBook = async (req, res) => {
    const { title, totalStock } = req.body;
    if (!title || !totalStock) {
        return res.status(400).json({ message: 'Title and Total Stock are required' });
    }
    try {
        let bookId = generateBookId();
        let bookIdExists = await Book.findOne({ bookId });
        if (bookIdExists) {
            while (bookIdExists) {
                bookId = generateBookId();
                bookIdExists = await Book.findOne({ bookId });
            }  
        }
        const newBook = new Book({
            title,
            bookId,
            currentStock: totalStock,
            totalStock
        });
        await newBook.save();
        res.status(201).json({ message: 'Book added successfully', book: newBook });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateBookStock = async (req, res) => {
    const {id} = req.params;
    const {  newStockTobeAdded } = req.body;
    if (!id || !newStockTobeAdded) {
        return res.status(400).json({ message: 'Book ID and New Stock are required' });
    }
    try {
        const book = await
        Book.findById(id );
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        book.currentStock += newStockTobeAdded;
        book.totalStock += newStockTobeAdded;
        book.isAvailable = book.currentStock > 0;
        await book.save();
        res.status(200).json({ message: 'Book stock updated successfully', book });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
const getAllUsers = async (req, res) => {
    try {
        //fetch users other than admin
        const users = await User.find({ role: { $ne: 'admin' } }, { password: 0 });
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' });
    }
}
const renewBook = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Transaction ID is required' });
    }
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        const dueDate = new Date(transaction.dueDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
        transaction.dueDate = dueDate;
        transaction.status = 'renewed';
        await transaction.save();
        res.status(200).json({ message: 'Book renewed successfully', transaction });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getAllTransactions,
    issueBook,
    returnBook,
    addBook,
    updateBookStock,
    getAllUsers,
    renewBook
};
        