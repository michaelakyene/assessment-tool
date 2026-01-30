# 🧪 QUICK TESTING GUIDE
## Verify Your Deployment is Working

---

## 📋 TEST CHECKLIST

### 1️⃣ Backend Health Check (30 seconds)

**In Terminal:**
```bash
curl https://student-assessment-api-9754ea9fac96.herokuapp.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "uptime": "..."
}
```

**Status:** ✅ Pass if you see `"status":"ok"`

---

### 2️⃣ Frontend Loading (30 seconds)

**In Browser:**
1. Go to: https://assquiz.netlify.app
2. Should load without errors
3. Check browser console (F12 → Console tab)
4. Should see no red errors about API connection

**Status:** ✅ Pass if page loads and console shows no API errors

---

### 3️⃣ Registration Test (1 minute)

**In Browser or Terminal:**

Using Postman or curl:
```bash
curl -X POST https://student-assessment-api-9754ea9fac96.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "role": "student",
    "indexNumber": "ST999"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "testuser@example.com",
    "role": "student"
  },
  "token": "eyJ...",
  "expiresIn": "1h"
}
```

**Status:** ✅ Pass if `"message":"User registered successfully"`

---

### 4️⃣ Login Test (1 minute)

**In Terminal:**
```bash
curl -X POST https://student-assessment-api-9754ea9fac96.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJ...",
  "expiresIn": "1h"
}
```

**Status:** ✅ Pass if `"message":"Login successful"`

---

### 5️⃣ Password Validation Test (30 seconds)

**In Terminal (Try to register with weak password):**
```bash
curl -X POST https://student-assessment-api-9754ea9fac96.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "weak@test.com",
    "password": "weak",
    "role": "student",
    "indexNumber": "ST001"
  }'
```

**Expected Response:**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be between 8 and 128 characters"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    }
  ]
}
```

**Status:** ✅ Pass if weak password is **REJECTED** with validation errors

---

### 6️⃣ Security Headers Test (30 seconds)

**In Terminal:**
```bash
curl -I https://student-assessment-api-9754ea9fac96.herokuapp.com/api/health
```

**Look for these headers:**
```
Strict-Transport-Security: max-age=15552000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Access-Control-Allow-Credentials: true
```

**Status:** ✅ Pass if all 4 security headers are present

---

### 7️⃣ Frontend Login Test (2 minutes)

**In Browser:**
1. Go to: https://assquiz.netlify.app
2. Click on **Login** (or look for login link)
3. Enter credentials:
   - **Email:** testuser@example.com
   - **Password:** TestPass123!
4. Click **Login**

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ User name displayed
- ✅ No error messages

**Status:** ✅ Pass if you're logged in and see dashboard

---

### 8️⃣ CORS Test (30 seconds)

**In Browser Console (F12 → Console):**
```javascript
fetch('https://student-assessment-api-9754ea9fac96.herokuapp.com/api/health')
  .then(r => r.json())
  .then(d => console.log('CORS ✅ Working:', d))
  .catch(e => console.error('CORS ❌ Failed:', e))
```

**Expected Output:**
```
CORS ✅ Working: {status: "ok", timestamp: "...", uptime: "..."}
```

**Status:** ✅ Pass if CORS request succeeds

---

## 🎯 SUMMARY CHECKLIST

| Test | Status | Fix if Failed |
|------|--------|---------------|
| Backend Health | ✅ | Run: `heroku logs --tail -a student-assessment-api` |
| Frontend Loading | ✅ | Check browser console for errors |
| Registration | ✅ | Check MongoDB connection in logs |
| Login | ✅ | Verify JWT_SECRET is set |
| Weak Password Rejected | ✅ | Validation middleware should be active |
| Security Headers | ✅ | Helmet.js should be enabled |
| Frontend Login | ✅ | Check VITE_API_URL environment variable |
| CORS | ✅ | Check ALLOWED_ORIGINS in Heroku config |

---

## 📊 EXPECTED TEST RESULTS

### All Tests Pass ✅
Your deployment is **PRODUCTION READY**. You can:
- ✅ Allow students to register
- ✅ Allow them to log in
- ✅ Allow them to take quizzes
- ✅ Have full security protection

### Some Tests Fail ❌
- Check logs: `heroku logs --tail -a student-assessment-api`
- Verify environment variables: `heroku config -a student-assessment-api`
- Check MongoDB connection
- Restart app: `heroku restart -a student-assessment-api`

---

## 🚀 QUICK TROUBLESHOOTING

### "Cannot connect to API"
```bash
# Check backend is running
curl https://student-assessment-api-9754ea9fac96.herokuapp.com/api/health

# Check logs
heroku logs --tail -a student-assessment-api

# If failed, restart
heroku restart -a student-assessment-api
```

### "Database connection error"
```bash
# Verify MongoDB URI
heroku config -a student-assessment-api | grep MONGODB_URI

# Check MongoDB Atlas IP allowlist
# Go to: cloud.mongodb.com → Network Access
# Ensure 0.0.0.0/0 is added
```

### "CORS error in browser"
```bash
# Verify ALLOWED_ORIGINS
heroku config -a student-assessment-api | grep ALLOWED_ORIGINS

# Should include: https://assquiz.netlify.app
```

### "Invalid JWT error"
```bash
# Verify JWT secrets are set
heroku config -a student-assessment-api | grep JWT_SECRET

# Both JWT_SECRET and JWT_REFRESH_SECRET must be set
```

---

## 📞 CONTACT & SUPPORT

If tests fail, provide:
1. **Error message** (copy-paste from logs or browser)
2. **Test you ran** (which curl command or step)
3. **Expected vs actual result**

Then I can help diagnose! 🔧

---

## ✅ VERIFICATION COMPLETE

Once all tests pass:
1. **Document the results** (screenshot or copy-paste responses)
2. **Share with stakeholders** - System is LIVE and SECURE
3. **Begin user testing** - Recruit test students and lecturers
4. **Monitor performance** - Watch logs and response times

**Status:** Your system is PRODUCTION-READY! 🎉
