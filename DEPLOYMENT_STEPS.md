# 🚀 QUICK DEPLOYMENT GUIDE
## Student Assessment System - Production Deployment

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Step 1: Generate JWT Secrets (CRITICAL)

Run this command **twice** to generate two different secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Save these secrets securely** - you'll need them in Step 3.

---

### ✅ Step 2: Create Backend .env File

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file and replace:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas connection string (get from Atlas dashboard)
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/assessment_db?retryWrites=true&w=majority

# JWT Secrets (use the generated secrets from Step 1)
JWT_SECRET=<PASTE_FIRST_SECRET_HERE>
JWT_REFRESH_SECRET=<PASTE_SECOND_SECRET_HERE>

JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Your Netlify frontend URL
FRONTEND_URL=https://your-app.netlify.app
ALLOWED_ORIGINS=https://your-app.netlify.app,http://localhost:5173

# Cloudinary (Optional - only if using file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### ✅ Step 3: Create Frontend .env File

```bash
cd frontend
cp .env.example .env.production
```

Edit `.env.production`:

```env
# Backend API URL (will be your Heroku URL)
VITE_API_URL=https://your-backend.herokuapp.com/api

VITE_APP_NAME=Student Assessment System
VITE_MODE=production
```

---

### ✅ Step 4: Update Netlify Security Headers

Edit `frontend/netlify.toml` line 16:

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-backend.herokuapp.com; font-src 'self' data:; frame-ancestors 'none'; object-src 'none';"
```

Replace `https://your-backend.herokuapp.com` with your actual Heroku URL.

---

## 🗄️ MONGODB ATLAS SETUP

### 1. Create Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (Free M0 tier available)
3. Database name: `assessment_db`

### 2. Security Configuration

**Network Access:**
- Click "Network Access" → "Add IP Address"
- Add: `0.0.0.0/0` (allows Heroku dynamic IPs)

**Database Access:**
- Click "Database Access" → "Add New Database User"
- Username: `assessment_user`
- Password: (Generate strong password)
- Role: `Read and write to any database` OR `Atlas admin`

### 3. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `assessment_db`

**Example:**
```
mongodb+srv://assessment_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/assessment_db?retryWrites=true&w=majority
```

### 4. Enable Backups

1. Go to cluster → "Backup"
2. Enable automated backups (Free tier: 2-day retention)

---

## 🔧 HEROKU BACKEND DEPLOYMENT

### 1. Install Heroku CLI

Download from: https://devcenter.heroku.com/articles/heroku-cli

### 2. Login and Create App

```bash
heroku login
heroku create your-app-backend
```

### 3. Set Environment Variables

```bash
heroku config:set NODE_ENV=production -a your-app-backend
heroku config:set JWT_SECRET="<YOUR_GENERATED_SECRET>" -a your-app-backend
heroku config:set JWT_REFRESH_SECRET="<YOUR_SECOND_SECRET>" -a your-app-backend
heroku config:set JWT_EXPIRES_IN="1h" -a your-app-backend
heroku config:set JWT_REFRESH_EXPIRES_IN="7d" -a your-app-backend
heroku config:set MONGODB_URI="<YOUR_MONGODB_CONNECTION_STRING>" -a your-app-backend
heroku config:set FRONTEND_URL="https://your-app.netlify.app" -a your-app-backend
heroku config:set ALLOWED_ORIGINS="https://your-app.netlify.app" -a your-app-backend
```

**Optional (if using Cloudinary):**
```bash
heroku config:set CLOUDINARY_CLOUD_NAME="<your-cloud-name>" -a your-app-backend
heroku config:set CLOUDINARY_API_KEY="<your-api-key>" -a your-app-backend
heroku config:set CLOUDINARY_API_SECRET="<your-api-secret>" -a your-app-backend
```

### 4. Deploy Backend

```bash
cd backend
git init
git add .
git commit -m "Production deployment with security hardening"
heroku git:remote -a your-app-backend
git push heroku master
```

**Or if using main branch:**
```bash
git push heroku main:master
```

### 5. Verify Deployment

```bash
heroku logs --tail -a your-app-backend
heroku open -a your-app-backend
```

Test health endpoint:
```bash
curl https://your-app-backend.herokuapp.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "uptime": 123.45,
  "database": "connected"
}
```

---

## 🌐 NETLIFY FRONTEND DEPLOYMENT

### Option A: Netlify CLI (Recommended)

```bash
npm install -g netlify-cli
netlify login

cd frontend
npm run build
netlify deploy --prod
```

Follow prompts:
- Build command: `npm run build`
- Publish directory: `dist`

### Option B: GitHub Integration

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Production deployment"
git branch -M main
git remote add origin https://github.com/yourusername/student-assessment.git
git push -u origin main
```

2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Connect to GitHub repository
5. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

6. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.herokuapp.com/api`

7. Deploy!

### Set Custom Domain (Optional)

```bash
netlify domains:add yourdomain.com
```

Follow DNS configuration instructions.

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Test Authentication

**Register a new user:**
```bash
curl -X POST https://your-backend.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "student",
    "indexNumber": "ST001"
  }'
```

**Login:**
```bash
curl -X POST https://your-backend.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Should return JWT token and set `refreshToken` cookie.

### 2. Test Frontend → Backend

1. Open https://your-app.netlify.app
2. Register account
3. Login (should work)
4. Create quiz as lecturer
5. Take quiz as student
6. Submit quiz
7. View results

### 3. Check Security Headers

```bash
curl -I https://your-app.netlify.app
```

Should see:
- `strict-transport-security`
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `content-security-policy`

### 4. Test Rate Limiting

```bash
# Send 6 rapid login requests (6th should fail)
for i in {1..6}; do
  curl -X POST https://your-backend.herokuapp.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nRequest $i complete"
done
```

6th request should return `429 Too Many Requests`.

---

## 🛡️ SECURITY VERIFICATION CHECKLIST

- [ ] JWT secrets are strong (64+ characters random)
- [ ] No default/placeholder secrets in .env
- [ ] HTTPS enforced on both frontend and backend
- [ ] CORS whitelist configured with actual frontend URL
- [ ] MongoDB Atlas IP allowlist configured
- [ ] Database backups enabled
- [ ] Rate limiting working (test with multiple requests)
- [ ] Security headers present (check with curl -I)
- [ ] Token refresh working (test /api/auth/refresh)
- [ ] Logout clears cookies (test /api/auth/logout)
- [ ] Input validation rejecting invalid data
- [ ] No error stack traces exposed in production
- [ ] Audit logs recording authentication events

---

## 📊 MONITORING SETUP

### Heroku Logs

```bash
# View real-time logs
heroku logs --tail -a your-app-backend

# View last 100 lines
heroku logs -n 100 -a your-app-backend
```

### Recommended Monitoring Services

1. **UptimeRobot** (Free) - https://uptimerobot.com
   - Monitor: `https://your-backend.herokuapp.com/api/health`
   - Check interval: 5 minutes
   - Alerts: Email on downtime

2. **MongoDB Atlas Alerts**
   - Go to Atlas → Alerts
   - Enable:
     - Connection failures
     - High CPU (>80%)
     - Slow queries (>100ms)
     - Disk space warnings

3. **Netlify Analytics** (Built-in)
   - View in Netlify dashboard
   - Tracks page views, bandwidth, errors

---

## 🚨 TROUBLESHOOTING

### Backend not starting

**Check logs:**
```bash
heroku logs --tail -a your-app-backend
```

**Common issues:**
- Missing environment variables (JWT_SECRET, MONGODB_URI)
- Database connection failure (check MongoDB IP allowlist)
- Port binding (Heroku assigns PORT automatically)

### CORS errors

**Solution:**
```bash
# Verify FRONTEND_URL matches Netlify domain
heroku config:get FRONTEND_URL -a your-app-backend

# Should return: https://your-app.netlify.app
# If not, update it:
heroku config:set FRONTEND_URL="https://your-app.netlify.app" -a your-app-backend
```

### Token expired errors

**Frontend needs to implement refresh token flow:**

```javascript
// In frontend axios interceptor:
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Call refresh token endpoint
      const refreshResponse = await axios.post('/auth/refresh');
      // Retry original request with new token
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Database connection timeouts

**Solution:**
1. Check MongoDB Atlas status page
2. Verify IP allowlist includes `0.0.0.0/0`
3. Check database user permissions
4. Verify connection string format

---

## 🎓 PRODUCTION READY!

Your Student Assessment System is now deployed with:

✅ **Security:**
- JWT authentication with refresh tokens
- HTTPS end-to-end
- Input validation
- Rate limiting
- Audit logging
- CORS protection
- Security headers

✅ **Reliability:**
- Database connection pooling
- Error handling
- Health monitoring
- Automated backups

✅ **Performance:**
- Response compression
- Database indexes
- Caching headers
- CDN delivery (Netlify)

**Access your application:**
- Frontend: https://your-app.netlify.app
- Backend: https://your-app-backend.herokuapp.com
- API Docs: https://your-app-backend.herokuapp.com/api-docs

---

## 📞 Need Help?

**Common Commands:**
```bash
# Backend logs
heroku logs --tail -a your-app-backend

# Restart backend
heroku restart -a your-app-backend

# Open backend
heroku open -a your-app-backend

# Check environment variables
heroku config -a your-app-backend

# Frontend build locally
cd frontend && npm run build

# Frontend logs (Netlify)
netlify logs
```

**Good luck with your deployment! 🚀**
