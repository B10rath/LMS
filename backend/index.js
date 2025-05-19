const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./config/db');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const bookRoutes = require('./routes/book.routes');
const transactionRoutes = require('./routes/transaction.routes');
const userRoutes = require('./routes/user.routes');

app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/books', bookRoutes);
app.use('/v1/api/transactions', transactionRoutes);
app.use('/v1/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Api is Working');
});

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});