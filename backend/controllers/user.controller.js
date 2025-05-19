const Transaction= require('../models/transaction.model');

const userBookHistory = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const transactions = await Transaction.find({ userId: id }).populate('bookId').populate('userId', { password: 0 });
        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found for this user' });
        }
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
module.exports =  {userBookHistory}
