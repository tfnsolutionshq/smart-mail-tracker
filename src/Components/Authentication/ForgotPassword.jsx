import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useNotification } from '../../context/NotificationContext'
import { identityBaseUrl } from '../../services/api'
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import authImage from "../../assets/Authentication/Auth.jpg"
import logo from "../../assets/SMTLogowhite.png"

function ForgotPassword() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) return
    
    setLoading(true)
    
    try {
      const response = await axios.post(`${identityBaseUrl}/forgot-password`, { email })
      
      if (response.data) {
        showNotification('OTP sent to your email', 'success')
        navigate('/reset-password', { state: { email } })
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.'
      showNotification(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }



  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(1, 24, 35, 0.98), rgba(1, 24, 35, 0.95)), url(${authImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <Link to="/">
            <img src={logo} alt="SmartMailTrack" className="h-14 mx-auto mb-3" />
          </Link>
          <p className="text-xs text-gray-300">Enterprise Memo Management Platform</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Back to Login */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-sm text-gray-900 font-medium mb-12 hover:text-gray-800 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Reset Your Password</h2>
          <p className="text-center text-gray-600 text-xs mb-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                  required
                />
              </div>
            </div>

            {/* Send Reset Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors duration-200 mt-4 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FiMail className="w-4 h-4" />
                  Send Reset Instructions
                </>
              )}
            </button>
          </form>

          {/* Remember Password */}
          <div className="text-center mt-4">
            <button 
              onClick={handleBackToLogin}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Remember your password? <span className="text-blue-600 font-medium">Sign in instead</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">POWERED BY TFN SOLUTIONS</p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
