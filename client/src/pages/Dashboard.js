import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { 
  FiWallet, 
  FiSend, 
  FiDownload, 
  FiRefreshCw,
  FiTrendingUp,
  FiEye,
  FiEyeOff,
  FiPlus
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    wallets, 
    selectedWallet, 
    fetchWallets, 
    refreshBalance, 
    formatBalance,
    getNetworkInfo,
    isConnected 
  } = useWallet();
  
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleRefreshBalance = async () => {
    if (!selectedWallet) return;
    
    setIsRefreshing(true);
    await refreshBalance(selectedWallet._id);
    setIsRefreshing(false);
  };

  const getTotalBalance = () => {
    if (!selectedWallet?.balances) return '0';
    const ethBalance = selectedWallet.balances.find(b => b.symbol === 'ETH');
    return ethBalance ? ethBalance.balance : '0';
  };

  const networkInfo = getNetworkInfo();

  const quickActions = [
    {
      title: 'Send',
      description: 'Send crypto to friends',
      icon: FiSend,
      color: 'bg-blue-500',
      link: '/send'
    },
    {
      title: 'Receive',
      description: 'Receive crypto payments',
      icon: FiDownload,
      color: 'bg-green-500',
      link: '/receive'
    },
    {
      title: 'Connect Wallet',
      description: 'Add new wallet',
      icon: FiPlus,
      color: 'bg-purple-500',
      link: '/connect-wallet'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your crypto portfolio overview
        </p>
      </motion.div>

      {/* Wallet Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card mb-8 crypto-gradient text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FiWallet className="text-2xl" />
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedWallet?.name || 'No Wallet Connected'}
                </h2>
                {isConnected && (
                  <div className="flex items-center space-x-2 text-white/80 text-sm">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: networkInfo.color }}
                    ></div>
                    <span>{networkInfo.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {showBalance ? <FiEye /> : <FiEyeOff />}
              </button>
              <button
                onClick={handleRefreshBalance}
                disabled={isRefreshing || !selectedWallet}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-white/80 text-sm mb-1">Total Balance</p>
            <div className="text-3xl font-bold">
              {showBalance ? (
                `${formatBalance(getTotalBalance())} ETH`
              ) : (
                '••••••'
              )}
            </div>
            {showBalance && (
              <p className="text-white/80 text-sm mt-1">
                ≈ ${(parseFloat(getTotalBalance()) * 2000).toFixed(2)} USD
              </p>
            )}
          </div>

          {selectedWallet?.address && (
            <div className="text-white/80 text-sm">
              <p className="mb-1">Wallet Address:</p>
              <p className="font-mono bg-white/10 px-3 py-2 rounded-lg truncate">
                {selectedWallet.address}
              </p>
            </div>
          )}
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="card hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{action.title}</h4>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Portfolio Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
            <FiTrendingUp className="text-green-500" />
          </div>
          
          {selectedWallet?.balances?.length > 0 ? (
            <div className="space-y-3">
              {selectedWallet.balances.map((balance, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-crypto-ethereum rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {balance.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{balance.symbol}</p>
                      <p className="text-sm text-gray-600">{balance.token}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatBalance(balance.balance)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${(parseFloat(balance.balance) * 2000).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiWallet className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600">No tokens found</p>
              <p className="text-sm text-gray-500 mt-2">
                Connect a wallet to see your tokens
              </p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSend className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Your transaction history will appear here
            </p>
            <Link to="/send" className="btn-primary mt-4 inline-block">
              Send Your First Transaction
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-xl p-6 text-center"
        >
          <FiWallet className="mx-auto text-4xl text-primary-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your MetaMask or other Web3 wallet to start sending and receiving crypto
          </p>
          <Link to="/connect-wallet" className="btn-primary">
            Connect Wallet
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;