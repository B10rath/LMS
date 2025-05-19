const jwt = require('jsonwebtoken');
const generateToken = (user) => {
    const token = jwt.sign({ _id: user._id , role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
    return token;
};
module.exports = generateToken;