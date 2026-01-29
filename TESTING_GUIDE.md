# Student Assessment System - Test Guide

## 📝 Test Accounts

### Create Test Accounts via Signup Page

1. **Test Student Account**
   - Name: John Student
   - Email: student@test.com
   - Password: student123
   - Role: Student
   - Student ID: S123456

2. **Test Lecturer Account**
   - Name: Dr. Jane Lecturer
   - Email: lecturer@test.com
   - Password: lecturer123
   - Role: Lecturer
   - Student ID: (leave empty)

## 🧪 Testing Checklist

### 1. Authentication Tests

#### Login Page (http://localhost:5173/)
- [ ] Page loads with professional gradient background
- [ ] Animated floating orbs visible in background
- [ ] Logo icon displays correctly
- [ ] Form has email and password fields
- [ ] Password visibility toggle (eye icon) works
- [ ] "Forgot password?" link is visible
- [ ] "Sign Up" toggle button works
- [ ] Error messages display with shake animation
- [ ] Loading spinner shows during login
- [ ] Demo credentials text is visible

#### Signup Page (toggle from login)
- [ ] Toggle to signup works smoothly
- [ ] Full Name field appears
- [ ] Role dropdown appears (Student/Lecturer)
- [ ] Student ID field appears when Student is selected
- [ ] Student ID field hides when Lecturer is selected
- [ ] Password strength indicator shows
- [ ] Password strength updates in real-time (colors: red→orange→yellow→blue→green)
- [ ] All fields have hover effects
- [ ] Icons change color on input focus
- [ ] "Sign In" toggle button works

### 2. Student Dashboard Tests

#### After Login as Student (student@test.com)
- [ ] Redirects to student dashboard
- [ ] Student name displays in header
- [ ] "Available Quizzes" section loads
- [ ] Quiz cards display correctly
- [ ] Quiz details show (title, description, duration, questions)
- [ ] "Start Quiz" button is enabled/disabled correctly
- [ ] Attempt counter shows remaining attempts
- [ ] Password-protected quizzes show lock icon
- [ ] Completed quizzes show scores

#### Quiz Taking Flow
- [ ] Click "Start Quiz" opens quiz page
- [ ] Timer starts and counts down
- [ ] Questions display correctly
- [ ] MCQ options are selectable
- [ ] True/False questions work
- [ ] Short answer text input works
- [ ] "Next Question" button works
- [ ] "Previous Question" button works
- [ ] Question navigation works
- [ ] "Submit Quiz" button shows confirmation
- [ ] Quiz submits successfully
- [ ] Results page displays score
- [ ] Can review answers if allowed
- [ ] Correct answers shown if enabled by lecturer

#### Password-Protected Quiz
- [ ] Click quiz with lock icon
- [ ] Password modal appears
- [ ] Can enter password
- [ ] Correct password grants access
- [ ] Incorrect password shows error
- [ ] Cancel button closes modal

### 3. Lecturer Dashboard Tests

#### After Login as Lecturer (lecturer@test.com)
- [ ] Redirects to lecturer dashboard
- [ ] Lecturer name displays
- [ ] Statistics cards display (Total Quizzes, Students, Avg Score, Questions)
- [ ] Stats show correct numbers
- [ ] Cards have hover effects

#### Tab Navigation
- [ ] "My Quizzes" tab is active by default
- [ ] "Students" tab clickable
- [ ] "Analytics" tab clickable
- [ ] Tab switching works smoothly
- [ ] Active tab highlighted correctly

#### My Quizzes Tab
- [ ] "Create New Quiz" button visible in header
- [ ] Quiz cards display with all details
- [ ] Published/Draft badges show correctly
- [ ] Password protected badge shows when applicable
- [ ] Each quiz shows: title, description, duration, questions, students, avg score
- [ ] Action buttons present: Edit, Publish/Unpublish, Duplicate, Analytics, Delete

#### Create Quiz (Click "Create New Quiz")
- [ ] Modal opens with smooth animation
- [ ] Three tabs visible: Basic Info, Settings, Questions
- [ ] Basic Info tab:
  - [ ] Title input works
  - [ ] Description textarea works
  - [ ] Duration number input works
  - [ ] Max Attempts input works
  - [ ] Passing Score slider/input works (0-100%)
  - [ ] Scheduled Publish date picker works
  - [ ] Deadline date picker works
- [ ] Settings tab:
  - [ ] Password toggle switch works
  - [ ] Password input shows when enabled
  - [ ] "Allow Review" checkbox works
  - [ ] "Show Correct Answers" checkbox works
  - [ ] "Randomize Questions" checkbox works
  - [ ] "Randomize Options" checkbox works
  - [ ] "Published" toggle works
- [ ] Questions tab:
  - [ ] "Add Question" button works
  - [ ] Question type selector works (MCQ, True/False, Short Answer)
  - [ ] Question text input works
  - [ ] Marks input works
  - [ ] Explanation textarea works
  - [ ] For MCQ: Can add/remove options
  - [ ] For MCQ: Can mark correct answer
  - [ ] For True/False: Can select correct answer
  - [ ] Delete question button works
  - [ ] Question list updates correctly
- [ ] Save Quiz button works
- [ ] Cancel/Close button works
- [ ] Form validation shows errors

#### Edit Quiz
- [ ] Click "Edit" button on quiz
- [ ] Modal opens with quiz data pre-filled
- [ ] All fields editable
- [ ] Can modify questions
- [ ] Can add new questions
- [ ] Can delete existing questions
- [ ] Save Changes works
- [ ] Changes persist after save

#### Publish/Unpublish Quiz
- [ ] Click "Publish" on draft quiz
- [ ] Quiz status changes to Published
- [ ] Badge updates to green
- [ ] Button changes to "Unpublish"
- [ ] Click "Unpublish" reverts status
- [ ] Published quizzes visible to students

#### Duplicate Quiz
- [ ] Click "Duplicate" button
- [ ] New quiz created with "(Copy)" suffix
- [ ] New quiz is draft by default
- [ ] All settings copied
- [ ] All questions copied
- [ ] Original quiz unchanged

#### Delete Quiz
- [ ] Click "Delete" button
- [ ] Confirmation dialog appears
- [ ] Cancel keeps quiz
- [ ] Confirm deletes quiz
- [ ] Quiz removed from list
- [ ] No errors occur

#### Students Tab
- [ ] Tab loads student management component
- [ ] Search bar visible
- [ ] Status filter dropdown works (All, Active, Inactive)
- [ ] Statistics cards display:
  - [ ] Total Students count
  - [ ] Active Students count
  - [ ] Average Score
  - [ ] Total Attempts
- [ ] Student table displays
- [ ] Table columns: Student (avatar+name), Email, Student ID, Quizzes Taken, Avg Score, Last Active, Status, Actions
- [ ] Avatar images show or placeholder
- [ ] Progress bars show for scores
- [ ] Status badges color-coded
- [ ] "View Analytics" button works
- [ ] "Send Email" button works
- [ ] Search filters table in real-time

#### Analytics Tab
- [ ] Tab loads (shows "Coming Soon" message currently)
- [ ] Placeholder message displays correctly

### 4. Navigation Tests

#### Header Navigation
- [ ] Logo/Brand name visible
- [ ] User dropdown menu works
- [ ] "Profile" link in dropdown
- [ ] "Settings" link in dropdown
- [ ] "Logout" button works
- [ ] Logout clears session
- [ ] Logout redirects to login page

#### Sidebar Navigation (if applicable)
- [ ] All menu items clickable
- [ ] Active page highlighted
- [ ] Icons display correctly
- [ ] Smooth transitions

### 5. Responsive Design Tests

#### Desktop (1920px)
- [ ] Layout looks professional
- [ ] No horizontal scroll
- [ ] All elements properly spaced
- [ ] Cards in proper grid

#### Laptop (1366px)
- [ ] Layout adapts correctly
- [ ] Quiz cards resize appropriately
- [ ] Modal width appropriate

#### Tablet (768px)
- [ ] Mobile menu appears
- [ ] Cards stack vertically
- [ ] Modal responsive
- [ ] Forms still usable

#### Mobile (375px)
- [ ] Hamburger menu works
- [ ] All content accessible
- [ ] Forms fit screen
- [ ] Buttons touchable
- [ ] No text cutoff

### 6. Performance Tests

- [ ] Page loads in < 3 seconds
- [ ] Smooth animations (no lag)
- [ ] Quiz timer accurate
- [ ] No console errors
- [ ] Images load properly
- [ ] API calls complete successfully

### 7. Error Handling Tests

#### Invalid Login
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Empty fields show validation errors
- [ ] Error messages clear on retry

#### Network Errors
- [ ] Handles API timeout gracefully
- [ ] Shows appropriate error messages
- [ ] Allows retry

#### Form Validation
- [ ] Email validation works
- [ ] Password minimum length enforced (6 chars)
- [ ] Required fields validated
- [ ] Student ID validated for students

### 8. Data Persistence Tests

- [ ] Login persists on page refresh
- [ ] Quiz progress saves
- [ ] User preferences saved
- [ ] Draft quizzes saved
- [ ] Student answers autosaved

### 9. Security Tests

- [ ] Cannot access lecturer pages as student
- [ ] Cannot access student pages as lecturer
- [ ] Password hidden by default
- [ ] JWT token stored securely
- [ ] Protected routes redirect to login
- [ ] Quiz passwords encrypted

### 10. Accessibility Tests

- [ ] All buttons have proper labels
- [ ] Form fields have labels
- [ ] Color contrast sufficient
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader friendly

## 🐛 Known Issues to Check

1. Check if EnhancedLecturerDashboard is properly routed
2. Verify quiz service API calls work
3. Check if student management loads real data
4. Verify socket.io connection for real-time updates
5. Check if quiz randomization works correctly
6. Verify password protection on quiz attempts
7. Check if review settings are respected
8. Verify scheduled publish works
9. Check if deadline enforcement works

## 📊 Expected Results

### After All Tests Pass:
- ✅ All buttons clickable and functional
- ✅ All links navigate correctly
- ✅ All forms submit successfully
- ✅ All animations smooth
- ✅ No console errors
- ✅ Data persists correctly
- ✅ User experience seamless

## 🚀 Quick Test Commands

```bash
# Start backend
cd backend
npm start

# Start frontend (new terminal)
cd frontend
npm run dev

# Access application
http://localhost:5173
```

## 📝 Test Report Template

Date: _______
Tester: _______

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ☐ Pass ☐ Fail | |
| Signup | ☐ Pass ☐ Fail | |
| Student Dashboard | ☐ Pass ☐ Fail | |
| Lecturer Dashboard | ☐ Pass ☐ Fail | |
| Quiz Creation | ☐ Pass ☐ Fail | |
| Quiz Taking | ☐ Pass ☐ Fail | |
| Student Management | ☐ Pass ☐ Fail | |
| Navigation | ☐ Pass ☐ Fail | |
| Responsive Design | ☐ Pass ☐ Fail | |

Overall Status: ☐ All Pass ☐ Some Fail
