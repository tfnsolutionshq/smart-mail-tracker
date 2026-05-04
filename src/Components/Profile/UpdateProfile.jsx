import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { identityBaseUrl, identityStorageBase } from '../../services/api'
import { FiCamera, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

function UpdateProfile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { token, user } = useAuth()
  const { showNotification } = useNotification()
  const [userData, setUserData] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [timezone, setTimezone] = useState('')
  const [language, setLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get('tab') === 'security' ? 'security' : 'profile'
  )

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (token && user?.id) {
      fetchUserData()
    }
  }, [token, user?.id])

  useEffect(() => {
    setActiveTab(searchParams.get('tab') === 'security' ? 'security' : 'profile')
  }, [searchParams])

  const fetchUserData = async () => {
    setFetching(true)
    try {
      const response = await axios.get(`${identityBaseUrl}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.status && response.data.data) {
        const data = response.data.data
        setUserData(data)
        setFullName(`${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim())
        setEmail(data.email || '')
        setJobTitle(data.role?.name || '')
        setPhone(data.phone || '')
        setLocation(data.location || '')
        setBio(data.bio || '')
        setTimezone(data.timezone || '')
        setLanguage(data.language || '')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      showNotification('Failed to load user data', 'error')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      showNotification('Missing auth token', 'error')
      return
    }
    const formData = new FormData()
    if (location) formData.append('location', location)
    if (bio) formData.append('bio', bio)
    if (timezone) formData.append('timezone', timezone)
    if (language) formData.append('language', language)
    if (phone) formData.append('phone', phone)
    if (avatarFile) formData.append('avatar', avatarFile)
    if (signatureFile) formData.append('signature', signatureFile)
    setLoading(true)
    try {
      await axios.post(`${identityBaseUrl}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        maxBodyLength: Infinity
      })
      showNotification('Profile updated successfully', 'success')
      fetchUserData()
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!token) {
      showNotification('Missing auth token', 'error')
      return
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification('Please fill in all password fields', 'error')
      return
    }
    if (newPassword.length < 8) {
      showNotification('New password must be at least 8 characters', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error')
      return
    }

    setPasswordLoading(true)
    try {
      await axios.post(
        `${identityBaseUrl}/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          maxBodyLength: Infinity
        }
      )
      showNotification('Password updated successfully', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to update password'
      showNotification(message, 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile Settings</h1>
        <p className="text-sm text-gray-600">Manage your profile information, security and preferences</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile')
              setSearchParams({}, { replace: true })
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security')
              setSearchParams({ tab: 'security' }, { replace: true })
            }}
            className={`ml-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {activeTab === 'profile' && (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Profile Photo</h2>
            <p className="text-sm text-gray-600 mb-6">Update your profile picture</p>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-medium text-gray-600">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : userData?.avatar ? (
                    <img src={`${identityStorageBase}/storage/${userData.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (userData?.first_name?.[0] || 'U').toUpperCase()
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <label className="px-4 py-2 bg-black text-white rounded text-sm cursor-pointer hover:bg-gray-800 flex items-center gap-2">
                  <FiCamera className="w-4 h-4" />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {(avatarFile || userData?.avatar) && (
                  <button
                    type="button"
                    onClick={() => setAvatarFile(null)}
                    className="px-4 py-2 text-gray-700 border rounded text-sm hover:bg-gray-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Signature Upload */}
            <div className="mt-8 pt-6 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
              {(signatureFile || userData?.signature) && (
                <div className="mt-3">
                  <img 
                    src={signatureFile ? URL.createObjectURL(signatureFile) : `${identityStorageBase}/storage/${userData.signature}`} 
                    alt="Signature" 
                    className="h-20 object-contain border rounded" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Basic Information</h2>
            <p className="text-sm text-gray-600 mb-6">Update your personal information</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="State University, Main Campus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Experienced educator and researcher with 15+ years in computer science academia."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select timezone</option>
                    <option value="Eastern Time">Eastern Time</option>
                    <option value="Central Time">Central Time</option>
                    <option value="Mountain Time">Mountain Time</option>
                    <option value="Pacific Time">Pacific Time</option>
                    <option value="Africa/Lagos">Africa/Lagos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select language</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 border rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Change Password</h2>
              <p className="text-sm text-gray-600 mb-6">
                Update your account password. Make sure it is strong and unique.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-start gap-3">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateProfile
