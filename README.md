# ✨ GlowUp AI — Full Stack App

> AI-powered beauty, fitness & fashion mobile application built with React, Node.js, MongoDB, and Claude AI.

---

## 📁 Project Structure

```
glowup-ai/
├── frontend/          # React app (mobile UI)
│   ├── src/
│   │   ├── components/    # Shared UI components
│   │   ├── pages/         # Screen pages
│   │   ├── hooks/         # Auth context
│   │   ├── utils/         # Axios API client
│   │   ├── App.jsx        # Main app shell
│   │   └── index.js
│   ├── public/
│   ├── capacitor.config.ts
│   └── package.json
│
└── backend/           # Node.js + Express API
    ├── routes/            # API route handlers
    ├── controllers/       # (extend as needed)
    ├── middleware/        # JWT auth
    ├── models/            # MongoDB schemas
    ├── config/            # Claude API helper
    ├── server.js
    └── package.json
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your .env values

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure Environment

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/glowup-ai
JWT_SECRET=your_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

App will be running at: http://localhost:3000

---

## 📱 Build Mobile APK (Capacitor)

```bash
cd frontend

# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/status-bar @capacitor/splash-screen

# Build React app
npm run build

# Init & sync Capacitor
npx cap init "GlowUp AI" "com.glowupai.app"
npx cap add android
npx cap sync android

# Open in Android Studio
npx cap open android
```

> ⚠️ **Important for APK**: In production, update `REACT_APP_API_URL` to your deployed backend URL (e.g., Render.com). All API calls must use the full URL, not localhost.

---

## 🌐 Deploy to Production

### Backend (Render.com)
1. Push backend folder to GitHub
2. Create new Web Service on Render
3. Set environment variables in Render dashboard
4. Deploy — your API URL will be: `https://glowup-ai-backend.onrender.com`

### Frontend (Vercel/Netlify)
1. Set `REACT_APP_API_URL=https://your-render-url.onrender.com/api`
2. `npm run build` → deploy `build/` folder

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Face Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/face/analyze | Analyze face (requires JWT) |
| GET | /api/face/history | Get analysis history |

### Fitness
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/fitness/plan | Generate fitness plan |
| GET | /api/fitness/history | Get plan history |

### Fashion
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/fashion/analyze | Analyze fashion |
| GET | /api/fashion/history | Get style history |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/profile | Get profile |
| PUT | /api/user/profile | Update profile |
| GET | /api/user/analyses | Get all analyses |
| DELETE | /api/user/analyses/:id | Delete analysis |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router |
| Mobile | Capacitor (Android/iOS) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| AI | Claude (Anthropic) Vision API |
| Auth | JWT + bcrypt |
| Styling | CSS-in-JS (inline styles) |

---

## ✨ Features

- 🤳 **Face Analysis** — Face shape, skin tone, hairstyle recommendations
- 💪 **AI Fitness Coach** — BMI, calories, macros, 7-day meal + workout plan  
- 👗 **AI Fashion Advisor** — Body shape analysis, outfit recommendations, color palette
- 🔐 **Auth System** — Register/Login with JWT tokens
- 📊 **History Tracking** — All analyses saved per user in MongoDB
- 📱 **Mobile Ready** — Capacitor for Android/iOS APK build

---

## 📞 Support

Built with ❤️ using Claude AI by Anthropic.
