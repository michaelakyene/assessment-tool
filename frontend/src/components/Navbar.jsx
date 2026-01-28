import { Link } from 'react-router-dom'
import { FiLogOut, FiHome, FiUser, FiBell, FiSettings } from 'react-icons/fi'
import Notifications from './realtime/Notifications'

const Navbar = ({ user, logout }) => {
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
                {user.role === 'lecturer' ? 'Lecturer Portal' : 'Student Portal'}
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              <Link 
                to="/" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              {user.role === 'lecturer' ? (
                <>
                  <Link 
                    to="/quizzes" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    My Quizzes
                  </Link>
                  <Link 
                    to="/results" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Results
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/quizzes" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Available Quizzes
                  </Link>
                  <Link 
                    to="/attempts" 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    My Attempts
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Notifications />
            
            <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiSettings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="relative group">
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar