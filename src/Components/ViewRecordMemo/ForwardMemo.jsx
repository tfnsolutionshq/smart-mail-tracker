import React, { useState, useEffect } from 'react'
import { FiX, FiChevronDown } from 'react-icons/fi'
import { departmentAPI, userAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ForwardMemo({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing = false 
}) {
  const { token } = useAuth()
  
  const [departments, setDepartments] = useState([])
  const [officers, setOfficers] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  
  const [departmentId, setDepartmentId] = useState('')
  const [officerId, setOfficerId] = useState('')
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (isOpen && token) {
      fetchData()
    }
  }, [isOpen, token])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      const [deptRes, userRes] = await Promise.all([
        departmentAPI.getDepartments(token),
        userAPI.getUsers({}, token)
      ])
      
      if (deptRes.status && deptRes.data) {
        setDepartments(deptRes.data.data || [])
      }
      
      if (userRes.status && userRes.data) {
        setOfficers(userRes.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = () => {
    // Find the selected officer to get their email
    const selectedOfficer = officers.find(o => o.id == officerId)
    
    onConfirm({
      departmentId,
      officerId,
      email: selectedOfficer ? selectedOfficer.email : '',
      remarks
    })
  }

  if (!isOpen) return null

  // Filter officers based on selected department if needed
  // For now, showing all officers or we could filter if user object has department_id
  const filteredOfficers = departmentId 
    ? officers.filter(user => user.department_id === parseInt(departmentId) || user.department_id === departmentId)
    : officers

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/90 p-4 md:inset-0 h-modal md:h-full">
      <div className="relative w-full max-w-sm h-full md:h-auto">
        <div className="relative bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b rounded-t">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Forward Memo
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {loadingData ? (
              <div className="text-center py-4 text-gray-500">Loading departments and officers...</div>
            ) : (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-900">Department</label>
                  <div className="relative">
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 appearance-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FiChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-900">Officer</label>
                  <div className="relative">
                    <select
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 appearance-none"
                    >
                      <option value="">Select Officer</option>
                      {filteredOfficers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FiChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-900">Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any notes or instructions..."
                  ></textarea>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2 hover:text-gray-900 focus:z-10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing || loadingData || !departmentId || !officerId}
              className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center flex items-center gap-2"
            >
              {isProcessing && (
                <svg className="animate-spin h-3 w-3 text-white" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
