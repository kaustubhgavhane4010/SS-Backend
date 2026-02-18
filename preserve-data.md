# 🚨 DATA PRESERVATION GUIDE

## Why Data is Being Lost:
- Multiple database files in different locations
- Database path changes when server restarts
- Migration scripts recreating tables

## 🔧 IMMEDIATE FIX:

### 1. Database Path Fixed
- Database now uses: `campus-assist.db` in project root
- This file will persist across restarts

### 2. Before Making Changes:
1. **Copy your existing database** to the project root
2. **Rename it** to `campus-assist.db`
3. **Place it** in the main project folder (not in server/database/)

### 3. Current Database Locations:
- `server/database/ticketing.db` ← OLD (will be ignored)
- `server/database/enterprise.db` ← OLD (will be ignored)
- `campus-assist.db` ← NEW (will be used)

## 📁 How to Preserve Data:

1. **Find your most recent database** (the one with your data)
2. **Copy it** to the project root folder
3. **Rename it** to `campus-assist.db`
4. **Restart the server** - it will use this file

## 🎯 Next Steps:
1. Copy your data to `campus-assist.db`
2. Test the Edit/Delete buttons
3. Data will now persist across changes

## ⚠️ IMPORTANT:
- Never delete `campus-assist.db` from project root
- This file contains all your data
- Back it up regularly
