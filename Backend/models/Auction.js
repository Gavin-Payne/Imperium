const mongoose = require('mongoose');

const auctionDate = new Date();

const auctionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: String,
  player: String,
  date: Date,        // Current usage: auction creation date
  gameDate: Date,    // NEW FIELD: actual game date
  condition: String,
  value: Number,
  metric: String,
  duration: Number,
  betSize: Number,
  betType: String,
  multiplier: Number,
  expirationTime: Date,
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  refunded: { type: Boolean, default: false }
});

module.exports = mongoose.model('Auction', auctionSchema);