# 🚀 Quick Setup Commands

## Backend Environment Setup

### 1. Generate JWT Secrets (REQUIRED)

```bash
# Navigate to backend folder
cd backend

# Generate JWT_SECRET (run this command and copy the output)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate JWT_REFRESH_SECRET (run again and copy the output)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Update .env File

Edit `backend/.env` and replace:
- `JWT_SECRET` with first generated value
- `JWT_REFRESH_SECRET` with second generated value
- `ADMIN_PASSWORD` with a secure password (min 8 characters)

### 3. Verify Setup

```bash
# Check .env file exists
cd backend
ls .env

# Start backend server
npm start
```

---

## Frontend Environment Setup

### 1. For Physical Device Testing

```bash
# Find your computer's IP address
# Windows:
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)

# Mac/Linux:
ifconfig
# Look for inet address (e.g., 192.168.1.100)
```

### 2. Update app.json

Edit `mobile-app/app.json` and update:
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://YOUR_IP_ADDRESS:3000"
    }
  }
}
```

Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `192.168.1.100`)

### 3. Start Mobile App

```bash
cd mobile-app
npm start -- --clear
```

---

## Complete Setup Checklist

### Backend ✅
- [x] `.env` file created in `backend/` folder
- [x] MongoDB URI configured
- [x] Cloudinary credentials configured
- [x] Razorpay keys configured
- [x] Email configuration added
- [ ] **JWT_SECRET** - Generate and update (REQUIRED)
- [ ] **JWT_REFRESH_SECRET** - Generate and update (REQUIRED)
- [ ] **ADMIN_PASSWORD** - Change from default (RECOMMENDED)

### Frontend ✅
- [x] `app.json` updated with environment variables
- [x] `api.ts` updated to read from Expo Constants
- [ ] **For physical device**: Update `apiBaseUrl` with your IP address

---

## Quick Test

### Test Backend
```bash
cd backend
npm start
# Should start on http://localhost:3000
```

### Test Frontend
```bash
cd mobile-app
npm start
# Should connect to backend API
```

---

## Troubleshooting

### Backend won't start
- Check `.env` file exists in `backend/` folder
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set (32+ characters)
- Check `MONGODB_URI` is valid

### Mobile app can't connect to backend
- Ensure backend is running on port 3000
- For physical device: Update `apiBaseUrl` in `app.json` with your IP
- Check phone and computer are on same WiFi network
- Verify Windows Firewall allows port 3000

---

**See `ENV_SETUP_COMPLETE.md` for detailed documentation.**
