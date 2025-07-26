const express = require('express');
const { body, validationResult } = require('express-validator');
const Web3 = require('web3');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

const router = express.Router();
const web3 = new Web3(process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID');

// Send cryptocurrency
router.post('/send', auth, [
  body('fromWalletId').isMongoId(),
  body('toAddress').isEthereumAddress(),
  body('amount').isNumeric({ gt: 0 }),
  body('tokenSymbol').isLength({ min: 1 }),
  body('network').isIn(['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      fromWalletId, 
      toAddress, 
      amount, 
      tokenSymbol, 
      network,
      notes,
      recipientName,
      recipientPhone 
    } = req.body;

    // Find sender's wallet
    const fromWallet = await Wallet.findOne({
      _id: fromWalletId,
      userId: req.userId
    });

    if (!fromWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if sender has sufficient balance
    const currentBalance = parseFloat(fromWallet.getBalance(tokenSymbol));
    const sendAmount = parseFloat(amount);

    if (currentBalance < sendAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check if recipient is a registered user
    let toUserId = null;
    const recipientWallet = await Wallet.findOne({ 
      address: toAddress.toLowerCase() 
    });
    if (recipientWallet) {
      toUserId = recipientWallet.userId;
    }

    // Generate transaction hash (in real implementation, this would come from blockchain)
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);

    // Create transaction record
    const transaction = new Transaction({
      txHash,
      fromAddress: fromWallet.address,
      toAddress: toAddress.toLowerCase(),
      fromUserId: req.userId,
      toUserId,
      amount: amount.toString(),
      token: {
        symbol: tokenSymbol,
        address: tokenSymbol === 'ETH' ? null : getTokenAddress(tokenSymbol),
        decimals: 18
      },
      network,
      type: 'send',
      status: 'pending',
      notes,
      metadata: {
        recipientName,
        recipientPhone
      }
    });

    await transaction.save();

    // Update sender's balance (optimistic update)
    const newBalance = (currentBalance - sendAmount).toString();
    await fromWallet.updateBalance(tokenSymbol, newBalance);

    // Add transaction to sender's wallet
    fromWallet.transactions.push(transaction._id);
    await fromWallet.save();

    // If recipient is registered, update their balance and add transaction
    if (recipientWallet) {
      const recipientBalance = parseFloat(recipientWallet.getBalance(tokenSymbol));
      const newRecipientBalance = (recipientBalance + sendAmount).toString();
      await recipientWallet.updateBalance(tokenSymbol, newRecipientBalance);
      
      recipientWallet.transactions.push(transaction._id);
      await recipientWallet.save();

      // Create receive transaction for recipient
      const receiveTransaction = new Transaction({
        txHash: txHash + '_receive',
        fromAddress: fromWallet.address,
        toAddress: recipientWallet.address,
        fromUserId: req.userId,
        toUserId: recipientWallet.userId,
        amount: amount.toString(),
        token: {
          symbol: tokenSymbol,
          address: tokenSymbol === 'ETH' ? null : getTokenAddress(tokenSymbol),
          decimals: 18
        },
        network,
        type: 'receive',
        status: 'pending'
      });

      await receiveTransaction.save();
    }

    // Simulate transaction confirmation (in real app, you'd listen to blockchain events)
    setTimeout(async () => {
      try {
        await transaction.updateStatus('confirmed', Math.floor(Math.random() * 1000000), txHash);
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
    }, 5000);

    res.json({
      message: 'Transaction initiated successfully',
      transaction: {
        txHash,
        amount,
        tokenSymbol,
        toAddress,
        status: 'pending',
        estimatedConfirmation: '2-5 minutes'
      }
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user transactions
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (page - 1) * limit;

    let filter = {
      $or: [{ fromUserId: req.userId }, { toUserId: req.userId }]
    };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate('fromUserId', 'username profilePicture phoneNumber')
      .populate('toUserId', 'username profilePicture phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific transaction
router.get('/:txHash', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      txHash: req.params.txHash,
      $or: [{ fromUserId: req.userId }, { toUserId: req.userId }]
    })
    .populate('fromUserId', 'username profilePicture phoneNumber')
    .populate('toUserId', 'username profilePicture phoneNumber');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history for a specific wallet
router.get('/wallet/:walletId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      userId: req.userId
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transactions = await Transaction.find({
      $or: [
        { fromAddress: wallet.address },
        { toAddress: wallet.address }
      ]
    })
    .populate('fromUserId', 'username profilePicture')
    .populate('toUserId', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request cryptocurrency from another user
router.post('/request', auth, [
  body('fromUserPhone').isMobilePhone(),
  body('amount').isNumeric({ gt: 0 }),
  body('tokenSymbol').isLength({ min: 1 }),
  body('message').optional().isLength({ max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fromUserPhone, amount, tokenSymbol, message } = req.body;

    // Find the user to request from
    const fromUser = await User.findOne({ phoneNumber: fromUserPhone });
    if (!fromUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestingUser = await User.findById(req.userId);

    // In a real app, you might send a push notification or SMS
    // For now, we'll just return success
    res.json({
      message: 'Payment request sent successfully',
      request: {
        to: fromUser.username,
        amount,
        tokenSymbol,
        message,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Request payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Get total sent and received amounts
    const sentTransactions = await Transaction.aggregate([
      { $match: { fromUserId: userId, status: 'confirmed' } },
      { $group: { _id: '$token.symbol', total: { $sum: { $toDouble: '$amount' } } } }
    ]);

    const receivedTransactions = await Transaction.aggregate([
      { $match: { toUserId: userId, status: 'confirmed' } },
      { $group: { _id: '$token.symbol', total: { $sum: { $toDouble: '$amount' } } } }
    ]);

    // Get recent transaction count
    const recentCount = await Transaction.countDocuments({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.json({
      sent: sentTransactions,
      received: receivedTransactions,
      recentTransactionCount: recentCount
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get token contract address
function getTokenAddress(symbol) {
  const tokenAddresses = {
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'USDC': '0xA0b86a33E6417c6c61f7c8E2Bd3dd6Df8B1f9C29',
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    // Add more token addresses as needed
  };
  return tokenAddresses[symbol] || null;
}

module.exports = router;