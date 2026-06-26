@echo off
REM Smart City Traffic Management System - Setup Script
REM This script automates the first-time setup

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo Smart City Traffic Management System
echo SETUP SCRIPT
echo ==========================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js is installed

REM Check if MySQL is installed/running
echo [2/5] Checking MySQL...
mysql -u root -p -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Cannot connect to MySQL with default credentials
    echo Please ensure MySQL is running and root password is correct
    echo You may need to update credentials in .env file
    echo.
)
echo Note: MySQL connection will be verified when starting server

REM Create .env from template
echo [3/5] Setting up configuration...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo Created .env file from template
    ) else (
        echo ERROR: .env.example not found!
        pause
        exit /b 1
    )
)
echo OK: .env file ready

REM Install dependencies
echo [4/5] Installing npm dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo OK: Dependencies installed

REM Setup database
echo [5/5] Setting up database...
echo.
echo Attempting to create database and tables...
echo NOTE: You may be prompted for MySQL root password

mysql -u root -p < database.sql
if errorlevel 1 (
    echo.
    echo WARNING: Database setup had issues
    echo Please run manually: mysql -u root -p ^< database.sql
    echo Or update credentials in .env and try again
) else (
    echo OK: Database setup complete
)

echo.
echo ==========================================
echo SETUP COMPLETE!
echo ==========================================
echo.
echo Next steps:
echo 1. Review and update .env file if needed
echo 2. Run: npm run dev
echo 3. Open: http://localhost:5000
echo.
echo Test Accounts:
echo - Admin: admin@smartcity.com / admin
echo - Operator: operator@smartcity.com / operator
echo - User: user1@smartcity.com / user1
echo.
echo For help, see QUICK_START.md
echo.
pause
