const express = require('express');
const { body, validationResult } = require('express-validator');
const Web3 = require('web3');
const { ethers } = require('ethers');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const router = express.Router();

// Initialize Web3 (you can configure different networks)
const web3 = new Web3(process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID');

// Connect wallet
router.post('/connect', auth, [
  body('address').isEthereumAddress(),
  body('walletType').isIn(['metamask', 'walletconnect', 'coinbase', 'trust', 'custom']),
  body('network').optional().isIn(['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address, walletType, network = 'ethereum', name } = req.body;

    // Check if wallet already exists for this user
    const existingWallet = await Wallet.findOne({ 
      userId: req.userId, 
      address: address.toLowerCase() 
    });

    if (existingWallet) {
      return res.status(400).json({ message: 'Wallet already connected' });
    }

    // Create new wallet
    const wallet = new Wallet({
      userId: req.userId,
      address: address.toLowerCase(),
      walletType,
      network,
      name: name || `${walletType} Wallet`
    });

    await wallet.save();

    // Add wallet to user's wallets array
    await User.findByIdAndUpdate(req.userId, {
      $push: { wallets: wallet._id }
    });

    // Fetch initial balance
    try {
      const balance = await web3.eth.getBalance(address);
      const ethBalance = web3.utils.fromWei(balance, 'ether');
      
      wallet.balances.push({
        token: 'ETH',
        balance: ethBalance,
        symbol: 'ETH',
        decimals: 18
      });
      
      await wallet.save();
    } catch (balanceError) {
      console.error('Error fetching balance:', balanceError);
    }

    res.status(201).json({
      message: 'Wallet connected successfully',
      wallet
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user wallets
router.get('/', auth, async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.userId, isActive: true })
      .sort({ createdAt: -1 });

    res.json(wallets);
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific wallet
router.get('/:walletId', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      userId: req.userId
    }).populate('transactions');

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update wallet balances
router.post('/:walletId/refresh-balance', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      userId: req.userId
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Refresh ETH balance
    try {
      const balance = await web3.eth.getBalance(wallet.address);
      const ethBalance = web3.utils.fromWei(balance, 'ether');
      
      await wallet.updateBalance('ETH', ethBalance);

      res.json({
        message: 'Balance updated successfully',
        balance: ethBalance
      });
    } catch (balanceError) {
      console.error('Error refreshing balance:', balanceError);
      res.status(500).json({ message: 'Error refreshing balance' });
    }
  } catch (error) {
    console.error('Refresh balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add custom token
router.post('/:walletId/add-token', auth, [
  body('tokenAddress').isEthereumAddress(),
  body('symbol').isLength({ min: 1, max: 10 }),
  body('decimals').isInt({ min: 0, max: 18 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenAddress, symbol, decimals } = req.body;

    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      userId: req.userId
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if token already exists
    const existingToken = wallet.balances.find(b => 
      b.tokenAddress?.toLowerCase() === tokenAddress.toLowerCase()
    );

    if (existingToken) {
      return res.status(400).json({ message: 'Token already added' });
    }

    // Add token to wallet
    wallet.balances.push({
      token: symbol,
      tokenAddress: tokenAddress.toLowerCase(),
      balance: '0',
      symbol,
      decimals
    });

    await wallet.save();

    res.json({
      message: 'Token added successfully',
      wallet
    });
  } catch (error) {
    console.error('Add token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove wallet
router.delete('/:walletId', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      userId: req.userId
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Soft delete - mark as inactive
    wallet.isActive = false;
    await wallet.save();

    // Remove from user's wallets array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { wallets: wallet._id }
    });

    res.json({ message: 'Wallet removed successfully' });
  } catch (error) {
    console.error('Remove wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get wallet balance for specific token
router.get('/:walletId/balance/:tokenSymbol', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      userId: req.userId
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const balance = wallet.getBalance(req.params.tokenSymbol);
    
    res.json({
      tokenSymbol: req.params.tokenSymbol,
      balance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Estimate gas for transaction
router.post('/estimate-gas', auth, [
  body('from').isEthereumAddress(),
  body('to').isEthereumAddress(),
  body('amount').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to, amount } = req.body;

    try {
      const gasEstimate = await web3.eth.estimateGas({
        from,
        to,
        value: web3.utils.toWei(amount.toString(), 'ether')
      });

      const gasPrice = await web3.eth.getGasPrice();
      const gasCost = web3.utils.fromWei((BigInt(gasEstimate) * BigInt(gasPrice)).toString(), 'ether');

      res.json({
        gasEstimate: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
        gasCost
      });
    } catch (gasError) {
      console.error('Gas estimation error:', gasError);
      res.status(400).json({ message: 'Error estimating gas' });
    }
  } catch (error) {
    console.error('Estimate gas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;