import React, { useState, useEffect, useCallback } from 'react'
import { FiX, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { departmentAPI, roleAPI } from '../../services/api'

function EditStep({ isOpen, onClose, step, onUpdateStep }) {
  const { token } = useAuth()
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState(false)
  const [departments, setDepartments] = useState([])
  const [stepName, setStepName] = useState('')
  const [description, setDescription] = useState('')
  const [assignedRoles, setAssignedRoles] = useState([])
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false)
  const [requiredDepartmentId, setRequiredDepartmentId] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [stepType, setStepType] = useState('')

  const toggleRole = (roleId) => {
    setAssignedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  }

  const fetchRolesAndDepartments = useCallback(async () => {
    setRolesLoading(true)
    setRolesError(false)
    try {
      const [rolesResponse, departmentsResponse] = await Promise.all([
        roleAPI.getRoles(token),
        departmentAPI.getDepartments(token)
      ])

      if (rolesResponse.status && rolesResponse.data) {
        setRoles(rolesResponse.data.data)
      }

      if (departmentsResponse.status && departmentsResponse.data) {
        setDepartments(departmentsResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching roles and departments:', error)
      setRolesError(true)
    } finally {
      setRolesLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isOpen) {
      fetchRolesAndDepartments()
    }
  }, [isOpen, fetchRolesAndDepartments])

  useEffect(() => {
    if (step) {
      setStepName(step.name || '')
      setDescription(step.description || '')
      setAssignedRoles(Array.isArray(step.assignedRole) ? step.assignedRole : (step.assignedRole ? [step.assignedRole] : []))
      setRequiredDepartmentId(step.requiredDepartmentId || '')
      setTimeLimit(step.timeLimit || '')
      setStepType(step.type || '')
    }
  }, [step])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (stepName && step) {
      onUpdateStep({
        ...step,
        name: stepName,
        description,
        assignedRole: assignedRoles,
        requiredDepartmentId,
        timeLimit
      })
      onClose()
    }
  }

  if (!isOpen || !step) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Step</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-600">Configure the step properties and approval requirements</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Step Name</label>
              <input
                type="text"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="New Step"
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Step Type</label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                disabled
              >
                <option value="approval">Approval</option>
                <option value="review">Review</option>
                <option value="notification">Notification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this step does"
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-900 mb-1">Assigned Roles</label>
              <button
                type="button"
                onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                disabled={rolesLoading}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-left flex items-center justify-between disabled:opacity-60"
              >
                {rolesLoading ? (
                  <span className="flex items-center gap-2 text-gray-400">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></span>
                    Loading roles...
                  </span>
                ) : rolesError ? (
                  <span className="text-red-600">Failed to load roles</span>
                ) : (
                  <span className={assignedRoles.length ? 'text-gray-900' : 'text-gray-400'}>
                    {assignedRoles.length > 0
                      ? `${assignedRoles.length} selected`
                      : 'Select one or more roles'}
                  </span>
                )}
                <FiChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {assignedRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {assignedRoles.map((id) => {
                    const role = roles.find((r) => r.id === id);
                    return role ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                      >
                        {role.name}
                        <button
                          type="button"
                          onClick={() => toggleRole(id)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {rolesDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setRolesDropdownOpen(false)}
                  ></div>
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto py-1">
                    {rolesLoading ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-2">
                        <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></span>
                        <p className="text-sm text-gray-600">Loading roles...</p>
                      </div>
                    ) : rolesError ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-sm text-red-600">Failed to load roles</p>
                        <button
                          type="button"
                          onClick={fetchRolesAndDepartments}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    ) : roles.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">No roles available</p>
                    ) : (
                      roles.map((role) => (
                        <label
                          key={role.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={assignedRoles.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                            className="accent-gray-900"
                          />
                          <span className="text-sm text-gray-900">{role.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Required Department (optional)</label>
              <select
                value={requiredDepartmentId}
                onChange={(e) => setRequiredDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              >
                <option value="">No department restriction</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">Time Limit (hours)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="48"
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
            >
              Save Step
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStep
