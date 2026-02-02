import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiBook, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { login as loginAPI, register as registerAPI } from '../services/authService'

const Login = ({ login }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const navigate = useNavigate()

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return Math.min(strength, 4)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors([])
    setLoading(true)

    try {
      let response
      
      if (isLogin) {
        // Login
// Debug log removed
        response = await loginAPI({
          email: formData.email,
          password: formData.password
        })
// Debug log removed
      } else {
        if (passwordStrength < 4) {
          setError('Please use a strong password before creating an account.')
          setLoading(false)
          return
        }
        // Register
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }
        // Only add studentId if it's a student role and has a value
        if (formData.role === 'student' && formData.studentId) {
          registerData.studentId = formData.studentId
        }
// Debug log removed
        response = await registerAPI(registerData)
// Debug log removed
      }
      
      // Call the login prop to update app state
      login(response.user)
      
      // Navigate to dashboard
      navigate('/')
    } catch (err) {
      const errorMessage = err.message || err.error || 'Authentication failed. Please try again.'
      const validationErrors = Array.isArray(err?.errors)
        ? err.errors.map(item => ({ field: item.field, message: item.message }))
        : []

      setError(errorMessage)
      setFieldErrors(validationErrors)
    } finally {
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'At least 1 number', met: /\d/.test(formData.password) },
    { label: 'At least 1 special character', met: /[^a-zA-Z0-9]/.test(formData.password) }
  ]

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 fixed inset-0 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Content container */}
      <div className="w-full h-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <FiBook className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              {isLogin ? 'QuizMaster' : 'Join QuizMaster'}
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg">
              Professional Assessment Platform
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl backdrop-blur-sm bg-opacity-95 transform hover:shadow-3xl transition-all duration-300">
            <form className="space-y-5 sm:space-y-6 p-6 sm:p-8" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg animate-shake">
                  <div className="flex items-start sm:items-center gap-2">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="h-5 w-5 text-red-500 mt-0.5 sm:mt-0" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                      {!isLogin && fieldErrors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-xs text-red-600 space-y-1">
                          {fieldErrors.map((item, idx) => (
                            <li key={`${item.field}-${idx}`}>{item.message}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="transform transition-all duration-300">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                        className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 text-sm sm:text-base"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="transform transition-all duration-300">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 appearance-none bg-white text-sm sm:text-base"
                      >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {formData.role === 'student' && (
                    <div className="transform transition-all duration-300 animate-fadeIn">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 text-sm sm:text-base"
                        placeholder="ET/ICT/23/0001"
                      />
                      <p className="mt-1 text-xs text-gray-500">Use uppercase letters, numbers, hyphens (-) and forward slashes (/)</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 text-sm sm:text-base"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-300 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">Min 8 characters with uppercase, lowercase, number and special character (@$!%*?&)</p>
                )}
                
                {!isLogin && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">Password Strength</span>
                      <span className={`font-semibold text-xs ${
                        passwordStrength === 0 ? 'text-red-500' :
                        passwordStrength === 1 ? 'text-orange-500' :
                        passwordStrength === 2 ? 'text-yellow-500' :
                        passwordStrength === 3 ? 'text-blue-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength === 0 ? 'Very Weak' :
                         passwordStrength === 1 ? 'Weak' :
                         passwordStrength === 2 ? 'Fair' :
                         passwordStrength === 3 ? 'Good' :
                         'Strong'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength === 0 ? 'w-1/5 bg-red-500' :
                          passwordStrength === 1 ? 'w-2/5 bg-orange-500' :
                          passwordStrength === 2 ? 'w-3/5 bg-yellow-500' :
                          passwordStrength === 3 ? 'w-4/5 bg-blue-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                      {passwordRequirements.map(req => (
                        <div key={req.label} className="flex items-center justify-between">
                          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.label}</span>
                          <span className={req.met ? 'text-green-600' : 'text-gray-400'}>
                            {req.met ? '✓' : '•'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (!isLogin && passwordStrength < 4)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-3.5 rounded-lg font-semibold text-base sm:text-base shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    {!loading && <FiCheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </>
                )}
              </button>
            </form>

            <div className="px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-b-2xl border-t border-gray-100">
              <div className="text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setFormData({
                      ...formData,
                      name: '',
                      studentId: ''
                    })
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs sm:text-sm transition-colors inline-flex items-center space-x-1 group"
                >
                  <span className="block sm:inline">
                    {isLogin
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                  </span>
                  <span className="underline group-hover:no-underline">
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-indigo-100">
              © {new Date().getFullYear()} QuizMaster. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login