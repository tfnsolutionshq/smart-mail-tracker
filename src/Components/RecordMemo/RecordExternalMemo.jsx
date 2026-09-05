import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FiArrowLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { categoryAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function RecordExternalMemo() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(null)
  const retryTimeoutRef = useRef(null)
  const MAX_RETRIES = 3
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  
  const previousData = location.state || {}
  const [form, setForm] = useState({
    reference: previousData.reference || '',
    dateReceived: previousData.dateReceived || '',
    subject: previousData.subject || '',
    senderOrg: previousData.senderOrg || '',
    senderContact: previousData.senderContact || '',
    priority: previousData.priority || 'Medium',
    category: previousData.category || '',
    description: previousData.description || ''
  })

  const fetchCategories = useCallback(async (attempt = 0) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    setCategoriesLoading(true)
    setCategoriesError(null)

    try {
      const response = await categoryAPI.getCategories(token)
      if (response.status && response.data) {
        setCategories(response.data.data || [])
        setCategoriesLoading(false)
      } else {
        throw new Error('Unexpected response format from the server.')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000
        retryTimeoutRef.current = setTimeout(() => fetchCategories(attempt + 1), delay)
        return
      }
      setCategoriesError(error.message || 'Failed to load categories. Please try again.')
      setCategoriesLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchCategories(0)
    }
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [token, fetchCategories])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    if (value === 'Other') {
      setIsCustomCategory(true)
      setForm((prev) => ({ ...prev, category: '' }))
    } else {
      setIsCustomCategory(false)
      setForm((prev) => ({ ...prev, category: value }))
    }
  }

  const isFormValid = 
    form.reference && 
    form.dateReceived && 
    form.subject && 
    form.senderOrg && 
    form.senderContact && 
    form.category && 
    form.description

  const handleNext = () => {
    if (!isFormValid) {
      alert('Please fill in all required fields marked with *');
      return;
    }
    navigate('/record-external-attachments', { state: form });
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4 lg:py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4">
        <FiArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Record External Memo</h1>
      <p className="text-gray-600 text-sm mt-1">Record incoming memo from external organization</p>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center sm:flex-nowrap flex-wrap gap-4 sm:gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">1</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Metadata</p>
                <p className="text-xs text-gray-600">Basic information</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <span className="w-8 h-px bg-gray-200"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">2</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Attachments</p>
                <p className="text-xs text-gray-600">Upload files (optional)</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <span className="w-8 h-px bg-gray-200"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">3</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Assignment</p>
                <p className="text-xs text-gray-600">Department & officer</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <span className="w-8 h-px bg-gray-200"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">4</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Review</p>
                <p className="text-xs text-gray-600">Confirm details</p>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-3 w-full bg-gray-200 h-1 rounded-full">
          <div className="bg-black h-1 rounded-full" style={{ width: '25%' }}></div>
        </div> */}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6">
        <div>
          <p className="text-sm font-semibold text-gray-900">Metadata</p>
          <p className="text-xs text-gray-600">Basic information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-gray-700">Reference Number <span className="text-red-500">*</span></label>
            <input name="reference" value={form.reference} onChange={handleChange} placeholder="e.g., MOE/ADM/2024/0125" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Date Received <span className="text-red-500">*</span></label>
            <input type="date" name="dateReceived" value={form.dateReceived} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Subject <span className="text-red-500">*</span></label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="Enter memo subject" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Sender Organization <span className="text-red-500">*</span></label>
            <input name="senderOrg" value={form.senderOrg} onChange={handleChange} placeholder="e.g., Ministry of Education" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Sender Contact <span className="text-red-500">*</span></label>
            <input name="senderContact" value={form.senderContact} onChange={handleChange} placeholder="Email or phone" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Priority Level <span className="text-red-500">*</span></label>
            <select name="priority" value={form.priority} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]">
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700">Category <span className="text-red-500">*</span></label>
            {categoriesError ? (
              <div className="mt-1 flex items-center justify-between gap-3 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
                <p className="text-xs text-red-600">{categoriesError}</p>
                <button
                  type="button"
                  onClick={() => fetchCategories(0)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            ) : (
              <select 
                value={isCustomCategory ? 'Other' : form.category} 
                onChange={handleCategoryChange} 
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]"
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                <option value="Other">Other (Enter custom)</option>
              </select>
            )}
            {categoriesLoading && !categoriesError && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <FiRefreshCw className="w-3 h-3 animate-spin" />
                Fetching categories...
              </p>
            )}
            {isCustomCategory && (
              <input 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                placeholder="Enter custom category" 
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" 
              />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Description/Summary <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the memo content" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 bg-[#F3F3F5]" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg">Cancel</button>
          <button 
            disabled={!isFormValid}
            className={`px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg flex items-center gap-2 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={handleNext}
          >
            Next
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
