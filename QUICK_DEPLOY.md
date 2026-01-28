# 🚀 Quick Deployment Reference

## Railway Deployment Checklist

### Setup (5 minutes)
- [ ] Railway account created
- [ ] GitHub connected
- [ ] Repository selected
- [ ] Root directory set to `backend`

### Environment Variables
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<32-char-secret>
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Deploy
1. Push to GitHub
2. Railway auto-builds
3. Copy backend URL from Railway dashboard
4. Add to frontend `VITE_API_URL`

---

## Heroku Deployment Checklist

### Setup (5 minutes)
- [ ] Heroku account created
- [ ] App created
- [ ] GitHub connected
- [ ] `Procfile` configured: `web: cd backend && npm start`

### Environment Variables (Settings → Config Vars)
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<32-char-secret>
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Deploy
1. Click "Deploy Branch"
2. Wait for build logs
3. Copy Heroku app URL
4. Add to frontend `VITE_API_URL`

---

## Vercel Deployment Checklist

### Setup (5 minutes)
- [ ] Vercel account created
- [ ] GitHub connected
- [ ] Repository imported
- [ ] Root directory: `/frontend`

### Build Settings (Auto-detected)
```
Framework: Vite
Build: npm run build
Output: dist
```

### Environment Variables (Production)
```
VITE_API_URL=https://your-backend.railway.app
```

### Deploy
1. Click "Deploy"
2. Wait for build
3. Preview at Vercel URL
4. Domain auto-assigned

---

## Netlify Deployment Checklist

### Setup (5 minutes)
- [ ] Netlify account created
- [ ] GitHub connected
- [ ] Repository selected
- [ ] Base: `frontend`

### Build Settings
```
Build: npm run build
Publish: dist
```

### Environment Variables
```
VITE_API_URL=https://your-backend.railway.app
```

### Deploy
1. Connect repository
2. Auto-deploys on git push
3. Preview at Netlify URL

---

## MongoDB Atlas Checklist

- [ ] Account created
- [ ] Free cluster created
- [ ] Database user created (username + password)
- [ ] Network access configured (Add IP)
- [ ] Connection string copied
- [ ] Database name set to `assessment_db`

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/assessment_db
```

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Build fails | Check logs, verify dependencies |
| API 404 | Check `FRONTEND_URL` env var |
| CORS error | Backend `FRONTEND_URL` should match frontend domain |
| MongoDB error | Verify connection string, IP whitelist |
| Socket.io fail | Check CORS settings for WebSocket |

---

## After Deployment

✅ Test each functionality:
1. Register as student
2. Register as lecturer
3. Create a quiz
4. Take a quiz
5. View results
6. Check analytics

**Estimated deployment time: 30 minutes**
