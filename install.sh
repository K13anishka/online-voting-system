#!/bin/bash

echo "🚀 Setting up CryptoPay Wallet Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js v16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating environment file..."
    cp server/.env.example server/.env
    echo "⚠️  Please update the environment variables in server/.env"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in server/.env"
echo "2. Make sure MongoDB is running"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, check the README.md file"