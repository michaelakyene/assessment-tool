# Installation & Setup Guide

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or MongoDB Atlas)
- Git

## Local Development Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd student-assessment
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# MONGODB_URI=mongodb://localhost:27017/assessment_db (for local MongoDB)
# Or use MongoDB Atlas connection string
# JWT_SECRET=your-secret-key (min 32 chars)
# FRONTEND_URL=http://localhost:5173
# NODE_ENV=development

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:5173
```

## Project Structure

```
student-assessment/
├── backend/                    # Express API
│   ├── config/                # Configuration files
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Express middleware
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── socket/               # Socket.io handlers
│   ├── swagger/              # API documentation
│   ├── utils/                # Utility functions
│   ├── .env.example          # Environment template
│   ├── package.json          # Dependencies
│   └── server.js             # Entry point
│
├── frontend/                   # React Vite app
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   ├── .env.example         # Environment template
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   └── package.json         # Dependencies
│
├── DEPLOYMENT.md            # Full deployment guide
├── QUICK_DEPLOY.md         # Quick reference
└── README.md               # Project overview
```

## Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/assessment_db

# Authentication
JWT_SECRET=your-super-secret-key-minimum-32-characters-long

# CORS & Frontend
FRONTEND_URL=http://localhost:5173

# File Storage (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env.local)

```env
# For production, set this to your backend URL
# For development, vite proxy handles it automatically
VITE_API_URL=http://localhost:5000
```

## Running Tests

### Frontend Tests
```bash
cd frontend

# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run cypress:open
npm run cypress:run
```

## Building for Production

### Backend
```bash
cd backend
npm install
# Server.js will run with NODE_ENV=production
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Output in dist/ directory
npm run preview  # Preview production build
```

## API Documentation

Once backend is running:
- **Swagger Docs**: http://localhost:5000/api-docs
- **API Base**: http://localhost:5000/api

## Common Commands

```bash
# Backend
cd backend
npm start          # Start server
npm run dev        # Start with auto-reload
npm install        # Install dependencies

# Frontend
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### "Port already in use"
- Backend default: 5000
- Frontend default: 5173
- Change in .env or Vite config

### MongoDB connection issues
- Ensure MongoDB is running (if using local)
- Check connection string in .env
- Verify IP whitelist if using MongoDB Atlas

### CORS errors
- Verify FRONTEND_URL in backend .env
- Ensure it matches actual frontend URL

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide with:
- MongoDB Atlas setup
- Railway/Heroku backend deployment
- Vercel/Netlify frontend deployment
- Environment configuration
- Security best practices

Quick reference: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## Support

For issues or questions:
1. Check the error logs
2. Review API documentation at `/api-docs`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
