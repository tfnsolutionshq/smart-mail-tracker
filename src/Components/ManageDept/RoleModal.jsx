import React, { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useNotification } from '../../context/NotificationContext'
import axios from 'axios'
import { identityBaseUrl } from '../../services/api'

function RoleModal({ onClose, onSuccess, editRole = null }) {
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editRole) {
      setFormData({
        name: editRole.name,
        description: editRole.description || ''
      })
    }
  }, [editRole])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      if (editRole) {
        await axios.put(
          `${identityBaseUrl}/roles/${editRole.id}?name=${encodeURIComponent(formData.name)}&description=${encodeURIComponent(formData.description)}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      } else {
        const formDataObj = new FormData()
        formDataObj.append('name', formData.name)
        formDataObj.append('description', formData.description)

        await axios.post(
          `${identityBaseUrl}/roles/department`,
          formDataObj,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      }

      showNotification(editRole ? 'Role updated successfully' : 'Role created successfully', 'success')
      onSuccess()
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save role', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editRole ? 'Edit Role' : 'Create New Role'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Secretary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the role responsibilities"
              rows="3"
              required
            />
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
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleModal
