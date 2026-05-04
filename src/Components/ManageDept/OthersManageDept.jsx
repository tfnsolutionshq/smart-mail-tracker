import React, { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight, FiEye, FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import { identityBaseUrl } from '../../services/api'
import axios from 'axios'

function OthersManageDept() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('members')
  const [members, setMembers] = useState([])
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(false)
  const [memosLoading, setMemosLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20
  })

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(1)
    } else if (activeTab === 'memos') {
      fetchDepartmentMemos()
    }
  }, [activeTab])

  useEffect(() => {
    fetchMembers(1)
  }, [])

  const fetchMembers = async (page) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${identityBaseUrl}/users/my-department?per_page=20&page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.status) {
        setMembers(response.data.data.data)
        setPagination({
          currentPage: response.data.data.current_page,
          lastPage: response.data.data.last_page,
          total: response.data.data.total,
          perPage: response.data.data.per_page
        })
      }
    } catch (error) {
      showNotification('Failed to fetch members', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMembers(1)
      setIsSearching(false)
      return
    }

    setLoading(true)
    setIsSearching(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${identityBaseUrl}/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.status) {
        setMembers(response.data.data.data)
        setPagination({
          currentPage: response.data.data.current_page,
          lastPage: response.data.data.last_page,
          total: response.data.data.total,
          perPage: response.data.data.per_page
        })
      }
    } catch (error) {
      showNotification('Search failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
    fetchMembers(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchMembers(page)
    }
  }



  const fetchDepartmentMemos = async () => {
    setMemosLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'https://memo.smt.tfnsolutions.us/api/v1/mailbox/department',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      console.log('Department Memos Response:', response.data)
      
      if (response.data.status && response.data.data && response.data.data.data) {
        setMemos(response.data.data.data)
      }
    } catch (error) {
      console.error('Error fetching memos:', error)
      showNotification('Failed to fetch department memos', 'error')
    } finally {
      setMemosLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View Department</h1>
          <p className="text-sm text-gray-600">{user?.department?.name || 'Department'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'members'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('memos')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'memos'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Department Memos
            </button>
          </nav>
        </div>

        <div className="p-6">

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
                >
                  Search
                </button>
                {isSearching && (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 text-xs font-medium text-gray-900">Name</th>
                          <th className="pb-3 text-xs font-medium text-gray-900">Role</th>
                          <th className="pb-3 text-xs font-medium text-gray-900">Email</th>
                          <th className="pb-3 text-xs font-medium text-gray-900">Phone</th>
                          <th className="pb-3 text-xs font-medium text-gray-900">Last Login</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr key={member.id} className="border-b">
                            <td className="py-3 text-sm text-gray-900">
                              {member.first_name} {member.middle_name || ''} {member.last_name}
                            </td>
                            <td className="py-3 text-sm text-gray-600">{member.role?.name || 'N/A'}</td>
                            <td className="py-3 text-sm text-gray-600">{member.email}</td>
                            <td className="py-3 text-sm text-gray-600">{member.phone || 'N/A'}</td>
                            <td className="py-3 text-sm text-gray-600">
                              {formatDate(member.last_login_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {pagination.lastPage > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-xs text-gray-600">
                        Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {pagination.currentPage} of {pagination.lastPage}
                        </span>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.lastPage}
                          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'memos' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Department Memos</h3>
              
              {memosLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : memos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No memos found
                </div>
              ) : (
                <div className="space-y-3">
                  {memos.map((memo) => (
                    <div key={memo.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{memo.subject}</h4>
                            <span className="text-xs text-gray-500">#{memo.reference_id}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">From: {memo.sender?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(memo.created_at)}</p>
                          <p className="text-xs text-gray-600 mt-1">Category: {memo.category?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(memo.priority)}`}>
                            {memo.priority}
                          </span>
                          <button
                            onClick={() => navigate(`/mail-content/${memo.id}`)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-100 flex items-center gap-1"
                          >
                            <FiEye className="w-3 h-3" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OthersManageDept
