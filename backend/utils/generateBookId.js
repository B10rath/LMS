const {nanoid} = require('nanoid');

const generateBookId = () => {
    const bookId = nanoid(6);
    return bookId;
}

module.exports = generateBookId;