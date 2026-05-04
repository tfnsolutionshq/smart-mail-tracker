import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FiSearch, FiUpload, FiPlus, FiMoreVertical, FiEdit, FiEye, FiKey, FiPower, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { userAPI } from '../../services/api'
import RoleManagment from './RoleManagment'
import Departments from './Departments'
import MemoCategories from './MemoCategories'
import ActivityLogs from './ActivityLogs'
import SystemSettings from './SystemSettings'
import AddUser from './AddUser'
import EditUser from './EditUser'
import ViewActivity from './ViewActivity'
import AddRole from './AddRole'
import AddDepartment from './AddDepartment'
import AddCategory from './AddCategory'
import BulkUpload from './BulkUpload'
import RecordMemoStats from './RecordMemoStats'

function Administrations() {
  const [activeTab, setActiveTab] = useState('Users')

  const [showUserMenu, setShowUserMenu] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showViewActivity, setShowViewActivity] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [resetPasswordError, setResetPasswordError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showAddRole, setShowAddRole] = useState(false)
  const [showAddDepartment, setShowAddDepartment] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const userMenuRef = useRef(null)

  const tabs = ['Users', 'Roles & Permissions', 'Departments', 'Memo Categories', 'Activity Logs', 'Record Memo']

  const { token } = useAuth()
  const { showNotification } = useNotification()

  const mapApiUserToRow = (user) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    name: `${user.first_name || ''} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name || ''}`.trim() || user.email || 'User',
    email: user.email,
    role_id: user.role_id,
    department_id: user.department_id,
    role: user.role,
    department: user.department,
    status: user.is_active ? 'active' : 'inactive',
    lastLogin: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Never',
    created_at: user.created_at,
    memos: user.approval_stats?.total_memos_sent || 0,
    approvalRate: user.approval_stats?.approval_rate || 0,
    avatar: user.avatar && user.avatar.startsWith('http') ? user.avatar : null,
    avatarInitial: (user.first_name && user.first_name.slice(0, 1).toUpperCase()) || '?'
  })

  /** Paginated directory (no search params) — same as before minus filters. */
  const fetchBrowseUsers = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userAPI.getUsers({ page }, token)
      if (response.status && response.data) {
        const transformedUsers = response.data.data.map(mapApiUserToRow)
        setUsers(transformedUsers)
        setCurrentPage(response.data.current_page)
        setTotalPages(response.data.last_page)
        setTotalUsers(response.data.total)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users. Please try again.')
      showNotification('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }, [token, showNotification])

  /** GET /users/search?q=… — same endpoint as ComposeMemo recipient search. */
  const fetchSearchUsers = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userAPI.searchUsers(query, token)
      if (response.status && response.data?.data) {
        const list = Array.isArray(response.data.data) ? response.data.data : []
        const transformedUsers = list.map(mapApiUserToRow)
        setUsers(transformedUsers)
        setCurrentPage(1)
        setTotalPages(1)
        setTotalUsers(transformedUsers.length)
      } else {
        setUsers([])
        setCurrentPage(1)
        setTotalPages(1)
        setTotalUsers(0)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setError('Failed to search users. Please try again.')
      showNotification('Failed to search users', 'error')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [token, showNotification])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    let cancelled = false
    const q = searchTerm.trim()
    const timeoutId = setTimeout(() => {
      if (cancelled) return
      if (q.length < 2) {
        setCurrentPage(1)
        fetchBrowseUsers(1)
      } else {
        fetchSearchUsers(q)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [searchTerm, token, fetchBrowseUsers, fetchSearchUsers])

  const refreshUsers = useCallback(() => {
    const q = searchTerm.trim()
    if (q.length >= 2) {
      fetchSearchUsers(q)
    } else {
      fetchBrowseUsers(currentPage)
    }
  }, [searchTerm, currentPage, fetchBrowseUsers, fetchSearchUsers])

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return
    const onMouseDown = (e) => {
      if (userMenuRef.current && userMenuRef.current.contains(e.target)) return
      setShowUserMenu(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showUserMenu])

  const getRoleColor = (role) => {
    const colors = {
      'Department Head': 'bg-green-100 text-green-800',
      'Faculty': 'bg-orange-100 text-orange-800',
      'Administrator': 'bg-purple-100 text-purple-800',
      'Staff': 'bg-gray-100 text-gray-800',
      'Dean': 'bg-blue-100 text-blue-800',
      'Academic Dean': 'bg-indigo-100 text-indigo-800',
      'Provost': 'bg-red-100 text-red-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const handleDeleteUser = async () => {
    if (!selectedUser?.id || !token) return
    setDeleteLoading(true)
    try {
      await userAPI.updateUser(selectedUser.id, { is_active: 0 }, token)
      showNotification('User deactivated successfully', 'success')
      setShowDeleteConfirm(false)
      setSelectedUser(null)
      refreshUsers()
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to deactivate user'
      showNotification(message, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser?.id || !token) return
    setResetPasswordError('')
    setResetPasswordLoading(true)
    try {
      await userAPI.resetUserPassword(selectedUser.id, token)
      showNotification('Password reset successfully. The user will be required to change it on next login.', 'success')
      setShowResetPassword(false)
      setSelectedUser(null)
      refreshUsers()
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to reset password'
      setResetPasswordError(message)
    } finally {
      setResetPasswordLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 text-sm">Manage users, roles, and system configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowBulkUpload(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'Users') setShowAddUser(true)
              else if (activeTab === 'Roles & Permissions') setShowAddRole(true)
              else if (activeTab === 'Departments') setShowAddDepartment(true)
              else if (activeTab === 'Memo Categories') setShowAddCategory(true)
            }}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {activeTab === 'Users' && 'Add User'}
            {activeTab === 'Roles & Permissions' && 'Add Role'}
            {activeTab === 'Departments' && 'Add Department'}
            {activeTab === 'Memo Categories' && 'Add Category'}
            {/* {activeTab === 'System Settings' && 'Save Settings'} */}
            {!['Users', 'Roles & Permissions', 'Departments', 'Memo Categories'].includes(activeTab) && 'Add Item'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Memos</p>
              <p className="text-2xl font-bold text-gray-900">241</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Users Tab Content */}
        {activeTab === 'Users' && (
          <div className="p-4 sm:p-6">
            {/* Search — GET /users/search?q= (same as Compose Memo recipients); clears to paginated directory */}
            <div className="mb-6">
              <div className="relative flex-1 max-w-xl">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email (min. 2 characters)…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Uses the same search as compose memo. Leave empty or enter fewer than 2 characters to browse the full directory with pagination.
              </p>
            </div>

            {/* User Directory Header */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">User Directory</h3>
              <p className="text-xs text-gray-600">Manage user accounts, roles, and permissions</p>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button 
                      type="button"
                      onClick={refreshUsers}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 text-xs font-medium text-gray-900">User</th>
                      <th className="pb-3 text-xs font-medium text-gray-900">Role</th>
                      <th className="pb-3 text-xs font-medium text-gray-900">Department</th>
                      <th className="pb-3 text-xs font-medium text-gray-900">Status</th>
                      <th className="pb-3 text-xs font-medium text-gray-900">Last Login</th>
                      <th className="pb-3 text-xs font-medium text-gray-900">Memos</th>
                      <th className="pb-3 text-xs font-medium text-gray-900">Approval Rate</th>
                      <th className="pb-3 text-xs font-medium text-gray-900"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                              {user.avatarInitial}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role?.name || 'No Role')}`}>
                          {user.role?.name || 'No Role'}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-900">{user.department?.name || 'Not Assigned'}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-600">{user.lastLogin}</td>
                      <td className="py-4 text-xs text-gray-900">{user.memos}</td>
                      <td className="py-4">
                        {user.approvalRate > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-900">{user.approvalRate}%</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-black rounded-full" 
                                style={{ width: `${user.approvalRate}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div
                          ref={showUserMenu === user.id ? userMenuRef : undefined}
                          className="relative"
                        >
                          <button
                            onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <FiMoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {showUserMenu === user.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                              <button 
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowEditUser(true)
                                  setShowUserMenu(null)
                                }}
                                className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                              >
                                <FiEdit className="w-3 h-3 mr-2" />
                                Edit User
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowViewActivity(true)
                                  setShowUserMenu(null)
                                }}
                                className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                              >
                                <FiEye className="w-3 h-3 mr-2" />
                                View Activity
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowResetPassword(true)
                                  setShowUserMenu(null)
                                }}
                                className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                              >
                                <FiKey className="w-3 h-3 mr-2" />
                                Reset Password
                              </button>
                              {/* <button className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50">
                                <FiPower className="w-3 h-3 mr-2" />
                                Deactivate
                              </button> */}
                              <hr className="my-1" />
                              <button 
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowDeleteConfirm(true)
                                  setShowUserMenu(null)
                                }}
                                className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600"
                              >
                                <FiTrash2 className="w-3 h-3 mr-2" />
                                Deactivate User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {/* Pagination */}
              {searchTerm.trim().length < 2 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newPage = currentPage - 1
                        setCurrentPage(newPage)
                        fetchBrowseUsers(newPage)
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newPage = currentPage + 1
                        setCurrentPage(newPage)
                        fetchBrowseUsers(newPage)
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roles & Permissions Tab Content */}
        {activeTab === 'Roles & Permissions' && <RoleManagment />}

        {/* Departments Tab Content */}
        {activeTab === 'Departments' && <Departments />}

        {/* Memo Categories Tab Content */}
        {activeTab === 'Memo Categories' && <MemoCategories />}

        {/* Activity Logs Tab Content */}
        {activeTab === 'Activity Logs' && <ActivityLogs />}

        {/* Record Memo Tab Content */}
        {activeTab === 'Record Memo' && <RecordMemoStats />}

        {/* System Settings Tab Content */}
        {activeTab === 'System Settings' && <SystemSettings />}

        {/* Other tabs placeholder */}
        {!['Users', 'Roles & Permissions', 'Departments', 'Memo Categories', 'Activity Logs', 'Record Memo', 'System Settings'].includes(activeTab) && (
          <div className="p-6 text-center">
            <p className="text-gray-500">Content for {activeTab} tab will be implemented here.</p>
          </div>
        )}
      </div>

      {/* Popups */}
      {showAddUser && <AddUser onClose={() => setShowAddUser(false)} onSuccess={() => refreshUsers()} />}
      {showEditUser && selectedUser && (
        <EditUser 
          user={selectedUser} 
          onClose={() => {
            setShowEditUser(false)
            setSelectedUser(null)
          }}
          onUserUpdated={() => refreshUsers()}
        />
      )}
      {showAddRole && <AddRole onClose={() => setShowAddRole(false)} />}
      {showAddDepartment && <AddDepartment onClose={() => setShowAddDepartment(false)} onSuccess={() => fetchBrowseUsers(1)} />}
      {showAddCategory && <AddCategory onClose={() => setShowAddCategory(false)} />}
      {showBulkUpload && <BulkUpload onClose={() => setShowBulkUpload(false)} onSuccess={() => refreshUsers()} />}
      {showViewActivity && selectedUser && (
        <ViewActivity 
          user={selectedUser} 
          onClose={() => {
            setShowViewActivity(false)
            setSelectedUser(null)
          }} 
        />
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate User</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to deactivate <strong>{selectedUser.name}</strong>? They will no longer be able to sign in.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setSelectedUser(null)
                }}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deactivating...' : 'Deactivate User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will reset the password for <strong>{selectedUser.name}</strong> to the system default
              and require them to change it on their next login.
            </p>
            {resetPasswordError && (
              <p className="text-sm text-red-600 mb-3">{resetPasswordError}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowResetPassword(false)
                  setSelectedUser(null)
                  setResetPasswordError('')
                }}
                disabled={resetPasswordLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordLoading}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {resetPasswordLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Administrations