const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    bookId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    returnDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['issued', 'returned', 'renewed'],
        default: 'issued',
    },
}, {
    timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;