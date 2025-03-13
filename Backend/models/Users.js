const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String 
  },
  silver: { 
    type: Number, 
    default: 1000 
  },
  gold: { 
    type: Number, 
    default: 1000 
  },
  transactions: { 
    type: Number, 
    default: 0 
  },
  winRate: { 
    type: Number, 
    default: 0 
  },
  winnings: { 
    type: Number, 
    default: 0 
  },
  // Add this field to track when user last collected daily allowance
  lastDailyAllowance: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('User', userSchema);
