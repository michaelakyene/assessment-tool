# 📋 Deployment Guide - Student Assessment System

This guide covers deploying the application with:
- **Frontend**: Vercel or Netlify
- **Backend**: Railway or Heroku  
- **Database**: MongoDB Atlas

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account & Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new **Free Tier** cluster (recommended for development)
4. Choose a region close to your deployment (e.g., US East for Heroku/Railway)
5. Click "Create Cluster"

### 1.2 Configure Database Access
1. Navigate to **Database Access** in the left sidebar
2. Click **+ Add New Database User**
3. Create username and password
4. Assign role: **"Atlas Admin"**
5. Click **Add User**

### 1.3 Get Connection String
1. Click **Databases** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (MongoDB URI)
5. Replace `<username>` and `<password>` with your database user credentials
6. Replace `<database>` with `assessment_db`

**Example format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/assessment_db?retryWrites=true&w=majority
```

### 1.4 Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **+ Add IP Address**
3. Select **Allow Access from Anywhere** (for development)
   - ⚠️ For production, add specific IP addresses
4. Click **Confirm**

---

## 🔧 Step 2: Backend Deployment (Railway or Heroku)

### Option A: Deploy to Railway (Recommended)

#### 2A.1 Railway Setup
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project
4. Click **Deploy from GitHub repo**
5. Select your `student-assessment` repository

#### 2A.2 Configure Environment Variables
In Railway Dashboard:
1. Go to **Variables** tab
2. Add the following environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/assessment_db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your-cloud-name (optional)
CLOUDINARY_API_KEY=your-api-key (optional)
CLOUDINARY_API_SECRET=your-api-secret (optional)
```

#### 2A.3 Build Configuration
1. Set **ROOT DIRECTORY** to `backend`
2. **Start Command**: `npm start` or `npm run dev`
3. Railway will auto-detect and install dependencies

#### 2A.4 Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Copy your backend URL (e.g., `https://your-app.railway.app`)

---

### Option B: Deploy to Heroku

#### 2B.1 Heroku Setup
1. Go to [Heroku.com](https://www.heroku.com)
2. Sign up or log in
3. Create a new app
4. Choose a unique app name
5. Select region closest to you

#### 2B.2 Connect GitHub
1. Click **Deploy** tab
2. Choose **GitHub** as deployment method
3. Search for `student-assessment` repository
4. Click **Connect**

#### 2B.3 Configure Build Packs
1. Go to **Settings** tab
2. Click **Add buildpack**
3. Select **Node.js**
4. Set **Procfile** root directory to `backend`:
   ```
   web: cd backend && npm start
   ```

#### 2B.4 Set Environment Variables
1. Go to **Settings** → **Config Vars**
2. Click **Reveal Config Vars**
3. Add variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Super secret key (min 32 chars) |
| `FRONTEND_URL` | Your Vercel/Netlify frontend URL |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | (optional) |
| `CLOUDINARY_API_KEY` | (optional) |
| `CLOUDINARY_API_SECRET` | (optional) |

#### 2B.5 Deploy
1. Click **Deploy Branch**
2. Wait for build logs to complete
3. View your backend at the provided Heroku URL

---

## 🎨 Step 3: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

#### 3A.1 Vercel Setup
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **New Project**
4. Import your `student-assessment` repository
5. Select **root directory**: `/frontend`

#### 3A.2 Configure Build Settings
1. **Framework Preset**: Select **Vite**
2. **Build Command**: `npm run build` (auto-detected)
3. **Output Directory**: `dist` (auto-detected)
4. **Install Command**: `npm ci` (auto-detected)

#### 3A.3 Set Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add variable:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | https://your-backend.railway.app | Production |
| `VITE_API_URL` | http://localhost:5000 | Preview, Development |

3. Click **Save**

#### 3A.4 Deploy
1. Click **Deploy**
2. Wait for deployment to complete
3. Your frontend URL: `https://your-project.vercel.app`

---

### Option B: Deploy to Netlify

#### 3B.1 Netlify Setup
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click **Add new site** → **Import an existing project**
4. Select your `student-assessment` repository

#### 3B.2 Build Configuration
1. **Base directory**: `frontend`
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`

#### 3B.3 Set Environment Variables
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add:

```
VITE_API_URL=https://your-backend.railway.app
```

#### 3B.4 Deploy
1. Netlify auto-deploys on git push
2. View your site URL in the dashboard

---

## ✅ Verification Checklist

After deployment, verify everything works:

### Backend (Railway/Heroku)
- [ ] API accessible at `https://your-backend-url/api`
- [ ] Swagger docs accessible at `https://your-backend-url/api-docs`
- [ ] Health check: `curl https://your-backend-url/api/health`
- [ ] Authentication works: Test login endpoint

### Frontend (Vercel/Netlify)
- [ ] Frontend loads without errors
- [ ] Can access login page
- [ ] API calls successful (check browser console)
- [ ] Socket.io connects (check Network tab)

### Database (MongoDB Atlas)
- [ ] Connection string working
- [ ] Database `assessment_db` created
- [ ] Collections created automatically on first request

---

## 🔐 Security Configuration

### 1. Update CORS Settings
In `backend/server.js`, CORS is configured with `FRONTEND_URL` environment variable.
Verify it's set to your Vercel/Netlify domain.

### 2. Enable MongoDB Atlas Network Restrictions
1. Go to **Network Access** in MongoDB Atlas
2. Remove "Allow from Anywhere" 
3. Add specific IP addresses of your hosting provider

### 3. Rotate JWT Secret
1. Generate a strong JWT secret (min 32 characters)
2. Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Update in your hosting platform's environment variables

### 4. Enable HTTPS
- Vercel & Netlify: Automatic (included in free tier)
- Railway & Heroku: Automatic (included)

---

## 📝 Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/assessment_db
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=5000 (optional, Railway/Heroku provide this)
```

### Frontend (.env.local)
```
VITE_API_URL=https://your-backend.railway.app
```

---

## 🚀 Post-Deployment Steps

1. **Test User Registration**: Create test accounts
2. **Create Test Quiz**: Add sample quizzes as lecturer
3. **Take Test Quiz**: Complete quiz as student
4. **Check Analytics**: Verify results display correctly
5. **Monitor Logs**: Check application logs for errors

### Useful Commands for Testing

```bash
# Test backend API
curl https://your-backend-url/api-docs

# Test frontend build
npm run build
npm run preview

# Check environment variables are loaded
echo $VITE_API_URL
```

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- Verify MongoDB URI in environment variables
- Check IP whitelist in MongoDB Atlas Network Access
- Test connection string locally

### "CORS error on frontend"
- Verify `FRONTEND_URL` matches your actual frontend domain
- Check browser console for exact error message
- Ensure backend is running

### "Socket.io connection failed"
- Verify `SOCKET_ORIGIN` in backend matches frontend URL
- Check CORS settings for Socket.io
- Test with browser DevTools Network tab

### "Build fails on deployment"
- Check build logs for errors
- Verify `package.json` has correct scripts
- Ensure all dependencies are in `dependencies` (not devDependencies)

---

## 📞 Support Resources

- [Railway Docs](https://docs.railway.app)
- [Heroku Docs](https://devcenter.heroku.com)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

## 🎯 Quick Deploy Summary

1. **Database**: Create MongoDB Atlas cluster + get URI
2. **Backend**: Push to Railway/Heroku + set env vars
3. **Frontend**: Push to Vercel/Netlify + set `VITE_API_URL`
4. **Verify**: Test login, quiz, and results
5. **Done!** 🎉

Estimated total time: **20-30 minutes**
