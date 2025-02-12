const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: String,
  player: String,
  date: Date,
  condition: String,
  value: Number,
  metric: String,
  duration: Number,
  betSize: Number,
  betType: String,
  multiplier: Number,
  expirationTime: Date,
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  refunded: { type: Boolean, default: false } // New field
});

module.exports = mongoose.model('Auction', auctionSchema);