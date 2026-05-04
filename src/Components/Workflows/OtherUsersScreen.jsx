import React, { useState, useEffect, useCallback } from 'react'
import { FiSearch, FiCopy, FiDollarSign, FiFileText, FiUsers, FiShield, FiClock, FiFilter } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { workflowAPI, roleAPI, categoryAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

function normalizeWorkflowList(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  return []
}

function OtherUsersScreen() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showNotification } = useNotification()
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
    if (!token) {
      return
    }

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
        workflowAPI.getActiveWorkflows(token, params),
        roleAPI.getRoles(token),
      ])

      if (workflowResponse.status) {
        setWorkflows(normalizeWorkflowList(workflowResponse.data))
      }

      if (roleResponse.status && roleResponse.data) {
        setRoles(roleResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching workflows:', error)
      if (error.response?.status === 401) {
        showNotification('Session expired. Please login again.', 'error')
      } else {
        showNotification('Failed to fetch workflows', 'error')
      }
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
    if (token) {
      fetchWorkflows()
    }
  }, [token, fetchWorkflows])

  return (
    <div className='p-4 sm:p-4 lg:p-5 w-full mx-auto'>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Available Workflows</h2>
          <p className="text-gray-600 text-sm mt-1">View available workflow templates</p>
        </div>

        {/* Search + category always visible; more filters toggled (GET /workflows/active) */}
        <div className="space-y-3">
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
              title="Role, estimated time range"
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
      </div>

      {/* Workflow Cards */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
            <ViewOnlyWorkflowCard 
              key={workflow.id} 
              workflow={workflow}
              roles={roles}
              onUseTemplate={() => navigate(`/create-workflow?template=${workflow.id}`)}
            />
          ))}
        </div>
      )}

    </div>
  )
}

function ViewOnlyWorkflowCard({ workflow, roles, onUseTemplate }) {
  const navigate = useNavigate()
  const getRoleName = (roleId) => {
    if (!Array.isArray(roles) || !roleId) return 'Unknown Role'
    const role = roles.find(r => r.id === roleId)
    return role ? role.name : 'Unknown Role'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer" onClick={() => navigate(`/workflow/${workflow.id}`)}>
      {/* Header */}
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
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {workflow.estimated_completion_time}h est.
            </span>
          </div>
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
      {/* <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 mb-1">{workflow.total_active_memos}</div>
          <div className="text-xs text-gray-600">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 mb-1">{workflow.total_completed_memos}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 mb-1">{workflow.success_rate}%</div>
          <div className="text-xs text-gray-600">Success</div>
        </div>
      </div> */}

      {/* Actions - Use Template */}
      {/* <div className="flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onUseTemplate() }}
          className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
        >
          <FiCopy className="w-4 h-4" />
          Use Template
        </button>
      </div> */}
    </div>
  )
}

export default OtherUsersScreen