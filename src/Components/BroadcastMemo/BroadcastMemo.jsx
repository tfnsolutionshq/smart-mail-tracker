import React, { useState, useEffect } from 'react'
import { FiSend, FiPaperclip, FiX, FiUpload } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { categoryAPI } from '../../services/api'
import axios from 'axios'

function BroadcastMemo() {
  const { token, user } = useAuth()
  const { showNotification } = useNotification()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState('high')
  const [attachments, setAttachments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [token])

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories(token)
      if (response.status) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        showNotification(`${file.name} exceeds 10MB limit`, 'error')
        return false
      }
      return true
    })
    setAttachments(prev => [...prev, ...validFiles])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!subject.trim() || !body.trim() || !categoryId) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('subject', subject)
      formData.append('body', body)
      formData.append('category_id', categoryId)
      formData.append('priority', priority)
      formData.append('department_id', user?.department_id || '')

      attachments.forEach(file => {
        formData.append('attachments[]', file)
      })

      const response = await axios.post(
        'https://memo.smt.tfnsolutions.us/api/v1/memos/broadcast-department',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.status) {
        setSuccess(true)
        showNotification('Broadcast memo sent successfully!', 'success')
        setSubject('')
        setBody('')
        setCategoryId('')
        setPriority('high')
        setAttachments([])
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to send broadcast memo', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Broadcast Memo</h1>
        <p className="text-sm text-gray-600 mt-1">Send a memo to all members of your department</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Memo Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter memo subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message..."
              rows="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPaperclip className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFileSelect(e.dataTransfer.files)
            }}
          >
            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">Drag and drop files here, or click to select</p>
            <input
              id="attachments"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFileSelect(e.target.files)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('attachments')?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Choose Files
            </button>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FiSend className="w-4 h-4" />
          )}
          {loading ? 'Sending...' : 'Send Broadcast Memo'}
        </button>
      </form>
    </div>
  )
}

export default BroadcastMemo
