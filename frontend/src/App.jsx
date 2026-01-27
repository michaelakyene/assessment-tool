import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import LecturerDashboard from './pages/LecturerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import TakeQuiz from './pages/TakeQuiz'
import Results from './pages/Results'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={
            user ? (
              user.role === 'lecturer' ? 
                <LecturerDashboard /> : 
                <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="/quiz/:id" element={
            user ? <TakeQuiz /> : <Navigate to="/login" />
          } />
          <Route path="/results/:attemptId" element={
            user ? <Results /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App