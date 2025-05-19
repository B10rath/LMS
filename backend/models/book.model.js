//before saving check if current stock is greater than 0
//set isAvailable to true
const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    bookId: {
        type: String,
        required: true,
        unique: true,
    },
    currentStock:{
        type: Number,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    totalStock: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});
// Middleware to check if current stock is greater than 0
bookSchema.pre('save', function(next) {
    if (this.currentStock > 0) {
        this.isAvailable = true;
    } else {
        this.isAvailable = false;
    }
    next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
