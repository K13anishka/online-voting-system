import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { 
  FiHome, 
  FiSend, 
  FiDownload, 
  FiList, 
  FiUser, 
  FiWallet,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { account, selectedWallet, getNetworkInfo, formatBalance } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const networkInfo = getNetworkInfo();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/send', icon: FiSend, label: 'Send' },
    { path: '/receive', icon: FiDownload, label: 'Receive' },
    { path: '/transactions', icon: FiList, label: 'Transactions' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FiWallet className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-gradient">CryptoPay</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Info & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Network Badge */}
            {account && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: networkInfo.color }}
                ></div>
                <span className="text-xs font-medium text-gray-600">
                  {networkInfo.name}
                </span>
              </div>
            )}

            {/* Wallet Balance */}
            {selectedWallet && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 rounded-lg">
                <FiWallet className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {formatBalance(selectedWallet.balances?.find(b => b.symbol === 'ETH')?.balance || '0')} ETH
                </span>
              </div>
            )}

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/connect-wallet"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiWallet />
                    <span>Connect Wallet</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <hr className="my-2" />
              
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                <FiUser />
                <span>Profile</span>
              </Link>
              
              <Link
                to="/connect-wallet"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                <FiWallet />
                <span>Connect Wallet</span>
              </Link>
              
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;