# Student Assessment System - Comprehensive Routing & Flow Audit

**Generated:** $(date)  
**Version:** 1.0.0  
**Status:** Complete

---

## Executive Summary

This audit provides a complete mapping of the application's routing structure, authentication flow, data flow between frontend and backend, and identifies any potential issues or areas for improvement. The application follows a typical MERN stack architecture with role-based access control.

---

## 1. ARCHITECTURE OVERVIEW

### Stack
- **Frontend:** React 18 + Vite + React Router v6
- **Backend:** Node.js + Express.js + Socket.io
- **Database:** MongoDB
- **Authentication:** JWT (Access + Refresh tokens)
- **Real-time:** Socket.io for notifications and live progress

### Key Design Patterns
- ✅ Role-based access control (RBAC): Student vs Lecturer
- ✅ Token-based authentication with HTTP-only cookies
- ✅ Middleware-based request validation and authorization
- ✅ Async/await for all database operations
- ✅ Socket.io for real-time updates

---

## 2. FRONTEND ROUTING STRUCTURE

**File:** `frontend/src/App.jsx`

### Route Tree

```
/
├── /login                    [Public] → Login page
├── /                        [Protected] → Role-based dashboard
│   ├── Lecturer → EnhancedLecturerDashboard
│   └── Student → StudentDashboard
├── /profile                 [Protected] → User profile management
├── /create-quiz             [Lecturer] → Create new quiz
├── /edit-quiz/:id           [Lecturer] → Edit existing quiz
├── /quiz/:id                [Protected] → Take quiz (student)
├── /quiz/:id/review         [Protected] → Review attempt
├── /quiz/:id/analytics      [Lecturer] → Quiz analytics
├── /results/:attemptId      [Protected] → View attempt results
└── * (404)                  → Redirect to home/login
```

### Route Protection Matrix

| Route | Authentication | Role Required | Component |
|-------|---|---|---|
| `/login` | ❌ Not needed | - | `Login` |
| `/` | ✅ Required | Both | Dashboard (role-based) |
| `/profile` | ✅ Required | Both | `Profile` |
| `/create-quiz` | ✅ Required | Lecturer | `CreateQuizPage` |
| `/edit-quiz/:id` | ✅ Required | Lecturer | `CreateQuizPage` |
| `/quiz/:id` | ✅ Required | Both | `TakeQuiz` |
| `/quiz/:id/review` | ✅ Required | Both | `ReviewQuiz` |
| `/quiz/:id/analytics` | ✅ Required | Lecturer | `QuizAnalytics` |
| `/results/:attemptId` | ✅ Required | Both | `Results` |

### Protected Route Implementation

```jsx
// Pattern used throughout App.jsx
<Route 
  path="/protected-route" 
  element={user ? <Component /> : <Navigate to="/login" />}
/>

// For role-specific routes
<Route 
  path="/lecturer-only" 
  element={user && user.role === 'lecturer' ? <Component /> : <Navigate to="/login" />}
/>
```

#### ⚠️ Issue Identified: Multiple Navigation Branches
The dashboard route performs role-based navigation:
```jsx
element={
  user ? (
    user.role === 'lecturer' ? 
      <EnhancedLecturerDashboard user={user} /> : 
      <StudentDashboard user={user} />
  ) : (
    <Navigate to="/login" />
  )
}
```
✅ This is correct pattern and working as intended.

---

## 3. BACKEND ROUTING STRUCTURE

**File:** `backend/server.js`

### API Route Hierarchy

```
GET     /                           → API info (public)
GET     /api/health                 → Health check (public)
GET     /api-docs                   → Swagger documentation (public)

/api/auth
  POST    /register                 [Public] → Create account
  POST    /login                    [Public] → Authenticate
  GET     /me                       [Auth] → Get current user
  POST    /refresh                  [Public] → Refresh token
  POST    /logout                   [Auth] → Logout

/api/quizzes
  POST    /                         [Auth + Lecturer] → Create quiz
  GET     /lecturer                 [Auth + Lecturer] → Get my quizzes
  GET     /lecturer/:id             [Auth + Lecturer] → Get quiz details
  GET     /available                [Auth + Student] → Get available quizzes
  GET     /:id                      [Auth] → Get quiz (any role)
  PUT     /:id                      [Auth + Lecturer] → Update quiz
  DELETE  /:id                      [Auth + Lecturer] → Delete quiz
  PATCH   /:id/publish              [Auth + Lecturer] → Toggle publish
  GET     /:id/results              [Auth + Lecturer] → Quiz results
  POST    /:id/duplicate            [Auth + Lecturer] → Duplicate quiz
  POST    /:id/verify-password      [Auth] → Verify quiz password

/api/attempts
  POST    /start                    [Auth] → Start new attempt
  POST    /submit                   [Auth] → Submit attempt
  POST    /timeout                  [Auth] → Handle timeout
  GET     /user                     [Auth] → Get user's attempts
  GET     /:id                      [Auth] → Get specific attempt

/api/analytics
  GET     /overview                 [Auth + Lecturer] → Analytics overview
  GET     /quiz/:quizId             [Auth + Lecturer] → Quiz analytics
  GET     /student/:studentId       [Auth + Lecturer] → Student analytics
```

### Route Ordering (Critical for Specificity)

**File:** `backend/routes/quizRoutes.js`

✅ **Correct Ordering Implemented:**
```javascript
// IMPORTANT: Specific routes MUST come before generic routes (/:id)

// Specific endpoints first (prevents route conflicts)
router.get('/available', ...)           // Must be before /:id
router.get('/lecturer', ...)            // Must be before /:id
router.post('/:id/verify-password', ...) // Specific /:id endpoints
router.post('/:id/duplicate', ...)
router.get('/:id/results', ...)
router.patch('/:id/publish', ...)

// Generic routes LAST
router.post('/', ...)
router.put('/:id', ...)
router.delete('/:id', ...)
router.get('/:id', ...)                 // Generic :id route last
```

#### ✅ Why This Matters
Without proper ordering, requests to `/quizzes/available` would match `/quizzes/:id` with `id='available'`, causing the wrong handler to execute.

---

## 4. AUTHENTICATION FLOW

### 4.1 Registration Flow

```
Frontend (Login.jsx)
  ↓
  POST /api/auth/register { name, email, password, role, studentId }
  ↓
Backend Middleware Chain:
  1. validateRegister → Validates input (email format, password strength, etc.)
  2. register controller
  ↓
Validation Rules Applied:
  • Name: 2-100 chars, letters/spaces/hyphens only
  • Email: Valid email format
  • Password: 8-128 chars, uppercase, lowercase, number, special char
  • Role: 'student' or 'lecturer'
  • StudentId: 3-50 chars, alphanumeric/slashes (if role='student')
  ↓
Database Operation:
  1. Check if email exists (duplicate prevention)
  2. Hash password with bcrypt (10 salt rounds)
  3. Create User document
  4. Generate JWT token (exp: 1h by default)
  5. Generate Refresh token (exp: 7d, stored as HTTP-only cookie)
  ↓
Response:
  {
    message: "User registered successfully",
    user: { id, name, email, role, indexNumber },
    token: "JWT_TOKEN",
    expiresIn: "1h"
  }
  ↓
Frontend:
  • localStorage.setItem('token', jwt_token)
  • localStorage.setItem('user', JSON.stringify(user_data))
  • Redirect to dashboard
```

#### ✅ Security Measures in Place
- Password hashing with bcrypt
- Email uniqueness enforced
- Password complexity requirements
- HTTP-only cookie for refresh token
- Token expiration

#### ⚠️ Potential Issue
- **localStorage stores sensitive data:** While token is in localStorage (accessible via JavaScript), consider:
  - XSS attacks could steal tokens
  - Consider using httpOnly cookies for main token too (if backend can support CSRF)
  - Current approach is standard but has trade-offs

### 4.2 Login Flow

```
Frontend (Login.jsx)
  ↓
  POST /api/auth/login { email, password }
  ↓
Rate Limiter: Max 5 attempts per 15 minutes (applied at /api/auth/login)
  ↓
Backend Middleware Chain:
  1. validateLogin → Email and password validation
  2. login controller
  ↓
Database Operation:
  1. Find user by email
  2. Verify password using bcrypt.compare()
  3. Generate Access Token (1h)
  4. Generate Refresh Token (7d)
  ↓
Response (same as registration):
  {
    message: "Login successful",
    user: { id, name, email, role, indexNumber },
    token: "JWT_TOKEN",
    expiresIn: "1h"
  }
  ↓
Frontend:
  • Store token and user in localStorage
  • Redirect to appropriate dashboard
```

### 4.3 Token Refresh Flow

```
Frontend (when token expires or on auth refresh)
  ↓
  POST /api/auth/refresh
  ↓
Backend:
  1. Extract refresh token from cookie
  2. Verify refresh token
  3. Generate new access token
  ↓
Response:
  { token: "NEW_JWT", expiresIn: "1h" }
```

### 4.4 Logout Flow

```
Frontend (Navbar.jsx)
  ↓
  POST /api/auth/logout [With auth token]
  ↓
Backend (authMiddleware validates token first)
  1. Clear refresh token cookie
  ↓
Frontend:
  • localStorage.removeItem('token')
  • localStorage.removeItem('user')
  • Navigate to /login
```

### 4.5 Authentication Middleware

**File:** `backend/middleware/authMiddleware.js`

#### authMiddleware Function
```javascript
// Applied to ALL protected routes
authMiddleware = async (req, res, next) => {
  1. Extract token from Authorization header (Bearer scheme)
  2. Verify token exists
  3. Verify JWT_SECRET is configured
  4. Decode JWT token
  5. Validate token type === 'access'
  6. Look up user in database
  7. Attach user object to req.user
  8. Call next()
}
```

#### ✅ Error Handling
- ❌ No token → 401 "No authentication token provided"
- ❌ Expired token → 401 "Token expired - please login again" (code: TOKEN_EXPIRED)
- ❌ Invalid token → 401 "Invalid token" (code: INVALID_TOKEN)
- ❌ User not found → 401 "User not found or deactivated"

#### Frontend Error Handling

**File:** `frontend/src/services/api.js`

```javascript
// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)
```

### 4.6 Role-Based Access Control (RBAC)

**File:** `backend/middleware/authMiddleware.js`

```javascript
roleMiddleware = (...roles) => {
  return (req, res, next) => {
    1. Check if user is authenticated (req.user exists)
    2. Check if user.role is in allowed roles
    3. If not authorized → 403 "Access denied - insufficient permissions"
    4. If authorized → call next()
  }
}
```

#### RBAC Implementation Examples

```javascript
// Lecturer-only endpoint
router.post(
  '/',
  authMiddleware,                    // 1. Must be authenticated
  roleMiddleware('lecturer'),        // 2. Must have lecturer role
  validateQuizCreate,                // 3. Validate request body
  createQuiz                         // 4. Handle request
)

// Admin-only endpoint (if needed)
router.get(
  '/admin/overview',
  authMiddleware,
  roleMiddleware('admin'),           // Only admins
  getAdminOverview
)

// Multiple roles allowed
router.get(
  '/quiz/:id/results',
  authMiddleware,
  roleMiddleware('lecturer', 'admin'), // Either lecturer or admin
  getQuizResults
)
```

#### Current RBAC Usage
| Endpoint | Student | Lecturer |
|----------|---------|----------|
| POST /quizzes | ❌ | ✅ |
| GET /quizzes/lecturer | ❌ | ✅ |
| GET /quizzes/available | ✅ | ✅ |
| GET /quizzes/:id | ✅ | ✅ |
| PUT /quizzes/:id | ❌ | ✅ |
| DELETE /quizzes/:id | ❌ | ✅ |
| PATCH /quizzes/:id/publish | ❌ | ✅ |
| GET /analytics/* | ❌ | ✅ |
| POST /attempts/start | ✅ | ✅ |
| GET /attempts/user | ✅ | ✅ |

---

## 5. DATA FLOW ANALYSIS

### 5.1 Quiz Creation Flow

```
Frontend (CreateQuizPage.jsx)
  ↓
  User fills form:
    - Title, description
    - Duration, max attempts
    - Questions array:
      * Question text
      * Type (MCQ / True-False / Short Answer)
      * Options (for MCQ)
      * Correct answer
      * Marks
      * Explanation
    - Publishing settings (password, review, etc.)
  ↓
  POST /api/quizzes [with auth token]
  ↓
Frontend → Backend Request:
  {
    title: string,
    description: string,
    duration: number (minutes),
    maxAttempts: number,
    questions: [
      {
        questionText: string,
        type: 'multiple_choice' | 'true_false' | 'short_answer',
        options: string[] (for MCQ),
        correctAnswer: string,
        marks: number,
        explanation: string
      }
    ],
    password: string (optional),
    hasPassword: boolean,
    allowReview: boolean,
    showCorrectAnswers: boolean,
    randomizeQuestions: boolean,
    randomizeOptions: boolean,
    passingScore: number,
    scheduledPublish: date (optional),
    deadline: date (optional)
  }
  ↓
Backend Middleware Chain:
  1. authMiddleware → Verify user is authenticated
  2. roleMiddleware('lecturer') → Verify user is lecturer
  3. validateQuizCreate → Validate all fields
  ↓
Backend Validation (quizController.js):
  • Title is required and non-empty
  • Duration ≥ 1 minute
  • At least 1 question required
  • Each question:
    - Question text required
    - Type required
    - Correct answer required
    - Marks ≥ 1
    - MCQ requires ≥ 2 options
  ↓
Database Operation:
  1. Transform questions (questionText → text, type mapping)
  2. Create Quiz document:
    - title, description, duration
    - questions array (with transformed format)
    - createdBy: req.user._id (lecturer's ID)
    - isPublished: false (default)
    - password, maxAttempts, settings
    - timestamps
  3. Save to MongoDB
  ↓
Response:
  {
    _id: ObjectId,
    title: string,
    createdBy: ObjectId,
    isPublished: false,
    ...other_fields
  }
  ↓
Frontend:
  • Update quiz list state
  • Show success notification
  • Navigate to quiz edit page or dashboard
```

### 5.2 Quiz Attempt & Submission Flow

```
Student Views Available Quiz
  ↓
  POST /api/attempts/start { quizId }
  ↓
Backend (attemptController.startAttempt):
  1. Verify quiz exists
  2. Verify quiz is published
  3. Count previous attempts
  4. Check if max attempts reached
  5. Check for existing in-progress attempt
  6. If exists → Return existing attempt (resume)
  7. If not → Create new Attempt:
    - user: req.user._id
    - quiz: quizId
    - attemptNumber: attemptCount + 1
    - startTime: Date.now()
    - status: 'in_progress'
  ↓
Response:
  {
    message: 'Attempt started successfully',
    attempt: { _id, user, quiz, startTime, ... },
    quiz: { title, duration, questions[], ... }
  }
  ↓
Frontend (TakeQuiz.jsx):
  • Extract quiz details and questions
  • Display quiz form with timer
  • Track answers in component state
  • Handle automatic timeout after duration
  ↓
Student Submits Quiz
  ↓
  POST /api/attempts/submit { attemptId, answers }
  ↓
Frontend → Backend Request:
  {
    attemptId: ObjectId,
    answers: [
      {
        questionId: index,
        questionText: string,
        userAnswer: string,
        marks: number,
        isCorrect: boolean (calculated frontend)
      }
    ]
  }
  ↓
Backend (attemptController.submitAttempt):
  1. Validate input
  2. Fetch attempt and quiz
  3. Verify attempt exists and belongs to user
  4. For each answer:
     - Find corresponding question
     - Compare userAnswer with correctAnswer
     - Calculate marks (using grading.js utility)
  5. Update Attempt:
    - Set answers array
    - Calculate totalMarks and obtained marks
    - Calculate score percentage
    - Set status: 'submitted'
    - Set submitTime
  6. Trigger grading calculation
  ↓
Database Update:
  Update Attempt {
    answers: [...],
    totalMarks: number,
    obtainedMarks: number,
    scorePercentage: number,
    status: 'submitted',
    submitTime: Date.now()
  }
  ↓
Response:
  {
    message: 'Attempt submitted successfully',
    attempt: {
      _id, status, scorePercentage, obtainedMarks, totalMarks,
      answers: [...]
    },
    feedback: {
      passed: boolean,
      passingScore: number,
      message: string
    }
  }
  ↓
Frontend (Results.jsx):
  • Display score and performance
  • Show correct/incorrect answers
  • Display feedback if available
  • Offer review option (if allowed)
```

### 5.3 Quiz Review Flow

```
Student Clicks "Review"
  ↓
  GET /api/quizzes/:id [with auth]
  ↓
Backend (quizController.getQuizById):
  1. Fetch quiz document
  2. If student and quiz not published → Error
  3. If student and quiz has password → Return without answers initially
  4. Check if student has attempt
  5. Return quiz with appropriate data
  ↓
Response:
  {
    _id, title, description, questions: [
      {
        text, type, options, marks,
        correctAnswer (if allowed), // Hidden for locked quizzes
        explanation (if allowed)
      }
    ],
    ...settings
  }
  ↓
Frontend (ReviewQuiz.jsx):
  • Fetch quiz details
  • Fetch user's attempt
  • Compare user answers with correct answers
  • Display comparison view
```

### 5.4 Analytics Flow

```
Lecturer Views Analytics
  ↓
  GET /api/analytics/overview [lecturer only]
  ↓
Backend (analyticsController.getOverview):
  1. Get total quizzes created by lecturer
  2. Get total students who attempted
  3. Get aggregate statistics
  4. Calculate performance metrics
  ↓
Response:
  {
    totalQuizzes: number,
    totalAttempts: number,
    averageScore: number,
    studentStatistics: [...]
  }
  ↓
  GET /api/analytics/quiz/:quizId [lecturer only]
  ↓
Backend:
  1. Verify lecturer owns this quiz
  2. Get all attempts for this quiz
  3. Calculate:
     - Attempt count
     - Average score
     - Pass rate
     - Most missed questions
     - Time statistics
  ↓
Response:
  {
    quizId, title, totalAttempts, averageScore,
    passRate, questionAnalytics: [...]
  }
```

---

## 6. MIDDLEWARE STACK & REQUEST VALIDATION

### 6.1 Middleware Chain

**Applied in order at server.js:**

```javascript
// Global middleware
app.use(express.json());                    // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cors());                            // CORS headers
app.use(morgan('combined'));                // Request logging
app.use(helmet());                          // Security headers
app.use(mongoSanitize());                   // Prevent NoSQL injection
app.use(express.static('uploads'));         // Serve static files

// Rate limiters
app.use('/api/auth/login', authLimiter);    // 5 attempts / 15 min
app.use('/api/auth/register', authLimiter); // 5 attempts / 15 min
app.use('/api/attempts', attemptLimiter);   // Rate limit attempts

// Route-level middleware
authMiddleware → Applied before protected routes
roleMiddleware → Applied for role-specific routes
validateRequest → Applied per endpoint

// Error handling
app.use((err, req, res, next) => { ... })  // Global error handler
```

### 6.2 Request Validation Middleware

**File:** `backend/middleware/validateRequest.js`

#### Validation Rules Applied

| Validator | Used For | Rules |
|-----------|----------|-------|
| `validateRegister` | POST /auth/register | Name (2-100 chars), Email (valid), Password (complexity), Role, StudentId |
| `validateLogin` | POST /auth/login | Email (required), Password (required) |
| `validateQuizCreate` | POST /quizzes, PUT /quizzes/:id | Title (required), Duration (≥1), Questions (≥1) |
| `validateAttemptSubmit` | POST /attempts/submit | AttemptId (valid MongoDB ID), Answers (array) |
| `validateMongoId` | GET/PUT/DELETE :id routes | MongoDB ObjectId validation |

#### Password Complexity Requirements
```regex
^(?=.*[a-z])       // At least one lowercase
(?=.*[A-Z])        // At least one uppercase
(?=.*\d)           // At least one digit
(?=.*[@$!%*?&#^()_+=\-{}[\]:;"'<>,.~`|\\\/]) // At least one special char
[A-Za-z\d@$!%*?&#^()_+=\-{}[\]:;"'<>,.~`|\\\/]{8,128}$ // 8-128 chars
```

#### Error Response Format
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 6.3 Input Sanitization

**File:** `backend/middleware/sanitizeInput.js`

```javascript
// Applied to prevent XSS and injection attacks
- Trim whitespace
- Escape HTML characters
- Remove potentially dangerous characters
```

---

## 7. REAL-TIME FEATURES (WebSocket)

**File:** `backend/socket/socketServer.js`

### Socket Events Handled

#### Quiz Room Events
```javascript
socket.on('join-quiz', (data) => {
  // User joins quiz room
  // data: { quizId, userId }
})

socket.on('leave-quiz', (data) => {
  // User leaves quiz room
})

socket.on('quiz-progress', (data) => {
  // Broadcast student progress to lecturer
  // data: { quizId, userId, currentQuestion, timeRemaining }
})

socket.on('quiz-submitted', (data) => {
  // Notify when quiz is submitted
  // data: { quizId, userId, score }
})

socket.on('disconnect', () => {
  // Handle user disconnect
})
```

#### Notification Events
```javascript
socket.on('subscribe-notifications', (data) => {
  // User subscribes to notifications
  // data: { userId, type }
})

socket.on('mark-read', (data) => {
  // Mark notification as read
  // data: { notificationId }
})
```

### CORS Configuration
```javascript
socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
})
```

---

## 8. ERROR HANDLING STRATEGY

### 8.1 Global Error Handler

**File:** `backend/server.js`

```javascript
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
```

### 8.2 HTTP Status Codes Used

| Status | Usage |
|--------|-------|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Bad request / Validation error |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Server error |

### 8.3 Frontend Error Handling

**File:** `frontend/src/services/api.js`

```javascript
// Automatic redirect to login on 401
if (error.response?.status === 401) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}
```

---

## 9. DATA MODEL RELATIONSHIPS

### User Model

```javascript
{
  _id: ObjectId,
  name: string (2-100 chars),
  email: string (unique, lowercase),
  password: string (hashed),
  role: enum ['student', 'lecturer'],
  studentId: string (sparse, unique),
  createdAt: Date
}
```

**Relationships:**
- Quiz.createdBy → User._id
- Attempt.user → User._id

### Quiz Model

```javascript
{
  _id: ObjectId,
  title: string (required),
  description: string,
  createdBy: ObjectId (ref: User),
  duration: number (minutes, ≥1),
  maxAttempts: number (default: 1),
  questions: [
    {
      text: string,
      type: enum ['mcq', 'true_false', 'short_answer'],
      options: string[],
      correctAnswer: string,
      marks: number,
      explanation: string
    }
  ],
  isPublished: boolean (default: false),
  password: string (optional, for locked quizzes),
  hasPassword: boolean,
  allowReview: boolean (default: true),
  showCorrectAnswers: boolean (default: false),
  randomizeQuestions: boolean,
  randomizeOptions: boolean,
  passingScore: number (default: 50),
  scheduledPublish: Date,
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- createdBy → User._id
- Referenced by Attempt.quiz → Quiz._id

### Attempt Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  quiz: ObjectId (ref: Quiz),
  attemptNumber: number,
  status: enum ['in_progress', 'submitted', 'timeout'],
  answers: [
    {
      questionId: number (array index),
      questionText: string,
      userAnswer: string,
      marks: number,
      isCorrect: boolean
    }
  ],
  totalMarks: number (calculated from quiz),
  obtainedMarks: number (calculated),
  scorePercentage: number,
  startTime: Date,
  submitTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- user → User._id
- quiz → Quiz._id

### Data Flow Diagram

```
User
  ├── Creates → Quiz (via POST /quizzes)
  ├── Publishes → Quiz (via PATCH /quizzes/:id/publish)
  ├── Takes → Quiz (creates Attempt via POST /attempts/start)
  └── Submits → Attempt (via POST /attempts/submit)

Quiz
  ├── Contains → Questions[] (part of quiz document)
  ├── HasMany → Attempts (one quiz can have many attempts)
  └── CreatedBy → User

Attempt
  ├── References → Quiz (one quiz per attempt)
  ├── References → User (one user per attempt)
  └── Contains → Answers[] (array of answer objects)
```

---

## 10. AUTHENTICATION TOKEN LIFECYCLE

### Token Generation

```javascript
generateToken(userId) {
  return jwt.sign(
    {
      userId,                          // User ID
      iat: Math.floor(Date.now() / 1000),  // Issued at
      type: 'access'                   // Token type
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }               // Default 1 hour
  )
}

generateRefreshToken(userId) {
  return jwt.sign(
    {
      userId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }               // 7 days
  )
}
```

### Token Validation

```javascript
// In authMiddleware
1. Extract from "Authorization: Bearer <token>"
2. jwt.verify(token, JWT_SECRET)
3. Check token.type === 'access'
4. Look up user in database
5. Attach to req.user
```

### Token Expiration Flow

```
Access Token Expires (1h)
  ↓
Frontend detects 401 response
  ↓
Option 1: POST /api/auth/refresh (with refresh token)
  ├── Backend verifies refresh token
  ├── Issues new access token
  └── Frontend retries original request

Option 2: No refresh token valid
  ├── Redirect to /login
  ├── Clear localStorage
  └── User must re-authenticate
```

---

## 11. SECURITY ANALYSIS

### ✅ Implemented Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing (bcrypt with 10 salt rounds)
   - Token type validation (access vs refresh)
   - HTTP-only cookies for refresh token

2. **Authorization**
   - Role-based middleware (authMiddleware + roleMiddleware)
   - Owner verification for quiz and attempt data
   - Resource-level access checks

3. **Input Validation**
   - Email format validation
   - Password complexity requirements
   - MongoDB ID validation
   - Field length restrictions
   - Type validation for enums

4. **Rate Limiting**
   - Login/register: 5 attempts per 15 minutes
   - Attempt submission rate limited

5. **Data Protection**
   - Password field excluded from queries (.select('-password'))
   - Correct answers not returned to non-owners
   - Student data isolated by ownership

6. **CORS & Headers**
   - Helmet.js for security headers
   - CORS configured for specific origin

7. **Input Sanitization**
   - NoSQL injection prevention (mongoSanitize)
   - HTML escape in input
   - Trim and validation

### ⚠️ Security Considerations / Recommendations

1. **Token Storage**
   - Current: localStorage (vulnerable to XSS)
   - Recommendation: Consider storing access token in memory + refresh token in httpOnly cookie
   - Trade-off: Requires more complex implementation but better security

2. **HTTPS Enforcement**
   - Ensure NODE_ENV=production forces secure cookies
   - Verify deployment uses HTTPS

3. **CSRF Protection**
   - Implement CSRF tokens if using standard cookies
   - Current socket.io CORS might need CSRF token validation

4. **API Rate Limiting**
   - Current: Only on /auth/* and /attempts
   - Recommendation: Extend to all routes to prevent abuse

5. **Sensitive Data in Logs**
   - Ensure tokens/passwords never logged
   - Current logging appears safe but verify with grep: `console.log`

6. **MongoDB Injection**
   - mongoSanitize applied (good)
   - Verify all user inputs go through it

7. **Database Connection**
   - Ensure MONGODB_URI uses authentication in production
   - Connection pooling configured

### 🔒 Security Audit Checklist

- [x] Authentication implemented
- [x] Authorization/RBAC implemented
- [x] Input validation applied
- [x] Rate limiting on auth endpoints
- [x] Password hashing (bcrypt)
- [x] CORS configured
- [x] Security headers (Helmet)
- [x] NoSQL injection prevention
- [ ] Comprehensive rate limiting on all endpoints
- [ ] HTTPS enforcement documented
- [ ] CSRF protection (if needed for cookies)
- [ ] Audit logging for sensitive operations

---

## 12. IDENTIFIED ISSUES & RECOMMENDATIONS

### 🟢 Working Correctly

1. ✅ **Route Specificity:** Quiz routes properly ordered (specific before generic)
2. ✅ **Authentication:** JWT implementation is solid with proper validation
3. ✅ **RBAC:** Role-based middleware correctly prevents unauthorized access
4. ✅ **Error Handling:** Global error handler catches all errors
5. ✅ **Validation:** Comprehensive input validation on auth and quiz endpoints
6. ✅ **Protected Routes:** Frontend routes properly guard against unauthorized access
7. ✅ **Token Management:** Proper token generation, verification, and expiration
8. ✅ **Database Schema:** Well-structured with proper relationships

### 🟡 Minor Recommendations

1. **Rate Limiting Coverage**
   - Current: `/api/auth/*` and `/api/attempts`
   - Recommend: Add limits to `/api/quizzes` and `/api/analytics`
   - Purpose: Prevent scraping/DOS on other endpoints

2. **Error Message Specificity**
   - Current: "Quiz not found" vs "You don't have permission"
   - Better practice: Use generic messages to prevent information leakage
   - Recommendation: Return same error for "not found" vs "no permission"

3. **Attempt Validation**
   - Recommendation: Validate attempt duration server-side
   - Currently: Client-side timer + timeout endpoint
   - Add: Server-side timeout validation on submit

4. **Question Answer Comparison**
   - Current: String comparison (case-sensitive)
   - Recommendation: Make case-insensitive or normalize answers
   - Especially for short_answer and true_false types

5. **Activity Logging**
   - Recommendation: Add audit logs for:
     - Quiz creation/deletion
     - Attempt submissions
     - User logins
   - Purpose: Accountability and fraud detection

6. **Password Reset**
   - Current: No password reset flow implemented
   - Recommendation: Add `/api/auth/forgot-password` endpoint
   - Include email verification

### 🔴 Critical Issues Found

**None detected** - System architecture is sound.

### 🟠 Potential Improvements

1. **Attempt Resumption**
   - Behavior: Student can resume incomplete attempt
   - Add option to discard and start fresh

2. **Quiz Duplication**
   - Feature exists: `POST /quizzes/:id/duplicate`
   - Ensure UI exposes this feature

3. **Analytics Performance**
   - Recommendation: Add database indexes on:
     - `Attempt.user`
     - `Attempt.quiz`
     - `Attempt.status`
   - Purpose: Improve analytics query performance

4. **Notification System**
   - Current: Socket.io structure in place
   - Recommendation: Implement database persistence of notifications
   - Currently appears to be real-time only

---

## 13. DATA VALIDATION MATRIX

### Request Validation Coverage

| Endpoint | Method | Validation | Status |
|----------|--------|-----------|--------|
| /auth/register | POST | ✅ Full validation | ✅ |
| /auth/login | POST | ✅ Email, password required | ✅ |
| /quizzes | POST | ✅ Quiz and questions validated | ✅ |
| /quizzes/:id | PUT | ✅ Quiz and questions validated | ✅ |
| /quizzes/:id | DELETE | ✅ MongoDB ID validated | ✅ |
| /quizzes/:id | GET | ✅ MongoDB ID validated | ✅ |
| /attempts/start | POST | ⚠️ Only quizId required | ✅ |
| /attempts/submit | POST | ✅ AttemptId and answers validated | ✅ |
| /attempts/:id | GET | ✅ MongoDB ID validated | ✅ |
| /analytics/* | GET | ✅ MongoDB ID validated | ✅ |

### Frontend Validation Coverage

| Page | Input Validation | Status |
|------|------------------|--------|
| Login | Email, password format | ✅ |
| Register | All auth fields | ✅ |
| Create Quiz | Title, questions, duration | ✅ |
| Take Quiz | Time tracking, answer validation | ✅ |
| Profile | User data fields | ✅ |

---

## 14. ROUTING SUMMARY TABLE

### Complete API Endpoint Reference

```
┌─────────────────────────────────────────────────────────────┐
│ AUTHENTICATION ROUTES                                       │
├──────┬──────────────┬───────────────────┬──────────────────┤
│ TYPE │ ENDPOINT     │ AUTH REQUIRED     │ BODY/PARAMS      │
├──────┼──────────────┼───────────────────┼──────────────────┤
│ POST │ /auth/login  │ No                │ email, password  │
│ POST │ /auth/register│ No               │ name, email, ... │
│ GET  │ /auth/me     │ Yes (Bearer)      │ -                │
│ POST │ /auth/refresh│ No (Cookie)       │ -                │
│ POST │ /auth/logout │ Yes (Bearer)      │ -                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ QUIZ ROUTES                                                 │
├──────┬─────────────────────────┬──────────┬────────────────┤
│ TYPE │ ENDPOINT                │ ROLE     │ DESCRIPTION    │
├──────┼─────────────────────────┼──────────┼────────────────┤
│ POST │ /quizzes                │ Lecturer │ Create quiz    │
│ GET  │ /quizzes/lecturer       │ Lecturer │ My quizzes     │
│ GET  │ /quizzes/available      │ Both     │ Available quiz │
│ GET  │ /quizzes/:id            │ Both     │ Quiz details   │
│ PUT  │ /quizzes/:id            │ Lecturer │ Update quiz    │
│ DEL  │ /quizzes/:id            │ Lecturer │ Delete quiz    │
│ PATCH│ /quizzes/:id/publish    │ Lecturer │ Toggle publish │
│ GET  │ /quizzes/:id/results    │ Lecturer │ Quiz results   │
│ POST │ /quizzes/:id/duplicate  │ Lecturer │ Copy quiz      │
│ POST │ /quizzes/:id/verify-pwd │ Both     │ Verify pwd     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ATTEMPT ROUTES                                              │
├──────┬──────────────────────┬─────────┬────────────────────┤
│ TYPE │ ENDPOINT             │ AUTH    │ DESCRIPTION        │
├──────┼──────────────────────┼─────────┼────────────────────┤
│ POST │ /attempts/start      │ Bearer  │ Start attempt      │
│ POST │ /attempts/submit     │ Bearer  │ Submit answers     │
│ POST │ /attempts/timeout    │ Bearer  │ Handle timeout     │
│ GET  │ /attempts/user       │ Bearer  │ User's attempts    │
│ GET  │ /attempts/:id        │ Bearer  │ Attempt details    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ANALYTICS ROUTES (Lecturer Only)                            │
├──────┬──────────────────────────┬─────┬────────────────────┤
│ TYPE │ ENDPOINT                 │ ID  │ DESCRIPTION        │
├──────┼──────────────────────────┼─────┼────────────────────┤
│ GET  │ /analytics/overview      │ -   │ Overview stats     │
│ GET  │ /analytics/quiz/:quizId  │ ✅  │ Quiz analytics     │
│ GET  │ /analytics/student/:id   │ ✅  │ Student analytics  │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. FLOW DIAGRAMS

### 15.1 Complete User Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ REGISTRATION FLOW                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User fills registration form                               │
│        ↓                                                     │
│  Frontend validates input (client-side)                     │
│        ↓                                                     │
│  POST /api/auth/register { name, email, pwd, role, id }    │
│        ↓                                                     │
│  Backend Rate Limiter: 5 req/15min (✅ pass)                │
│        ↓                                                     │
│  Middleware: validateRegister (all fields checked)          │
│        ↓                                                     │
│  Check: Email not already registered                        │
│        ✓ Available → Continue                               │
│        ✗ Exists → Return 400 "User already exists"          │
│        ↓                                                     │
│  Hash password with bcrypt (10 rounds)                      │
│        ↓                                                     │
│  Create User document in MongoDB                            │
│        ↓                                                     │
│  Generate JWT Access Token (exp: 1h)                        │
│        ↓                                                     │
│  Generate Refresh Token (exp: 7d, httpOnly cookie)          │
│        ↓                                                     │
│  Response 201:                                              │
│  { user: {...}, token: "JWT", expiresIn: "1h" }            │
│        ↓                                                     │
│  Frontend saves token & user to localStorage                │
│        ↓                                                     │
│  Redirect to appropriate dashboard                          │
│                                                              │
│  LOGIN FLOW                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User enters email & password                               │
│        ↓                                                     │
│  POST /api/auth/login { email, password }                   │
│        ↓                                                     │
│  Backend Rate Limiter: 5 req/15min                          │
│        ├─ First 5 attempts → 200 OK                         │
│        └─ 6th attempt → 429 "Too many requests"             │
│        ↓                                                     │
│  Middleware: validateLogin                                  │
│        ↓                                                     │
│  Query: User.findOne({ email })                             │
│        ✓ Found → Continue                                   │
│        ✗ Not found → 401 "Invalid credentials"              │
│        ↓                                                     │
│  Compare password with hash: bcrypt.compare()               │
│        ✓ Match → Continue                                   │
│        ✗ No match → 401 "Invalid credentials"               │
│        ↓                                                     │
│  Generate Access & Refresh tokens (same as registration)   │
│        ↓                                                     │
│  Response 200:                                              │
│  { user: {...}, token: "JWT", expiresIn: "1h" }            │
│        ↓                                                     │
│  Frontend stores and redirects                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 15.2 Protected API Request Flow

```
┌────────────────────────────────────────────────────────────┐
│ PROTECTED API REQUEST (Any /api endpoint with auth)         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend API Service (api.js)                             │
│        ↓                                                    │
│  Request Interceptor:                                      │
│  Get token from localStorage                               │
│  Add header: "Authorization: Bearer {token}"               │
│        ↓                                                    │
│  Backend receives request                                  │
│        ↓                                                    │
│  Express middleware chain:                                 │
│  1. Global middleware (cors, helmet, etc.)                 │
│  2. authMiddleware:                                        │
│     ├─ Extract token from Authorization header             │
│     ├─ jwt.verify(token, JWT_SECRET)                       │
│     ├─ Token type === 'access'? ✅                         │
│     ├─ User exists in DB? ✅                               │
│     └─ Attach user to req.user                             │
│  3. roleMiddleware (if applicable):                        │
│     └─ Check req.user.role in allowed roles                │
│  4. Validation middleware                                  │
│  5. Route handler (controller)                             │
│        ↓                                                    │
│  Response sent back to frontend                            │
│        ↓                                                    │
│  Response Interceptor (api.js):                            │
│  If status 401 (token expired):                            │
│  ├─ Clear localStorage                                     │
│  ├─ Redirect to /login                                     │
│  └─ Return error                                           │
│        ↓                                                    │
│  Frontend handles error/success                            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 15.3 Quiz Attempt Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│ QUIZ ATTEMPT COMPLETE FLOW                                 │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ PHASE 1: VIEWING AVAILABLE QUIZZES                         │
│ ─────────────────────────────────────────────────────────  │
│  GET /api/quizzes/available [student]                      │
│        ↓                                                    │
│  Backend:                                                  │
│  1. Find all published quizzes                             │
│  2. Return with masked answers                             │
│  3. Include maxAttempts & deadline info                    │
│        ↓                                                    │
│  Frontend: Display quiz list                               │
│                                                             │
│ PHASE 2: STARTING ATTEMPT                                 │
│ ─────────────────────────────────────────────────────────  │
│  Student clicks "Start Quiz"                               │
│        ↓                                                    │
│  POST /api/attempts/start { quizId }                       │
│        ↓                                                    │
│  Backend validation:                                       │
│  1. Quiz exists? ✓                                         │
│  2. Quiz published? ✓                                      │
│  3. Attempts remaining? Check attemptCount < maxAttempts   │
│     ✓ Yes → Continue                                       │
│     ✗ No → 403 "Maximum attempts reached"                  │
│  4. Resume existing? Check in_progress attempt             │
│     ✓ Found → Return existing (resume)                     │
│     ✗ Not found → Create new                               │
│        ↓                                                    │
│  Create Attempt document:                                  │
│  {                                                         │
│    user: userId,                                           │
│    quiz: quizId,                                           │
│    attemptNumber: 2,                                       │
│    startTime: now(),                                       │
│    status: 'in_progress'                                   │
│  }                                                         │
│        ↓                                                    │
│  Response:                                                 │
│  {                                                         │
│    attempt: { _id, startTime, ... },                       │
│    quiz: { title, duration, questions[], ... }             │
│  }                                                         │
│        ↓                                                    │
│  Frontend (TakeQuiz.jsx):                                  │
│  1. Extract quiz questions                                 │
│  2. Start timer (duration in minutes)                      │
│  3. Display questions with answer fields                   │
│  4. Track answers in state                                 │
│                                                             │
│ PHASE 3: DURING QUIZ                                       │
│ ─────────────────────────────────────────────────────────  │
│  WebSocket: join-quiz event (real-time tracking)           │
│  - Send progress updates                                   │
│  - Receive live updates from lecturer                      │
│        ↓                                                    │
│  Timer runs down:                                          │
│  - 1 minute warning                                        │
│  - Auto-submit if time expires                             │
│  - Can also click Submit button                            │
│                                                             │
│ PHASE 4: SUBMITTING ATTEMPT                                │
│ ─────────────────────────────────────────────────────────  │
│  Student clicks "Submit Quiz"                              │
│        ↓                                                    │
│  Frontend builds submission:                               │
│  POST /api/attempts/submit {                               │
│    attemptId: "xxx",                                       │
│    answers: [                                              │
│      { questionId: 0, userAnswer: "B", marks: 1, ... },    │
│      { questionId: 1, userAnswer: "True", marks: 1, ... }  │
│    ]                                                       │
│  }                                                         │
│        ↓                                                    │
│  Backend Validation:                                       │
│  1. AttemptId valid MongoDB ID? ✓                          │
│  2. Answers is array? ✓                                    │
│  3. Attempt exists and belongs to user? ✓                  │
│        ↓                                                    │
│  Grading Logic:                                            │
│  For each answer:                                          │
│    - Compare userAnswer with quiz.correctAnswer            │
│    - Calculate marks (0 or full marks for MCQ)             │
│    - Store in attempt.answers[]                            │
│        ↓                                                    │
│  Calculate totals:                                         │
│  - totalMarks = sum of all question marks                  │
│  - obtainedMarks = sum of correct answer marks             │
│  - scorePercentage = (obtainedMarks/totalMarks) * 100      │
│  - passed = scorePercentage >= passingScore                │
│        ↓                                                    │
│  Update Attempt:                                           │
│  {                                                         │
│    status: 'submitted',                                    │
│    submitTime: now(),                                      │
│    answers: [...],                                         │
│    obtainedMarks: 45,                                      │
│    totalMarks: 50,                                         │
│    scorePercentage: 90                                     │
│  }                                                         │
│        ↓                                                    │
│  Response 200:                                             │
│  {                                                         │
│    message: "Submitted successfully",                      │
│    attempt: { ... },                                       │
│    feedback: {                                             │
│      passed: true,                                         │
│      passingScore: 50,                                     │
│      message: "You passed!"                                │
│    }                                                       │
│  }                                                         │
│        ↓                                                    │
│  WebSocket: quiz-submitted event                           │
│  - Notify lecturer of submission                           │
│  - Update real-time dashboard                              │
│        ↓                                                    │
│  Frontend:                                                 │
│  - Navigate to Results page                                │
│  - Display score & feedback                                │
│  - Show option to review if allowed                        │
│                                                             │
│ PHASE 5: REVIEWING RESULTS                                 │
│ ─────────────────────────────────────────────────────────  │
│  Optional: Student clicks "Review"                         │
│        ↓                                                    │
│  Frontend combines:                                        │
│  1. Quiz questions (GET /api/quizzes/:id)                  │
│  2. User's answers (GET /api/attempts/:id)                 │
│        ↓                                                    │
│  Display side-by-side:                                     │
│  - Question, options                                       │
│  - Correct answer (if quiz allows)                         │
│  - Your answer (highlight if incorrect)                    │
│  - Explanation (if provided)                               │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 16. ENVIRONMENT & CONFIGURATION

### Required Environment Variables

**Backend** (`.env`)
```
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/assessment_db

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
CLOUDINARY_NAME=xxx
CLOUDINARY_KEY=xxx
CLOUDINARY_SECRET=xxx

# Email (optional)
SMTP_USER=xxx
SMTP_PASS=xxx
```

**Frontend** (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 17. DEPLOYMENT CHECKLIST

- [ ] MongoDB Atlas configured with authentication
- [ ] All environment variables set in production
- [ ] JWT_SECRET and JWT_REFRESH_SECRET are strong (32+ chars)
- [ ] HTTPS enforced in production
- [ ] Secure cookies enabled (sameSite, secure flags)
- [ ] CORS origin set to actual frontend domain
- [ ] Rate limiting adjusted for production traffic
- [ ] Error handling doesn't expose sensitive info
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] SSL certificates valid
- [ ] Cloudinary credentials secured

---

## 18. SUMMARY STATISTICS

| Metric | Count |
|--------|-------|
| **Frontend Routes** | 9 |
| **Backend API Endpoints** | 20+ |
| **Authentication Methods** | 2 (JWT access + refresh) |
| **User Roles** | 2 (student, lecturer) |
| **Data Models** | 4 (User, Quiz, Attempt, Question) |
| **Middleware Functions** | 6+ |
| **Socket.io Events** | 6+ |
| **Validation Rules** | 30+ |
| **Rate Limit Rules** | 2+ |

---

## 19. QUICK REFERENCE

### Most Common Flows

**Student Taking Quiz:**
```
1. GET /api/quizzes/available → See available quizzes
2. POST /api/attempts/start → Start quiz
3. POST /api/attempts/submit → Submit answers
4. GET /api/quizzes/:id + GET /api/attempts/:id → Review
```

**Lecturer Creating Quiz:**
```
1. POST /api/quizzes → Create quiz
2. PUT /api/quizzes/:id → Edit quiz
3. PATCH /api/quizzes/:id/publish → Publish
4. GET /api/analytics/* → View results
```

**Authentication:**
```
1. POST /api/auth/register → Sign up
2. POST /api/auth/login → Sign in
3. POST /api/auth/refresh → Refresh token
4. POST /api/auth/logout → Sign out
```

---

## 20. CONCLUSION

The Student Assessment System has a well-architected routing and flow structure:

### ✅ Strengths
- Clear role-based access control
- Proper authentication with JWT
- Good input validation and error handling
- RESTful API design
- Real-time capabilities with Socket.io
- Middleware-based architecture

### 🎯 Key Security Points
- Passwords securely hashed
- Tokens validated on every request
- Role checks prevent unauthorized access
- Input sanitization applied
- Rate limiting on sensitive endpoints

### 📈 Areas for Enhancement
- Expand rate limiting to all endpoints
- Add activity logging for audit trails
- Implement password reset flow
- Server-side attempt duration validation
- Database indexing for analytics queries

**Overall Assessment:** ✅ **PRODUCTION-READY** with minor enhancements recommended.

---

**End of Audit Report**

Generated with comprehensive analysis of:
- ✅ Frontend routing (`App.jsx` + Pages)
- ✅ Backend routes (5 route files)
- ✅ Authentication system (JWT + RBAC)
- ✅ Middleware & validation
- ✅ WebSocket real-time features
- ✅ Data models & relationships
- ✅ Error handling strategy
- ✅ Security measures
