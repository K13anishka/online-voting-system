# CryptoPay - Crypto Wallet App

A modern cryptocurrency wallet application similar to PhonePe, but for crypto transactions. Send and receive cryptocurrency using just phone numbers instead of complex wallet addresses.

## 🚀 Features

- **Multi-Wallet Support**: Connect MetaMask, WalletConnect, and other popular wallets
- **Phone Number Transactions**: Send crypto using phone numbers instead of wallet addresses
- **Multi-Network Support**: Ethereum, Polygon, BSC, Avalanche, and Arbitrum
- **Real-time Balance Updates**: Live balance tracking and transaction monitoring
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Transaction History**: Complete transaction history with search and filtering
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Modern UI**: Beautiful interface built with React and Tailwind CSS

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Web3.js** - Blockchain integration
- **Ethers.js** - Ethereum library

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Web3.js** - Wallet integration
- **Axios** - HTTP client
- **React Query** - Data fetching
- **Zustand** - State management

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- MetaMask browser extension (for testing)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cryptopay-wallet
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```

Update the environment variables:
```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/cryptopay

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Client URL
CLIENT_URL=http://localhost:3000

# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID

# API Keys
INFURA_PROJECT_ID=your_infura_project_id
```

### 4. Start the Application

#### Development Mode
```bash
# Start both server and client
npm run dev
```

#### Or start separately
```bash
# Terminal 1 - Start server
npm run server

# Terminal 2 - Start client
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Configuration

### Blockchain Networks
The app supports multiple networks. Configure RPC URLs in the `.env` file:

- **Ethereum Mainnet**: Infura/Alchemy
- **Polygon**: Polygon RPC
- **BSC**: Binance Smart Chain
- **Avalanche**: Avalanche Network
- **Arbitrum**: Arbitrum One

### Database Setup
The app uses MongoDB. You can use either:
- Local MongoDB installation
- MongoDB Atlas (cloud)
- Docker MongoDB container

## 🏗 Project Structure

```
cryptopay-wallet/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API rate limiting
- **Input Validation**: Express validator
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers

## 📱 Usage

### 1. User Registration
- Create account with email, username, and phone number
- Secure password with validation

### 2. Wallet Connection
- Connect MetaMask or other Web3 wallets
- Support for multiple wallets per user
- Automatic balance detection

### 3. Send Cryptocurrency
- Send crypto using recipient's phone number
- Support for ETH and ERC-20 tokens
- Real-time gas estimation

### 4. Receive Payments
- Generate QR codes for easy receiving
- Share wallet address or phone number
- Transaction notifications

### 5. Transaction History
- View all transactions
- Filter by status, type, or date
- Export transaction data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Wallets
- `POST /api/wallet/connect` - Connect wallet
- `GET /api/wallet` - Get user wallets
- `POST /api/wallet/:id/refresh-balance` - Refresh balance

### Transactions
- `POST /api/transactions/send` - Send cryptocurrency
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:hash` - Get specific transaction

## 🧪 Testing

### Demo Credentials
For testing purposes, you can use:
- **Email**: demo@cryptopay.com
- **Password**: demo123

### Test Networks
Use test networks for development:
- Ethereum Goerli
- Polygon Mumbai
- BSC Testnet

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Configure MongoDB connection
3. Deploy server code

### Frontend Deployment (Vercel/Netlify)
1. Build the React app
2. Configure API endpoints
3. Deploy static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔮 Future Features

- [ ] Push notifications
- [ ] Multi-language support
- [ ] DeFi integrations
- [ ] NFT support
- [ ] Staking features
- [ ] Cross-chain bridges
- [ ] Advanced portfolio analytics

## ⚠️ Disclaimer

This is a demo application for educational purposes. Do not use with real funds on mainnet without proper security audits and testing.

---

Built with ❤️ for the crypto community