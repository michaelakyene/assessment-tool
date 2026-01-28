# 🏗️ System Architecture & Deployment Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                             │
│                    (Frontend Application)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         React + Vite + Tailwind CSS                      │ │
│  │  • Login/Register                                        │ │
│  │  • Dashboard                                             │ │
│  │  • Create/View Quizzes                                   │ │
│  │  • Take Quiz (with timer)                                │ │
│  │  • View Results & Analytics                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────────────┘
                         │
                  HTTPS REST API
                  Socket.io WSS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼────────────┐          ┌────────▼──────────┐
│  Vercel/Netlify    │          │ Railway/Heroku    │
│  (Frontend)        │          │ (Backend API)     │
│                    │          │                   │
│ ✓ CDN              │          │ ✓ Node.js App     │
│ ✓ Auto-deploy      │          │ ✓ Express Server  │
│ ✓ Preview URLs     │          │ ✓ Socket.io       │
│ ✓ Serverless       │          │ ✓ Auto-restart    │
│ ✓ HTTPS            │          │ ✓ Env vars        │
│ ✓ Analytics        │          │ ✓ Logs            │
└────────────────────┘          └────────┬──────────┘
                                         │
                    Database Connection (SSL)
                    User → Password Auth
                                         │
                        ┌────────────────▼────────────────┐
                        │    MongoDB Atlas               │
                        │  (Cloud Database)             │
                        │                               │
                        │ ✓ Free 512MB tier            │
                        │ ✓ Auto backups              │
                        │ ✓ IP whitelisting           │
                        │ ✓ Encryption at rest/transit│
                        │ ✓ Scaling ready             │
                        └───────────────────────────────┘
```

## Deployment Architecture

### Development Environment
```
Your Computer
├─ Backend (port 5000)
├─ Frontend (port 5173)
└─ MongoDB (local or Atlas)
```

### Production Environment (Cloud)

```
Deployed Application Stack:

Frontend Layer (Vercel/Netlify)
├─ Static Files (HTML, CSS, JS)
├─ CDN Distribution
├─ Automatic HTTPS
├─ CI/CD on Git Push
└─ Preview Deployments

Backend Layer (Railway/Heroku)
├─ Node.js Application Server
├─ Express API
├─ Socket.io Server
├─ Environment Variables
├─ Application Logging
└─ Auto Restart on Crash

Database Layer (MongoDB Atlas)
├─ Managed MongoDB Service
├─ Automatic Backups
├─ Scaling Capabilities
├─ SSL Encryption
└─ Global Distribution
```

## Data Flow

### 1. User Authentication Flow
```
User Input (Login)
        ↓
Frontend Validation
        ↓
POST /api/auth/login
        ↓
Backend Hash Check
        ↓
JWT Token Generated
        ↓
Response + Token
        ↓
Token Stored in localStorage
```

### 2. Quiz Taking Flow
```
Student Views Quizzes
        ↓
GET /api/quizzes
        ↓
Fetch from MongoDB
        ↓
Display with Timer
        ↓
Student Submits Answers
        ↓
POST /api/attempts/submit
        ↓
Grade Answers
        ↓
Save to MongoDB
        ↓
Calculate Results
        ↓
Display Results to Student
```

### 3. Real-Time Updates (Socket.io)
```
Lecturer Creates Quiz
        ↓
socket emit('quiz-created')
        ↓
Backend broadcasts to connected students
        ↓
Students receive notification
        ↓
Quiz appears in their list
```

## Security Implementation

### 1. Authentication
- ✅ JWT Tokens with secret key
- ✅ Passwords hashed with bcryptjs
- ✅ Secure HTTP-only storage possible
- ✅ Token expiration handling

### 2. API Security
- ✅ CORS configured for frontend domain only
- ✅ Rate limiting on auth endpoints (5 attempts/15min)
- ✅ General rate limiting (1000 requests/15min)
- ✅ Helmet for security headers
- ✅ Input sanitization

### 3. Database Security
- ✅ MongoDB Atlas IP whitelisting
- ✅ Encryption in transit (SSL)
- ✅ Encryption at rest (MongoDB Standard)
- ✅ Strong authentication credentials

### 4. API Documentation
- ✅ Swagger/OpenAPI docs at `/api-docs`
- ✅ Interactive API testing
- ✅ Schema validation

## Deployment Steps Summary

### Step 1: Database (MongoDB Atlas) - 5 minutes
```
1. Create MongoDB Atlas account
2. Create Free Tier cluster
3. Create database user
4. Configure IP whitelist
5. Get connection string
```

### Step 2: Backend Deployment - 10 minutes
```
Option A: Railway
- Create Railway account
- Connect GitHub
- Set environment variables
- Deploy
- Get backend URL

Option B: Heroku
- Create Heroku account
- Connect GitHub
- Configure Procfile
- Set config vars
- Deploy
- Get Heroku URL
```

### Step 3: Frontend Deployment - 10 minutes
```
Option A: Vercel
- Create Vercel account
- Import GitHub repo
- Set VITE_API_URL env var
- Deploy
- Get Vercel URL

Option B: Netlify
- Create Netlify account
- Connect GitHub
- Set VITE_API_URL env var
- Deploy
- Get Netlify URL
```

### Step 4: Verification - 5 minutes
```
1. Test login functionality
2. Create test quiz
3. Take quiz and submit
4. Check results
5. Verify analytics
6. Check error logs
```

## Scaling Considerations

### Currently
- **Frontend**: CDN cached, auto-scales
- **Backend**: Single dyno/instance
- **Database**: 512MB free tier (sufficient for ~1000 users)

### Future Scaling
- Add **Redis** for caching (sessions, results)
- Add **Load Balancing** for multiple backend instances
- Upgrade **MongoDB** to paid tier
- Add **CDN** for media/assets
- Implement **Message Queue** for heavy operations

## Environment Variables Mapping

### Development
```
Backend: .env (local file)
Frontend: .env.local (local file)
MongoDB: localhost or Atlas
```

### Production
```
Backend: Platform environment vars (Railway/Heroku)
Frontend: Platform environment vars (Vercel/Netlify)
MongoDB: Atlas only
```

## Monitoring & Logs

### Backend Logs
- **Railway**: Dashboard → Logs
- **Heroku**: `heroku logs --tail`
- Includes: API calls, errors, Socket.io events

### Frontend Logs
- **Vercel**: Dashboard → Analytics
- **Netlify**: Dashboard → Analytics
- Browser console for client-side errors

### Database Logs
- **MongoDB Atlas**: Dashboard → Activity

## Troubleshooting Quick Guide

| Issue | Check |
|-------|-------|
| 404 on API calls | Frontend VITE_API_URL matches backend URL |
| CORS errors | Backend FRONTEND_URL matches frontend domain |
| MongoDB connection fails | Connection string correct, IP whitelisted |
| Socket.io not connecting | Backend FRONTEND_URL has correct protocol (https) |
| Blank page on frontend | Check browser console, verify build succeeded |
| Backend crashes | Check error logs, verify all env vars set |

## Cost Breakdown (Approximate)

```
Monthly Costs:

✓ Vercel Frontend: FREE (Hobby tier)
✓ Railway Backend: FREE ($5 trial credit)
✓ MongoDB Atlas: FREE (512MB shared)
✓ Domain: ~$10-15/year (optional)

Total: FREE-$5/month for small usage
Scale-up costs only when usage increases
```

## Deployment Timeline

**Total estimated time: 30-45 minutes**

```
1. MongoDB Atlas setup          [5 min]
2. Backend deployment           [10 min]
3. Frontend deployment          [10 min]
4. Environment configuration    [5 min]
5. Testing & verification       [5 min]
Total                          [35 min]
```

---

## Key Files for Deployment

| File | Purpose |
|------|---------|
| `backend/.env.example` | Backend env template |
| `backend/package.json` | Backend dependencies & scripts |
| `backend/Dockerfile.backend` | Docker image for backend |
| `backend/railway.json` | Railway-specific config |
| `frontend/.env.example` | Frontend env template |
| `frontend/package.json` | Frontend dependencies & scripts |
| `frontend/vite.config.js` | Build configuration |
| `frontend/vercel.json` | Vercel-specific config |
| `Procfile` | Heroku process types |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `SETUP.md` | Local development setup |
| `QUICK_DEPLOY.md` | Quick reference |

---

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For local setup, see [SETUP.md](./SETUP.md)
For quick reference, see [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
