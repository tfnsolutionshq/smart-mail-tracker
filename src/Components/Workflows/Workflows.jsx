import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FiSearch, FiDownload, FiPlus, FiMoreHorizontal, FiEdit, FiCopy, FiPause, FiClock, FiTrendingUp, FiPercent, FiPlay, FiFilter } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { workflowAPI, roleAPI, categoryAPI } from '../../services/api'
import Templates from './Templates'
import ConfirmationModal from './ConfirmationModal'

function normalizeWorkflowList(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  return []
}

function Workflows() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState('Overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [estimatedTimeMin, setEstimatedTimeMin] = useState('')
  const [estimatedTimeMax, setEstimatedTimeMax] = useState('')
  const [workflows, setWorkflows] = useState([])
  const [categories, setCategories] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const tabs = ['Overview', 'Templates']
  const advancedFilterCount =
    (selectedRoleId ? 1 : 0) +
    (estimatedTimeMin !== '' ? 1 : 0) +
    (estimatedTimeMax !== '' ? 1 : 0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    if (!token) return
    const loadCategories = async () => {
      try {
        const res = await categoryAPI.getCategories(token)
        if (res.status && res.data?.data) {
          setCategories(res.data.data)
        }
      } catch (e) {
        console.error('Error fetching categories:', e)
      }
    }
    loadCategories()
  }, [token])

  const fetchWorkflows = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (selectedCategoryId) {
        params.category_id = selectedCategoryId
        const cat = categories.find((c) => String(c.id) === String(selectedCategoryId))
        if (cat?.name) params.category = cat.name
      }
      if (selectedRoleId) params.roles = selectedRoleId
      if (estimatedTimeMin !== '') params.estimated_time_min = estimatedTimeMin
      if (estimatedTimeMax !== '') params.estimated_time_max = estimatedTimeMax

      const [workflowResponse, roleResponse] = await Promise.all([
        workflowAPI.getWorkflows(token, params),
        roleAPI.getRoles(token),
      ])

      if (workflowResponse.status) {
        setWorkflows(normalizeWorkflowList(workflowResponse.data))
      }

      if (roleResponse.status && roleResponse.data) {
        setRoles(roleResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Failed to fetch workflows', 'error')
    } finally {
      setLoading(false)
    }
  }, [
    token,
    debouncedSearch,
    selectedCategoryId,
    selectedRoleId,
    estimatedTimeMin,
    estimatedTimeMax,
    categories,
  ])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const activeWorkflows = workflows.filter(w => w.is_active).length
  const totalPending = workflows.reduce((sum, w) => sum + w.total_active_memos, 0)
  const avgCompletionTime = workflows.length > 0 ? 
    Math.round(workflows.reduce((sum, w) => sum + w.average_completion_time, 0) / workflows.length) : 0
  const successRate = workflows.length > 0 ? 
    Math.round(workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length) : 0

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Workflow Management</h1>
            <p className="text-gray-600 text-sm mt-1">Design, manage, and monitor your organization's approval workflows</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              <FiDownload className="w-4 h-4" />
              Import Template
            </button> */}
            <button 
              onClick={() => navigate('/create-workflow')}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={FiTrendingUp}
            label="Active Workflows"
            value={activeWorkflows.toString()}
            color="green"
          />
          <StatCard
            icon={FiClock}
            label="Pending Approvals"
            value={totalPending.toString()}
            color="yellow"
          />
          <StatCard
            icon={FiClock}
            label="Avg. Completion Time"
            value={`${avgCompletionTime}h`}
            color="blue"
          />
          <StatCard
            icon={FiPercent}
            label="Success Rate"
            value={`${successRate}%`}
            color="purple"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
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
        
        <div className="p-6">
          {activeTab === 'Overview' && (
            <>
              {/* Search, category (always visible); more filters behind toggle */}
              <div className="mb-6 space-y-3">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search workflows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-[160px] sm:max-w-xs bg-white"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters((open) => !open)}
                    aria-expanded={showAdvancedFilters}
                    aria-label={showAdvancedFilters ? 'Hide extra filters' : 'Show extra filters'}
                    title="Role, estimated time"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      showAdvancedFilters || advancedFilterCount > 0
                        ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    <span className="hidden sm:inline">More filters</span>
                    {advancedFilterCount > 0 && (
                      <span className="text-xs tabular-nums min-w-[1.25rem] px-1.5 rounded bg-white/20 text-white">
                        {advancedFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {showAdvancedFilters && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Refine by</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Role</label>
                        <select
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-sm w-full"
                        >
                          <option value="">All roles</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Est. time min (hours)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Min"
                          value={estimatedTimeMin}
                          onChange={(e) => setEstimatedTimeMin(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-sm w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Est. time max (hours)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max"
                          value={estimatedTimeMax}
                          onChange={(e) => setEstimatedTimeMax(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-sm w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Workflow Cards */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {workflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} roles={roles} onWorkflowUpdate={fetchWorkflows} />
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'Templates' && <Templates workflows={workflows} />}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-gray-600 text-xs font-medium mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function WorkflowCard({ workflow, roles, onWorkflowUpdate }) {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showNotification } = useNotification()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!showMenu) return
    const onMouseDown = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return
      setShowMenu(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showMenu])
  
  const handleCardClick = () => {
    navigate(`/workflow-admin/${workflow.id}`)
  }
  
  const getRoleName = (roleId) => {
    if (!Array.isArray(roles) || !roleId) return 'Unknown Role'
    const role = roles.find(r => r.id === roleId)
    return role ? role.name : 'Unknown Role'
  }
  
  const handleEditWorkflow = () => {
    navigate(`/edit-workflow/${workflow.id}`)
    setShowMenu(false)
  }
  
  const handleDeleteWorkflow = async () => {
    setLoading(true)
    try {
      const response = await workflowAPI.deleteWorkflow(workflow.id, token)
      if (response.status) {
        showNotification('Workflow deleted successfully', 'success')
        onWorkflowUpdate()
      }
    } catch (error) {
      console.error('Error deleting workflow:', error)
      showNotification('Failed to delete workflow', 'error')
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setShowMenu(false)
    }
  }
  
  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const response = await workflowAPI.toggleWorkflowStatus(workflow.id, token)
      if (response.status) {
        showNotification(`Workflow ${workflow.is_active ? 'deactivated' : 'activated'} successfully`, 'success')
        onWorkflowUpdate()
      }
    } catch (error) {
      console.error('Error toggling workflow status:', error)
      showNotification('Failed to update workflow status', 'error')
    } finally {
      setLoading(false)
      setShowStatusModal(false)
      setShowMenu(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer" onClick={handleCardClick}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900">{workflow.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {workflow.is_active ? 'active' : 'inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{workflow.category_name}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{workflow.estimated_completion_time}h est.</span>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiMoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); handleEditWorkflow() }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FiEdit className="w-4 h-4" />
                Edit Workflow
              </button>
              {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <FiCopy className="w-4 h-4" />
                Clone Workflow
              </button> */}
              <button 
                onClick={(e) => { e.stopPropagation(); setShowStatusModal(true); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {workflow.is_active ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                {workflow.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); setShowMenu(false) }}
                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Steps (preview first 3, show +remaining) */}
      {/* <div className="mb-4"> 
        <h4 className="text-sm font-medium text-gray-900 mb-3">Workflow Steps ({workflow.steps.length})</h4>
        <div className="space-y-2">
          {workflow.steps.slice(0, 3).map((step) => (
            <div key={step.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">{step.order}</span>
                <span className="text-gray-900">{step.name}</span>
                <span className={`px-1 py-0.5 text-xs rounded ${
                  step.type === 'Approval' ? 'bg-green-100 text-green-700' :
                  step.type === 'Review' ? 'bg-blue-100 text-blue-700' :
                  step.type === 'Notification' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {step.type}
                </span>
                {step.required_role && (
                  <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {getRoleName(step.required_role)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{step.time_limit}h</span>
            </div>
          ))}
          {workflow.steps.length > 3 && (
            <div className="text-xs text-gray-500">+{workflow.steps.length - 3} more steps</div>
          )}
        </div>
      </div> */}

      {/* Key Features */}
      {/* {workflow.key_features && workflow.key_features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Key Features</h4>
          <div className="flex flex-wrap gap-2">
            {workflow.key_features.map((feature, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )} */}

      {/* Metrics */}
      {/* <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900 mb-1">{workflow.total_active_memos}</div>
          <div className="text-xs text-gray-600 mb-2">Active</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600 mb-1">{workflow.total_completed_memos}</div>
          <div className="text-xs text-gray-600 mb-2">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600 mb-1">{workflow.success_rate}%</div>
          <div className="text-xs text-gray-600 mb-2">Success</div>
        </div>
      </div> */}
      
      {/* Progress Bar */}
      {/* <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gray-900 h-2 rounded-full" 
            style={{ width: `${workflow.success_rate}%` }}
          ></div>
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">{workflow.average_completion_time}h avg</span>
        </div>
      </div> */}
      
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteWorkflow}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        loading={loading}
      />
      
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleToggleStatus}
        title={`${workflow.is_active ? 'Deactivate' : 'Activate'} Workflow`}
        message={`Are you sure you want to ${workflow.is_active ? 'deactivate' : 'activate'} "${workflow.name}"?`}
        confirmText={workflow.is_active ? 'Deactivate' : 'Activate'}
        confirmColor={workflow.is_active ? 'yellow' : 'red'}
        loading={loading}
      />
    </div>
  )
}

export default Workflows