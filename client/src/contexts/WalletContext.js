import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkId, setNetworkId] = useState(null);

  // Initialize Web3 and check for existing connections
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Check if already connected
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const networkId = await web3Instance.eth.net.getId();
            setNetworkId(networkId);
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
          setNetworkId(parseInt(chainId, 16));
          window.location.reload(); // Refresh page on network change
        });
      }
    };

    initWeb3();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return { success: false, error: 'MetaMask not installed' };
    }

    try {
      setLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        
        const networkId = await web3Instance.eth.net.getId();
        setNetworkId(networkId);

        // Save wallet to backend
        const result = await saveWalletToBackend({
          address: accounts[0],
          walletType: 'metamask',
          network: getNetworkName(networkId)
        });

        if (result.success) {
          toast.success('MetaMask connected successfully! 🦊');
          await fetchWallets();
        }

        return { success: true, account: accounts[0] };
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      toast.error('Failed to connect to MetaMask');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setSelectedWallet(null);
    toast.success('Wallet disconnected');
  };

  // Save wallet to backend
  const saveWalletToBackend = async (walletData) => {
    try {
      const response = await axios.post('/wallet/connect', walletData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error saving wallet:', error);
      const message = error.response?.data?.message || 'Failed to save wallet';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch user wallets from backend
  const fetchWallets = async () => {
    try {
      const response = await axios.get('/wallet');
      setWallets(response.data);
      
      // Set first wallet as selected if none selected
      if (response.data.length > 0 && !selectedWallet) {
        setSelectedWallet(response.data[0]);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching wallets:', error);
      return { success: false, error: error.message };
    }
  };

  // Refresh wallet balance
  const refreshBalance = async (walletId) => {
    try {
      const response = await axios.post(`/wallet/${walletId}/refresh-balance`);
      
      // Update wallet in state
      setWallets(prev => prev.map(wallet => 
        wallet._id === walletId 
          ? { ...wallet, balances: response.data.balances }
          : wallet
      ));
      
      toast.success('Balance updated');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
      return { success: false, error: error.message };
    }
  };

  // Send transaction
  const sendTransaction = async (transactionData) => {
    if (!web3 || !account) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      
      const { toAddress, amount, tokenSymbol } = transactionData;
      
      // For ETH transactions
      if (tokenSymbol === 'ETH') {
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await web3.eth.estimateGas({
          from: account,
          to: toAddress,
          value: web3.utils.toWei(amount.toString(), 'ether')
        });

        const tx = {
          from: account,
          to: toAddress,
          value: web3.utils.toWei(amount.toString(), 'ether'),
          gas: gasEstimate,
          gasPrice: gasPrice
        };

        const result = await web3.eth.sendTransaction(tx);
        
        // Save transaction to backend
        const backendResult = await axios.post('/transactions/send', {
          ...transactionData,
          txHash: result.transactionHash
        });

        toast.success('Transaction sent successfully! 🚀');
        return { success: true, txHash: result.transactionHash };
      }
      
      // For token transactions, you would implement ERC-20 token transfer here
      
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get network name from ID
  const getNetworkName = (networkId) => {
    const networks = {
      1: 'ethereum',
      137: 'polygon',
      56: 'bsc',
      43114: 'avalanche',
      42161: 'arbitrum'
    };
    return networks[networkId] || 'ethereum';
  };

  // Get network info
  const getNetworkInfo = () => {
    const networks = {
      1: { name: 'Ethereum Mainnet', color: '#627eea' },
      137: { name: 'Polygon', color: '#8247e5' },
      56: { name: 'BSC', color: '#f3ba2f' },
      43114: { name: 'Avalanche', color: '#e84142' },
      42161: { name: 'Arbitrum', color: '#28a0f0' }
    };
    return networks[networkId] || { name: 'Unknown Network', color: '#gray' };
  };

  // Format balance for display
  const formatBalance = (balance, decimals = 18) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
    return `${(num / 1000000).toFixed(2)}M`;
  };

  const value = {
    web3,
    account,
    wallets,
    selectedWallet,
    setSelectedWallet,
    loading,
    networkId,
    connectMetaMask,
    disconnectWallet,
    fetchWallets,
    refreshBalance,
    sendTransaction,
    getNetworkInfo,
    formatBalance,
    isConnected: !!account
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};