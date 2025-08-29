# Deployment Guide - Student Support Ticketing System

## Problem Solved
This guide fixes the issue where the frontend was connecting to `localhost:5000` instead of the deployed Railway backend.

## Quick Fix
Run the automated deployment script:
```bash
npm run deploy
```

This will:
1. Clean previous builds
2. Install dependencies
3. Build with correct Railway backend URL
4. Verify the build contains the correct API endpoint
5. Provide upload instructions

## Manual Steps (if needed)

### 1. Build for Production
```bash
npm run build:prod
```

### 2. Verify Build
Check that `dist/index.html` contains the Railway URL:
```bash
grep -r "ss-backend-production.up.railway.app" dist/
```

### 3. Upload to IONOS
Upload the contents of the `dist/` folder to your IONOS hosting at `studentsupport.kginnovate.com`

## Configuration Files

### API Configuration (`src/services/api.ts`)
- Uses environment variable `VITE_API_URL`
- Falls back to Railway URL: `https://ss-backend-production.up.railway.app/api`

### Build Script (`build.js`)
- Sets `VITE_API_URL` environment variable
- Runs production build with correct backend URL

### Vite Config (`vite.config.ts`)
- Defines environment variables for production builds
- Maintains development proxy for local development

## URLs
- **Backend**: https://ss-backend-production.up.railway.app
- **Frontend**: https://studentsupport.kginnovate.com

## Troubleshooting

### If still connecting to localhost:
1. Clear browser cache
2. Verify `dist/index.html` contains Railway URL
3. Rebuild with `npm run build:prod`
4. Re-upload to IONOS

### If build fails:
1. Check Node.js version (requires 16+)
2. Run `npm install` first
3. Check for TypeScript errors with `npm run lint`

## Environment Variables
The build process automatically sets:
- `VITE_API_URL=https://campusassist.kginnovate.com/api`

No manual `.env` file creation needed.
