const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true
  },
  walletType: {
    type: String,
    enum: ['metamask', 'walletconnect', 'coinbase', 'trust', 'custom'],
    required: true
  },
  network: {
    type: String,
    enum: ['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum'],
    default: 'ethereum'
  },
  name: {
    type: String,
    default: 'My Wallet'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  balances: [{
    token: {
      type: String,
      required: true // ETH, USDT, USDC, etc.
    },
    tokenAddress: {
      type: String,
      default: null // null for native tokens like ETH
    },
    balance: {
      type: String,
      default: '0'
    },
    decimals: {
      type: Number,
      default: 18
    },
    symbol: {
      type: String,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
walletSchema.index({ userId: 1, address: 1 });
walletSchema.index({ address: 1 });

// Method to update balance
walletSchema.methods.updateBalance = function(tokenSymbol, newBalance) {
  const tokenIndex = this.balances.findIndex(b => b.symbol === tokenSymbol);
  
  if (tokenIndex >= 0) {
    this.balances[tokenIndex].balance = newBalance;
    this.balances[tokenIndex].lastUpdated = new Date();
  } else {
    // Add new token balance
    this.balances.push({
      token: tokenSymbol,
      balance: newBalance,
      symbol: tokenSymbol,
      lastUpdated: new Date()
    });
  }
  
  return this.save();
};

// Method to get balance for a specific token
walletSchema.methods.getBalance = function(tokenSymbol) {
  const token = this.balances.find(b => b.symbol === tokenSymbol);
  return token ? token.balance : '0';
};

module.exports = mongoose.model('Wallet', walletSchema);