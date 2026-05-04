import React, { useState, useEffect } from 'react'
import { FiUsers, FiFileText, FiMoreVertical, FiUserPlus, FiChevronLeft, FiChevronRight, FiShield, FiEdit2, FiPlus, FiTrash2, FiSend, FiEye, FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import AddMembers from './AddMembers'
import RoleModal from './RoleModal'
import ConfirmModal from './ConfirmModal'
import AssignRoleModal from './AssignRoleModal'
import { identityBaseUrl } from '../../services/api'
import axios from 'axios'

function ManageDept() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('members')
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAssignRole, setShowAssignRole] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [deletingRoleId, setDeletingRoleId] = useState(null)
  const [members, setMembers] = useState([])
  const [roles, setRoles] = useState([])
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [memosLoading, setMemosLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20
  })

  const dummyStats = {
    totalMembers: 24,
    activeMemos: 12,
    pendingApprovals: 5,
    completionRate: 87
  }

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(1)
    } else if (activeTab === 'roles') {
      fetchRoles()
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

  const fetchRoles = async () => {
    setRolesLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${identityBaseUrl}/roles/my-department`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.status) {
        setRoles(response.data.data)
      }
    } catch (error) {
      showNotification('Failed to fetch roles', 'error')
    } finally {
      setRolesLoading(false)
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
      
      if (response.data.status) {
        setMemos(response.data.data.data || [])
      }
    } catch (error) {
      showNotification('Failed to fetch department memos', 'error')
    } finally {
      setMemosLoading(false)
    }
  }

  const handleCreateRole = () => {
    setEditingRole(null)
    setShowRoleModal(true)
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setShowRoleModal(true)
  }

  const handleRoleSuccess = () => {
    setShowRoleModal(false)
    setEditingRole(null)
    fetchRoles()
  }

  const handleDeleteRole = async (roleId) => {
    setDeletingRoleId(roleId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteRole = async () => {
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${identityBaseUrl}/roles/${deletingRoleId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      setShowDeleteConfirm(false)
      setDeletingRoleId(null)
      showNotification('Role deleted successfully', 'success')
      fetchRoles()
    } catch (error) {
      showNotification('Failed to delete role', 'error')
    } finally {
      setDeleteLoading(false)
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

  const handleAssignRole = (user) => {
    if (roles.length === 0) {
      fetchRoles()
    }
    setSelectedUser(user)
    setShowAssignRole(true)
    setOpenMenuId(null)
  }

  const handleAssignRoleSuccess = () => {
    setShowAssignRole(false)
    setSelectedUser(null)
    fetchMembers(pagination.currentPage)
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Department</h1>
          <p className="text-sm text-gray-600">{user?.department?.name || 'Department'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/broadcast-memo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <FiSend className="w-4 h-4" />
            Broadcast Memo
          </button>
          <button 
            onClick={() => setShowAddMembers(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 flex items-center gap-2"
          >
            <FiUserPlus className="w-4 h-4" />
            Add Members
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Memos Sent</p>
              <p className="text-2xl font-bold text-gray-900">{memos.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
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
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'roles'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Roles
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
                          <th className="pb-3 text-xs font-medium text-gray-900"></th>
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
                            <td className="py-3 relative">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <FiMoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                              {openMenuId === member.id && (
                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-10">
                                  <button
                                    onClick={() => handleAssignRole(member)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <FiShield className="w-4 h-4" />
                                    Assign Role
                                  </button>
                                </div>
                              )}
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

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Department Roles</h3>
                  <p className="text-xs text-gray-600 mt-1">Manage roles for your department</p>
                </div>
                <button 
                  onClick={handleCreateRole}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Role
                </button>
              </div>
              
              {rolesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiShield className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{role.name}</h4>
                            <span className={`text-xs ${
                              role.is_active ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {role.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{role.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(role.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
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

      {showAddMembers && (
        <AddMembers 
          onClose={() => setShowAddMembers(false)} 
          onSuccess={() => {
            setShowAddMembers(false)
          }} 
        />
      )}

      {showRoleModal && (
        <RoleModal 
          onClose={() => {
            setShowRoleModal(false)
            setEditingRole(null)
          }}
          onSuccess={handleRoleSuccess}
          editRole={editingRole}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          onClose={() => {
            setShowDeleteConfirm(false)
            setDeletingRoleId(null)
          }}
          onConfirm={confirmDeleteRole}
          title="Delete Role"
          message="Are you sure you want to delete this role? This action cannot be undone."
          loading={deleteLoading}
        />
      )}

      {showAssignRole && (
        <AssignRoleModal
          onClose={() => {
            setShowAssignRole(false)
            setSelectedUser(null)
          }}
          onSuccess={handleAssignRoleSuccess}
          user={selectedUser}
          roles={roles}
        />
      )}
    </div>
  )
}

export default ManageDept
