# Student Assessment System

A comprehensive web-based assessment platform for educational institutions, built with modern web technologies.

## 🚀 Features

### For Students
- Take timed quizzes with various question types (MCQ, True/False, Short Answer)
- Real-time countdown timer with auto-submit
- View detailed results and explanations
- Track progress and performance analytics
- Attempt history and score tracking

### For Lecturers
- Create and manage quizzes with rich text support
- Set duration, attempt limits, and publish settings
- View detailed student analytics and performance metrics
- Real-time monitoring of active quizzes
- Export results and analytics data

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Socket.io Client** for real-time features
- **Chart.js** for data visualization

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Swagger** for API documentation

## � Quick Links

- **[Setup Guide](./SETUP.md)** - Local development setup
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[Quick Deploy Reference](./QUICK_DEPLOY.md)** - Quick checklist for deployment

## 🚀 Quick Start

### Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 (frontend) and http://localhost:5000/api-docs (API docs)

### Production Deployment
1. **Frontend**: Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. **Backend**: Deploy to [Railway](https://railway.app) or [Heroku](https://heroku.com)
3. **Database**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## �📁 Project Structure
