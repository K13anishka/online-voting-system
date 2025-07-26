import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { FiWallet } from 'react-icons/fi';

const WalletConnect = () => {
  const { connectMetaMask, loading } = useWallet();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Connect Wallet</h1>
      <div className="card">
        <div className="text-center">
          <FiWallet className="mx-auto text-6xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-8">
            Choose a wallet to connect to CryptoPay
          </p>
          
          <button
            onClick={connectMetaMask}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;