const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
    const { name, email, password, admno, branch, semester } = req.body;
    if (!name || !email || !password || !admno || !branch || !semester) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const userExists = await User.findOne({ $or: [{ email }, { admno }] });
        if (userExists) {
            const message = userExists.email === email 
                ? 'User already exists' 
                : 'Admission number already exists';
            return res.status(400).json({ message });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            admno,
            branch,
            semester
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
    
};
const logIn = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user);
        const { password: userPassword, ...rest } = user._doc;
        const expiryTime = 60 * 60 * 24;
        res.cookie('authToken', token, { httpOnly: true, maxAge: expiryTime * 1000 });
        res.status(200).json({ message: 'Sign-in successful' , token: token, user: rest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error signing in' });
    }
}

const logout = (req, res) => {
    res.clearCookie('authToken');
    res.status(200).json({ message: 'Logged out successfully' });
}


module.exports = { register, logIn , logout };