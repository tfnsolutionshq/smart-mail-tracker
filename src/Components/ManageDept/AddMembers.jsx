import React, { useState, useEffect } from 'react'
import { FiX, FiSearch, FiCheck, FiAlertCircle, FiUserPlus } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { userAPI, identityBaseUrl } from '../../services/api'
import axios from 'axios'

function AddMembers({ onClose, onSuccess }) {
  const { showNotification } = useNotification()
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.length > 2) {
      const timeoutId = setTimeout(() => {
        searchUsers()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${identityBaseUrl}/users?per_page=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      if (response.data.status) {
        setUsers(response.data.data.data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${identityBaseUrl}/users/search?q=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      if (response.data.status) {
        setUsers(response.data.data.data)
      }
    } catch (err) {
      console.error('Error searching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = (user) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    } else {
      if (selectedUsers.length < 5) {
        setSelectedUsers([...selectedUsers, user])
      } else {
        showNotification('You can only add 5 members at a time', 'error')
      }
    }
  }

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      showNotification('Please select at least one user', 'error')
      return
    }

    setSubmitting(true)

    try {
      const response = await axios.post(
        `${identityBaseUrl}/users/assign-to-department`,
        { user_ids: selectedUsers.map(u => u.id) },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.data.status) {
        setSuccess(true)
        showNotification('Members added successfully', 'success')
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add members', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-bold text-gray-900">Add Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Members Added!</h3>
              <p className="text-xs text-gray-600">Members have been added to your department.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    Selected ({selectedUsers.length}/5)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <span key={user.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs">
                        {user.first_name} {user.last_name}
                        <button onClick={() => toggleUser(user)} className="text-gray-400 hover:text-gray-600">
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                ) : users.length > 0 ? (
                  users.map(user => {
                    const isSelected = selectedUsers.find(u => u.id === user.id)
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleUser(user)}
                        className={`w-full p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          </div>
                          {isSelected && (
                            <FiCheck className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <p className="text-center text-sm text-gray-500 py-4">No users found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {!success && (
          <div className="flex items-center justify-end gap-2 p-4 border-t">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0 || submitting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FiUserPlus className="w-3 h-3" />
                  Add Members
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddMembers
