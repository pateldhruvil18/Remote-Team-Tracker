# 🗄️ Database Connection Setup Guide

This guide will help you set up MongoDB for the Team Tracker application using either MongoDB Atlas (cloud) or local MongoDB with Compass.

## 🔧 Current Issue

The database connection is failing. Here are the solutions:

## Option 1: 🌐 MongoDB Atlas (Cloud) - Recommended

### Step 1: Fix Connection String
Your current Atlas connection string has formatting issues. I've already fixed it in the `.env` file:

```
MONGODB_URI=mongodb+srv://dhruvil18:dhp%40204600@cluster0.pjbffy7.mongodb.net/productivity_tracker?retryWrites=true&w=majority&appName=Cluster0
```

### Step 2: Verify Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with your credentials
3. Check if your cluster `Cluster0` is running
4. Verify network access (IP whitelist)
5. Confirm database user credentials

### Step 3: Network Access
- In Atlas dashboard, go to "Network Access"
- Add your current IP address or use `0.0.0.0/0` for development
- Make sure the IP is whitelisted

## Option 2: 💻 Local MongoDB with Compass

### Step 1: Install MongoDB Community Server
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install MongoDB Community Server
3. Start MongoDB service

### Step 2: Install MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and open Compass
3. Connect to `mongodb://localhost:27017`

### Step 3: Update .env File
Edit `Remote/backend/.env` and change the database configuration:

```env
# Comment out Atlas connection
# MONGODB_URI=mongodb+srv://dhruvil18:dhp%40204600@cluster0.pjbffy7.mongodb.net/productivity_tracker?retryWrites=true&w=majority&appName=Cluster0

# Use local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/productivity_tracker
```

### Step 4: Create Database in Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Create a new database named `productivity_tracker`
4. Create initial collections: `users`, `tasks`, `timeentries`

## 🚀 Quick Setup Commands

### For Windows (Local MongoDB):
```powershell
# Install MongoDB using Chocolatey (if you have it)
choco install mongodb

# Or download and install manually from MongoDB website

# Start MongoDB service
net start MongoDB
```

### For Local Development:
```bash
# Navigate to backend directory
cd Remote/backend

# Install dependencies (if not done)
npm install

# Start the server
npm run dev
```

## 🔍 Testing Database Connection

### Method 1: Check Server Logs
When you start the backend server, you should see:
```
✅ MongoDB Atlas Connected: cluster0-shard-00-00.pjbffy7.mongodb.net
```
or
```
✅ MongoDB Connected: 127.0.0.1
```

### Method 2: Test Health Endpoint
```powershell
Invoke-WebRequest -Uri http://localhost:5001/health -UseBasicParsing
```

### Method 3: Check Database in Compass
1. Open MongoDB Compass
2. Connect to your database
3. You should see the `productivity_tracker` database
4. Collections will be created automatically when data is added

## 🛠️ Troubleshooting

### Common Issues:

1. **Atlas Connection Fails**
   - Check internet connection
   - Verify IP whitelist in Atlas
   - Confirm username/password
   - Check cluster status

2. **Local MongoDB Not Starting**
   - Install MongoDB Community Server
   - Start MongoDB service
   - Check if port 27017 is available

3. **Authentication Errors**
   - Verify database credentials
   - Check connection string format
   - Ensure special characters are URL encoded

### Error Messages:

- `MongoNetworkError`: Network/firewall issue
- `MongoAuthenticationError`: Wrong credentials
- `MongoServerSelectionTimeoutError`: Can't reach MongoDB server

## 📝 Recommended Approach

For development, I recommend using **MongoDB Atlas** (Option 1) because:
- ✅ No local installation required
- ✅ Always accessible
- ✅ Automatic backups
- ✅ Easy to share with team

Your Atlas connection string is already configured and should work once you verify:
1. Cluster is running
2. Network access is configured
3. Database user exists

## 🔄 Next Steps

1. Choose your preferred option (Atlas or Local)
2. Follow the setup steps above
3. Test the connection
4. Start the application

Once connected, the application will automatically create the necessary collections and you can start using all features!
