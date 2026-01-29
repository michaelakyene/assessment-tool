import { Link, useNavigate } from 'react-router-dom'
import { FiLogOut, FiHome, FiUser, FiBell, FiSettings } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import Notifications from './realtime/Notifications'

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate()
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const settingsRef = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsMenu(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-lg group-hover:shadow-md transition-shadow">
                <FiHome className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gradient">
                QuizMaster
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              <Link 
                to="/" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              {user.role === 'lecturer' && (
                <button
                  onClick={() => navigate('/create-quiz')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Create Quiz
                </button>
              )}
              {user.role === 'student' && (
                <>
                  <Link 
                    to="/" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Available Quizzes
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Notifications />
            
            <div className="relative" ref={settingsRef}>
              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              
              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Settings</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/')
                        setShowSettingsMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FiHome className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    {user.role === 'lecturer' && (
                      <button
                        onClick={() => {
                          navigate('/create-quiz')
                          setShowSettingsMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Create New Quiz</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false)
                        logout()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-gray-100"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowProfileMenu(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-colors"
                    >
                      <FiUser className="w-4 h-4" />
                      <span className="font-medium">Edit Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/')
                        setShowProfileMenu(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-colors"
                    >
                      <FiHome className="w-4 h-4" />
                      <span className="font-medium">Dashboard</span>
                    </button>
                    
                    {user.role === 'lecturer' && (
                      <button
                        onClick={() => {
                          navigate('/create-quiz')
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span className="font-medium">Create Quiz</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        setShowSettingsMenu(!showSettingsMenu)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-colors"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span className="font-medium">Settings</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        logout()
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors rounded-b-xl font-medium"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar