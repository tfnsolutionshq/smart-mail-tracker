import React, { useState, useEffect } from 'react'
import { FiX, FiCheck } from 'react-icons/fi'
import { useNotification } from '../../context/NotificationContext'
import axios from 'axios'
import { identityBaseUrl } from '../../services/api'

function AssignRoleModal({ onClose, onSuccess, user, roles }) {
  const { showNotification } = useNotification()
  const [selectedRole, setSelectedRole] = useState(user?.role_id || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRole) {
      showNotification('Please select a role', 'error')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${identityBaseUrl}/users/${user.id}/assign-role?role_id=${selectedRole}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      showNotification('Role assigned successfully', 'success')
      onSuccess()
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to assign role', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Assign Role</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Assign a role to <span className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignRoleModal
