#!/bin/bash

# Smart City Traffic Management System - Setup Script for Linux/Mac
# This script automates the first-time setup

echo ""
echo "=========================================="
echo "Smart City Traffic Management System"
echo "SETUP SCRIPT"
echo "=========================================="
echo ""

# Check if Node.js is installed
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
node_version=$(node --version)
echo "OK: Node.js $node_version is installed"

# Check if npm is installed
echo "[2/5] Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi
npm_version=$(npm --version)
echo "OK: npm $npm_version is installed"

# Check if MySQL is installed/running
echo "[3/5] Checking MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL CLI is not installed"
    echo "You may need to install: mysql-client"
else
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        echo "OK: MySQL is running"
    else
        echo "NOTE: MySQL connection with default credentials failed"
        echo "You'll need to provide password or update .env"
    fi
fi

# Create .env from template
echo "[4/5] Setting up configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env file from template"
    else
        echo "ERROR: .env.example not found!"
        exit 1
    fi
fi
echo "OK: .env file ready"

# Install dependencies
echo "[5/5] Installing npm dependencies..."
echo "This may take a few minutes..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    exit 1
fi
echo "OK: Dependencies installed"

# Setup database
echo ""
echo "Setting up database..."
echo "NOTE: You may be prompted for MySQL root password"
echo ""

if [ -f "database.sql" ]; then
    mysql -u root -p < database.sql
    if [ $? -eq 0 ]; then
        echo "OK: Database setup complete"
    else
        echo "WARNING: Database setup had issues"
        echo "Please run manually: mysql -u root -p < database.sql"
    fi
else
    echo "ERROR: database.sql not found!"
    exit 1
fi

echo ""
echo "=========================================="
echo "SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:5000"
echo ""
echo "Test Accounts:"
echo "- Admin: admin@smartcity.com / admin"
echo "- Operator: operator@smartcity.com / operator"
echo "- User: user1@smartcity.com / user1"
echo ""
echo "For help, see QUICK_START.md"
echo ""
