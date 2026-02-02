# 🚀 Quick Start Commands

## Backend Server

### Option 1: Start Backend (Production Build)
```bash
cd backend
npm start
```

### Option 2: Start Backend (Development Mode with Auto-reload)
```bash
cd backend
npm run dev
```

**Backend will run on:** `http://localhost:3000`

---

## Frontend (Mobile App)

### Start Expo Development Server
```bash
cd mobile-app
npm start
```

**Then:**
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

**Frontend will run on:** Expo default ports (19000, 19001, 19002)

---

## Run Both Together (Two Terminal Windows)

### Terminal 1 - Backend:
```bash
cd backend
npm start
```

### Terminal 2 - Frontend:
```bash
cd mobile-app
npm start
```

---

## Quick Commands Reference

### Backend
- `cd backend && npm start` - Start backend server
- `cd backend && npm run dev` - Start with auto-reload (development)
- `cd backend && npm run build` - Build TypeScript to JavaScript

### Frontend
- `cd mobile-app && npm start` - Start Expo dev server
- `cd mobile-app && npm start -- --clear` - Start with cleared cache

---

## Troubleshooting

### Backend won't start?
1. Make sure `.env` file exists in `backend/` folder
2. Check MongoDB connection string is correct
3. Verify JWT secrets are set (32+ characters)
4. Run `npm install` if dependencies missing

### Frontend won't start?
1. Make sure dependencies are installed: `npm install`
2. Clear cache: `npm start -- --clear`
3. For physical device: Update IP address in `app.json`

---

## Environment Setup

Make sure you have:
- ✅ Backend `.env` file configured
- ✅ Frontend `app.json` has correct API URL
- ✅ All dependencies installed (`npm install` in both folders)
