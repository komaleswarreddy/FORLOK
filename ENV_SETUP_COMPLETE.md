
# 🚀 YAARYATRA Environment Variables Setup Guide

This guide explains how to configure environment variables for both **Backend** and **Frontend (Mobile App)**.

## 📋 Table of Contents
- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Quick Setup Commands](#quick-setup-commands)
- [Configuration Details](#configuration-details)

---

## 🔧 Backend Environment Variables

### Location
**File:** `backend/.env`

### Setup
The backend `.env` file has been created with your credentials. It includes:

✅ **Configured:**
- MongoDB Atlas connection string
- Cloudinary credentials
- Razorpay test keys
- Firebase configuration
- Email (Gmail SMTP) settings

⚠️ **Action Required:**
1. **Generate JWT Secrets** (REQUIRED):
   ```bash
   # Option 1: Using OpenSSL
   openssl rand -base64 32
   
   # Option 2: Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   
   Update these in `backend/.env`:
   - `JWT_SECRET` - Generate a secure random string (min 32 chars)
   - `JWT_REFRESH_SECRET` - Generate another secure random string (min 32 chars)

2. **Change Admin Password** (RECOMMENDED):
   - Update `ADMIN_PASSWORD` in `backend/.env`
   - Must be at least 8 characters

3. **IDfy API Key** (OPTIONAL):
   - Leave empty for mock mode (verification always succeeds)
   - Add your IDfy API key for production verification

4. **Razorpay Webhook Secret** (OPTIONAL):
   - Update `RAZORPAY_WEBHOOK_SECRET` if using webhooks

### Backend Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | ✅ Yes | Database name (default: yaaryatra) |
| `JWT_SECRET` | ✅ Yes | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ Yes | JWT refresh secret (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | ⚠️ Optional | Razorpay key ID (for payments) |
| `RAZORPAY_KEY_SECRET` | ⚠️ Optional | Razorpay key secret (for payments) |
| `IDFY_API_KEY` | ⚠️ Optional | IDfy API key (leave empty for mock mode) |
| `EMAIL_USER` | ⚠️ Optional | Email for sending OTP/notifications |
| `EMAIL_PASSWORD` | ⚠️ Optional | Email app password |

---

## 📱 Frontend Environment Variables

### Location
**File:** `mobile-app/app.json` (in `expo.extra` section)

### Setup
The mobile app uses Expo's `Constants.expoConfig.extra` to access environment variables.

**Current Configuration:**
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:3000",
      "apiBaseUrlProduction": "https://api.yaaryatra.com"
    }
  }
}
```

### For Physical Device Testing

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet address (e.g., 192.168.1.100)
   ```

2. **Update `mobile-app/app.json`:**
   ```json
   {
     "expo": {
       "extra": {
         "apiBaseUrl": "http://YOUR_IP_ADDRESS:3000",
         "apiBaseUrlProduction": "https://api.yaaryatra.com"
       }
     }
   }
   ```
   
   Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `192.168.1.100`)

3. **Restart Expo:**
   ```bash
   cd mobile-app
   npm start -- --clear
   ```

### Frontend Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `apiBaseUrl` | Backend API URL for development | `http://localhost:3000` |
| `apiBaseUrlProduction` | Backend API URL for production | `https://api.yaaryatra.com` |

**Note:** The app automatically uses:
- `apiBaseUrl` when `__DEV__ === true` (development mode)
- `apiBaseUrlProduction` when `__DEV__ === false` (production build)

---

## 🚀 Quick Setup Commands

### Backend Setup

```bash
# Navigate to backend
cd backend

# Generate JWT secrets (run twice for JWT_SECRET and JWT_REFRESH_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Edit .env file and update:
# 1. JWT_SECRET (paste first generated value)
# 2. JWT_REFRESH_SECRET (paste second generated value)
# 3. ADMIN_PASSWORD (change to secure password)

# Verify .env file exists
ls .env

# Start backend server
npm start
```

### Frontend Setup

```bash
# Navigate to mobile app
cd mobile-app

# For physical device testing:
# 1. Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# 2. Update app.json -> extra.apiBaseUrl with your IP
# 3. Restart Expo

# Start Expo
npm start
```

---

## 📝 Configuration Details

### Backend Configuration

The backend reads environment variables from `backend/.env` using `dotenv`. All variables are validated on server startup.

**Key Files:**
- `backend/.env` - Environment variables (DO NOT COMMIT TO GIT)
- `backend/env.example.txt` - Example template
- `backend/src/config/env.ts` - Environment validation and configuration

### Frontend Configuration

The mobile app reads environment variables from `app.json` using Expo Constants.

**Key Files:**
- `mobile-app/app.json` - Expo configuration with environment variables
- `mobile-app/src/config/api.ts` - API configuration that reads from Constants
- `mobile-app/env.example.json` - Example template

**How it works:**
```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiBaseUrl;
```

---

## 🔒 Security Notes

### Backend
1. ✅ `.env` file is in `.gitignore` (never commit to git)
2. ⚠️ Change default JWT secrets in production
3. ⚠️ Change admin password from default
4. ⚠️ Use strong, randomly generated secrets
5. ⚠️ Rotate API keys regularly

### Frontend
1. ✅ Environment variables in `app.json` are safe for client-side
2. ⚠️ Never put secrets/API keys in `app.json` (they're visible in the app bundle)
3. ✅ Only use `app.json` for non-sensitive configuration (API URLs, feature flags)

---

## ✅ Verification Checklist

### Backend
- [ ] `.env` file exists in `backend/` folder
- [ ] `MONGODB_URI` is set and valid
- [ ] `JWT_SECRET` is generated (32+ characters)
- [ ] `JWT_REFRESH_SECRET` is generated (32+ characters)
- [ ] `CLOUDINARY_*` credentials are set
- [ ] `ADMIN_PASSWORD` is changed from default
- [ ] Backend server starts without errors

### Frontend
- [ ] `app.json` has `extra.apiBaseUrl` configured
- [ ] `app.json` has `extra.apiBaseUrlProduction` configured
- [ ] For physical device: IP address is set correctly
- [ ] Mobile app can connect to backend API

---

## 🆘 Troubleshooting

### Backend Issues

**Error: "MONGODB_URI is required"**
- Solution: Check that `backend/.env` exists and has `MONGODB_URI` set

**Error: "JWT_SECRET must be at least 32 characters"**
- Solution: Generate a new secret using the commands above

**Error: "Cloudinary not configured"**
- Solution: Add Cloudinary credentials to `backend/.env`

### Frontend Issues

**Cannot connect to backend from physical device**
- Solution: 
  1. Ensure phone and computer are on same WiFi network
  2. Update `app.json` with your computer's IP address
  3. Check Windows Firewall allows port 3000
  4. Restart Expo with `npm start -- --clear`

**API calls fail with "Network request failed"**
- Solution:
  1. Verify backend is running on port 3000
  2. Check `apiBaseUrl` in `app.json` is correct
  3. For Android emulator, use `http://10.0.2.2:3000`
  4. For iOS simulator, use `http://localhost:3000`

---

## 📚 Additional Resources

- [Backend Quick Start](../backend/QUICK_START.md)
- [Backend Environment Guide](../backend/env.example.txt)
- [Mobile App API Integration](../mobile-app/API_INTEGRATION.md)
- [Expo Constants Documentation](https://docs.expo.dev/versions/latest/sdk/constants/)

---

## 🎉 Setup Complete!

Once you've completed the checklist above, both backend and frontend should be properly configured and ready to use!

**Next Steps:**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd mobile-app && npm start`
3. Test the connection between mobile app and backend

---

**Last Updated:** $(date)
**Version:** 1.0.0
