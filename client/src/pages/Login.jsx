import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { authService } from '../services/authService'
import { useSecurityContext } from '../context/securityContext.jsx'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const { sanitizeInput, validateInput } = useSecurityContext()
  const { api, loginWithToken, getMe } = useAuthApi()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('🔵 Attempting login with:', { email: credentials.email })
      console.log('🔵 API base URL:', api.defaults.baseURL)
      
      const response = await api.post('/api/auth/signin', credentials, { noAuth: true })
      console.log('✅ Login response:', response)
      
      const data = response.data
      const token = data.accessToken || data.token
      console.log('🔵 Token received:', token ? 'Yes' : 'No')
      
      // Fetch user data with the new token
      try {
        console.log('🔵 Calling getMe with token...')
        const userObj = await getMe(token)
        console.log('✅ User data fetched:', userObj)
        // Now set both token and user data
        loginWithToken(token, userObj)
        console.log('✅ loginWithToken called with user data')
      } catch (err) {
        console.error('❌ Failed to fetch user data:', err)
        // Even if fetching user fails, still login with token
        loginWithToken(token, null)
        console.log('⚠️ loginWithToken called without user data')
      }

      navigate('/account')
    } catch (error) {
      console.error('Login error details:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      alert(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'https://localhost:8443/oauth2/authorization/google'
  }

  return (
      <div className="min-h-screen bg-white">
        <Header />

        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 space-y-6">
            <div className="text-left">
              <h1 className="text-lg font-medium text-black">LOGO</h1>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black">Login</h2>

              {/* Google Login Button */}
              <button
                  onClick={handleGoogleLogin}
                  className="w-full h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center gap-3 font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-600">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                      htmlFor="email"
                      className="text-sm font-medium text-black"
                  >
                    Email address
                  </label>
                  <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) =>
                          setCredentials({ ...credentials, email: sanitizeInput(e.target.value, 'email') })
                      }
                      className="h-12 w-full bg-gray-50/30 border border-gray-200/60 rounded-full px-6 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all placeholder:text-gray-400/60 hover:border-gray-300"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <label
                      htmlFor="password"
                      className="text-sm font-medium text-black"
                  >
                    Password
                  </label>
                  <input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) =>
                          setCredentials({ ...credentials, password: sanitizeInput(e.target.value, 'password') })
                      }
                      className="h-12 w-full bg-gray-50/30 border border-gray-200/60 rounded-full px-6 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all placeholder:text-gray-400/60 hover:border-gray-300"
                      required
                  />
                </div>

                <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg"
                >
                  Login
                </button>
              </form>

              <div className="text-center">
              <span className="text-sm text-black">
                Don&apos;t have an account?{' '}
                <a
                    href="/signup"
                    className="text-blue-600 hover:underline font-medium"
                >
                  Sign Up
                </a>
              </span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
