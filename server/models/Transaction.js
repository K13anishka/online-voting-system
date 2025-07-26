const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if sending to external address
  },
  amount: {
    type: String,
    required: true
  },
  token: {
    symbol: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default: null // null for native tokens
    },
    decimals: {
      type: Number,
      default: 18
    }
  },
  network: {
    type: String,
    enum: ['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum'],
    required: true
  },
  gasUsed: {
    type: String,
    default: '0'
  },
  gasPrice: {
    type: String,
    default: '0'
  },
  transactionFee: {
    type: String,
    default: '0'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['send', 'receive', 'swap', 'stake', 'unstake'],
    required: true
  },
  blockNumber: {
    type: Number,
    default: null
  },
  blockHash: {
    type: String,
    default: null
  },
  confirmations: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  metadata: {
    recipientName: String,
    recipientPhone: String,
    category: String,
    description: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ fromUserId: 1, createdAt: -1 });
transactionSchema.index({ toUserId: 1, createdAt: -1 });
transactionSchema.index({ txHash: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ fromAddress: 1 });
transactionSchema.index({ toAddress: 1 });

// Method to update transaction status
transactionSchema.methods.updateStatus = function(status, blockNumber = null, blockHash = null) {
  this.status = status;
  if (blockNumber) this.blockNumber = blockNumber;
  if (blockHash) this.blockHash = blockHash;
  if (status === 'confirmed') this.confirmedAt = new Date();
  
  return this.save();
};

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { fromUserId: userId },
      { toUserId: userId }
    ]
  })
  .populate('fromUserId', 'username profilePicture')
  .populate('toUserId', 'username profilePicture')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Virtual for transaction direction
transactionSchema.virtual('direction').get(function() {
  return this.type === 'receive' ? 'incoming' : 'outgoing';
});

transactionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);