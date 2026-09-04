import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FiMoreVertical, FiEdit, FiUserPlus, FiPower, FiTrash2, FiSearch } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { departmentAPI, userAPI } from '../../services/api'
import EditDepartment from './EditDepartment'

function Departments() {
  const [showDeptMenu, setShowDeptMenu] = useState(null)
  const [showEditDepartment, setShowEditDepartment] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState({ total_departments: 0, active_departments: 0 })
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const deptMenuRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const { token } = useAuth()
  const { showNotification } = useNotification()

  const fetchData = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const filters = { page }
      if (search) filters.search = search

      const [deptResponse, statsResponse, usersResponse] = await Promise.all([
        departmentAPI.getDepartments(token, filters),
        departmentAPI.getDepartmentStats(token),
        userAPI.getUsers({}, token)
      ])

      if (deptResponse.status && deptResponse.data) {
        setDepartments(deptResponse.data.data)
        setCurrentPage(deptResponse.data.current_page)
        setLastPage(deptResponse.data.last_page)
        setTotal(deptResponse.data.total)
      }

      if (statsResponse.status && statsResponse.data) {
        setStats(statsResponse.data)
      }

      if (usersResponse.status && usersResponse.data) {
        setTotalUsers(usersResponse.data.total)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      showNotification('Failed to fetch departments', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, debouncedSearch)
  }, [debouncedSearch])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(searchTimeoutRef.current)
  }, [searchQuery])

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) return
    fetchData(page, debouncedSearch)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(lastPage, start + maxVisible - 1)
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          1
        </button>
      )
      if (start > 2) {
        pages.push(<span key="start-ellipsis" className="px-2 text-xs text-gray-400">...</span>)
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-xs border rounded-lg ${
            i === currentPage
              ? 'bg-black text-white border-black'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      )
    }

    if (end < lastPage) {
      if (end < lastPage - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 text-xs text-gray-400">...</span>)
      }
      pages.push(
        <button
          key={lastPage}
          onClick={() => handlePageChange(lastPage)}
          className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {lastPage}
        </button>
      )
    }

    return pages
  }

  // Close department menu on outside click
  useEffect(() => {
    if (!showDeptMenu) return
    const handleMouseDown = (e) => {
      if (deptMenuRef.current && deptMenuRef.current.contains(e.target)) return
      setShowDeptMenu(null)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [showDeptMenu])

  const handleDeleteDepartment = async () => {
    try {
      await departmentAPI.deleteDepartment(departmentToDelete.id, token)
      showNotification('Department deleted successfully', 'success')
      fetchData(currentPage, debouncedSearch)
    } catch (error) {
      console.error('Error deleting department:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete department'
      showNotification(errorMessage, 'error')
    } finally {
      setShowDeleteConfirm(false)
      setDepartmentToDelete(null)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Departments</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_departments}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Departments</p>
              <p className="text-xl font-bold text-gray-900">{stats.active_departments}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Department Management Header + Search */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Department Management</h2>
          <p className="text-xs text-gray-600">Organize users by departments and manage hierarchies</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            {debouncedSearch ? 'No departments match your search.' : 'No departments found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">{dept.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dept.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dept.is_active ? 'active' : 'inactive'}
                  </span>
                </div>
                <div
                  className="relative"
                  ref={showDeptMenu === dept.id ? deptMenuRef : null}
                >
                  <button
                    onClick={() => setShowDeptMenu(showDeptMenu === dept.id ? null : dept.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiMoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  {showDeptMenu === dept.id && (
                    <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                      <button 
                        onClick={() => {
                          setSelectedDepartment(dept)
                          setShowEditDepartment(true)
                          setShowDeptMenu(null)
                        }}
                        className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                      >
                        <FiEdit className="w-3 h-3 mr-2" />
                        Edit Department
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={() => {
                          setDepartmentToDelete(dept)
                          setShowDeleteConfirm(true)
                          setShowDeptMenu(null)
                        }}
                        className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600"
                      >
                        <FiTrash2 className="w-3 h-3 mr-2" />
                        Delete Department
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-600">
                  {dept.department_code} • {dept.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Showing page {currentPage} of {lastPage} ({total} departments)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartment && selectedDepartment && (
        <EditDepartment 
          department={selectedDepartment} 
          onClose={() => {
            setShowEditDepartment(false)
            setSelectedDepartment(null)
          }}
          onSuccess={() => fetchData(currentPage, debouncedSearch)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && departmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Department</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{departmentToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDepartmentToDelete(null)
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDepartment}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments
