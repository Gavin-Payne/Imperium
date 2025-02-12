const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    password: {
        type: String,
        required: true,
    },
    numberOfTransactions: {
        type: Number,
        default: 0,
    },
    winRate: {
        type: Number,
        default: 0,
    },
    winnings: {
        type: Number,
        default: 0,
    },
    LargestWin: {
        type: Number,
        default: 0,
    },
    LargestLoss: {
        type: Number, 
        default: 0,
    },
    
});

module.exports = mongoose.model('User', userSchema);
