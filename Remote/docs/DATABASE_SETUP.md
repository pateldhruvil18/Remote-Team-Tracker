# 🧭 MongoDB Compass Guide for Team Tracker

## 🔗 Connection Information

**Connection String:**
```
mongodb://127.0.0.1:27017/productivity_tracker
```

**Manual Connection Details:**
- **Host:** `127.0.0.1` (localhost)
- **Port:** `27017`
- **Database:** `productivity_tracker`
- **Authentication:** None required (local database)

## 📋 Step-by-Step Connection Guide

### 1. Open MongoDB Compass
- Launch MongoDB Compass on your laptop
- You'll see the connection screen

### 2. Connect to Database
**Option A - Using Connection String:**
1. Paste this in the connection field: `mongodb://127.0.0.1:27017/productivity_tracker`
2. Click "Connect"

**Option B - Manual Entry:**
1. Click "Fill in connection fields individually"
2. Enter:
   - Hostname: `127.0.0.1`
   - Port: `27017`
   - Database Name: `productivity_tracker`
3. Click "Connect"

### 3. Verify Connection
- You should see `productivity_tracker` database in the left sidebar
- Click on it to expand and see collections

## 📊 Your Database Structure

### Collections Overview:
- **👥 users** (11 documents) - User accounts and profiles
- **📋 tasks** (8 documents) - Task management data
- **👥 teams** (0 documents) - Team organization data
- **📊 productivitymetrics** (0 documents) - Performance metrics
- **📸 screenshots** (0 documents) - Screenshot monitoring
- **⏰ timeentries** (0 documents) - Time tracking data

### Key Data:
- **Total Users:** 11
- **Managers:** 1 (Dhruvil Patel)
- **Team Members:** 10
- **Your Manager Email:** dhchaudhary973@gmail.com

## 🔍 What You Can Do in MongoDB Compass

### 1. View Collections
- Click on any collection to see its documents
- Browse through user accounts, tasks, etc.

### 2. Search and Filter
- Use the filter bar to find specific documents
- Example: `{"role": "manager"}` to find managers
- Example: `{"email": "dhchaudhary973@gmail.com"}` to find your account

### 3. View Document Details
- Click on any document to see full details
- See user profiles, task information, etc.

### 4. Analyze Data
- Use the "Schema" tab to understand data structure
- Use "Explain Plan" to optimize queries

### 5. Export Data
- Export collections to JSON, CSV
- Backup your data easily

## 🎯 Useful Queries for Team Tracker

### Find Your Manager Account:
```json
{"email": "dhchaudhary973@gmail.com"}
```

### Find All Team Members:
```json
{"role": "team_member"}
```

### Find Active Users:
```json
{"isActive": true}
```

### Find Recent Users (last 7 days):
```json
{"createdAt": {"$gte": "2025-06-13T00:00:00.000Z"}}
```

## 📈 Database Monitoring

### Performance Insights:
- Monitor query performance
- Check index usage
- View database statistics

### Real-time Monitoring:
- See live database operations
- Monitor connection status
- Track document changes

## 🛠️ Database Management

### Safe Operations:
- ✅ View and browse data
- ✅ Export collections
- ✅ Analyze schemas
- ✅ Monitor performance

### Caution Required:
- ⚠️ Editing documents (can break app)
- ⚠️ Deleting data (permanent loss)
- ⚠️ Modifying indexes (affects performance)

## 🔧 Troubleshooting

### Connection Issues:
1. **MongoDB Not Running:**
   - Start MongoDB service on your system
   - Check Windows Services for "MongoDB"

2. **Port Blocked:**
   - Ensure port 27017 is available
   - Check firewall settings

3. **Database Not Found:**
   - Make sure your Team Tracker app has run at least once
   - Database is created automatically when app starts

### Common Solutions:
- Restart MongoDB service
- Check if Team Tracker backend is running
- Verify connection string is correct

## 📊 Data Visualization

### Charts and Graphs:
- Create visual representations of your data
- Monitor user growth over time
- Analyze team productivity trends

### Aggregation Pipeline:
- Build complex queries visually
- Generate reports and insights
- Export results for analysis

## 🎯 Best Practices

### Viewing Data:
- Use filters to find specific information
- Export data for backup purposes
- Monitor database health regularly

### Safety:
- Always backup before making changes
- Test queries in a safe environment
- Avoid direct document editing

## 🚀 Advanced Features

### Index Management:
- View existing indexes
- Monitor index performance
- Optimize query speed

### Schema Validation:
- Understand data structure
- Validate document formats
- Ensure data consistency

### Performance Monitoring:
- Track slow queries
- Monitor database metrics
- Optimize performance

## 📋 Quick Reference

**Your Database Details:**
- **Name:** productivity_tracker
- **Location:** Local (127.0.0.1:27017)
- **Collections:** 6 total
- **Documents:** 19 total
- **Manager:** Dhruvil Patel (dhchaudhary973@gmail.com)

**Connection String:**
```
mongodb://127.0.0.1:27017/productivity_tracker
```

**Status:** ✅ Active and Working
**Last Verified:** Today

---

**Your Team Tracker database is ready for exploration in MongoDB Compass!** 🎉

Use this professional tool to gain deep insights into your data, monitor performance, and manage your Team Tracker database with confidence.
