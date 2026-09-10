import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiChevronDown, FiSearch } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { departmentAPI, roleAPI } from '../../services/api'

function SearchableDepartmentDropdown({
  value,
  onChange,
  token,
  departments,
  onDepartmentsChange,
  loading = false,
  error = null,
  onRetry,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState(departments)
  const [searching, setSearching] = useState(false)
  const [pos, setPos] = useState(null)
  const containerRef = useRef(null)
  const triggerButtonRef = useRef(null)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  const selectedDept = departments.find((d) => String(d.id) === String(value))

  useEffect(() => {
    if (departments.length > 0) {
      setOptions(departments)
    }
  }, [departments])

  useLayoutEffect(() => {
    if (open && triggerButtonRef.current) {
      const rect = triggerButtonRef.current.getBoundingClientRect()
      const viewportH = window.innerHeight
      const spaceBelow = viewportH - rect.bottom
      const spaceAbove = rect.top
      const DROPDOWN_ESTIMATE = 240
      const up = spaceBelow < DROPDOWN_ESTIMATE
      setPos({
        left: rect.left,
        width: rect.width,
        top: up ? undefined : rect.bottom,
        bottom: up ? viewportH - rect.top : undefined,
        maxHeight: up ? spaceAbove - 8 : spaceBelow - 8,
      })
    }
  }, [open])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick)
      return () =>
        document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [open])

  const fetchDepartments = async (term) => {
    if (!term.trim()) {
      setOptions(departments)
      return
    }
    setSearching(true)
    try {
      const response = await departmentAPI.getDepartments(token, {
        search: term.trim(),
        per_page: 600,
      })
      const results =
        response.status && response.data ? response.data.data : []
      setOptions(results)
    } catch (error) {
      console.error('Department search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleQueryChange = (e) => {
    const term = e.target.value
    setQuery(term)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => fetchDepartments(term), 300)
  }

  const handleSelect = (dept) => {
    onChange(dept.id)
    if (onDepartmentsChange) {
      onDepartmentsChange((prev) => {
        const exists = prev.some((d) => String(d.id) === String(dept.id))
        return exists ? prev : [...prev, dept]
      })
    }
    setOpen(false)
    setQuery('')
  }

  const handleOpenToggle = () => {
    if (loading) return
    setOpen((prev) => !prev)
    if (!open) {
      setQuery('')
      setOptions(departments)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={handleOpenToggle}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white flex items-center justify-between gap-2 text-left disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <span
          className={`flex-1 min-w-0 truncate ${
            selectedDept ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {loading
            ? 'Loading departments...'
            : error
            ? 'Failed to load departments'
            : selectedDept
            ? selectedDept.name
            : 'No department restriction'}
        </span>
        <FiChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {error && !loading && (
        <div className="mt-1 flex items-center gap-2 justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <span className="flex-1 min-w-0 truncate">
            Failed to load departments
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col"
            style={{
              left: pos?.left,
              width: pos?.width,
              top: pos?.top,
              bottom: pos?.bottom,
              maxHeight: pos?.maxHeight,
            }}
          >
            <div className="p-2 border-b border-gray-200 flex items-center gap-2">
              <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search departments..."
                value={query}
                onChange={handleQueryChange}
                className="w-full text-sm outline-none focus:ring-0"
              />
            </div>
            <ul className="overflow-y-auto py-1">
              {searching ? (
                <li className="px-3 py-2 text-sm text-gray-500">
                  Searching...
                </li>
              ) : options.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">
                  No departments found
                </li>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onChange('')
                        setOpen(false)
                        setQuery('')
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        !value ? 'bg-gray-50 text-gray-900' : 'text-gray-900'
                      }`}
                    >
                      No department
                    </button>
                  </li>
                  {options.map((dept) => (
                    <li key={dept.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(dept)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          String(dept.id) === String(value)
                            ? 'bg-gray-50 text-gray-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {dept.name}
                      </button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}

function EditStep({ isOpen, onClose, step, onUpdateStep }) {
  const { token } = useAuth()
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState(false)
  const [departments, setDepartments] = useState([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [departmentsError, setDepartmentsError] = useState(false)
  const [stepName, setStepName] = useState('')
  const [description, setDescription] = useState('')
  const [assignedRoles, setAssignedRoles] = useState([])
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false)
  const [rolesPos, setRolesPos] = useState(null)
  const rolesContainerRef = useRef(null)
  const rolesButtonRef = useRef(null)
  const rolesDropdownRef = useRef(null)
  const [requiredDepartmentId, setRequiredDepartmentId] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [stepType, setStepType] = useState('')

  const toggleRole = (roleId) => {
    setAssignedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    )
  }

  const fetchRolesAndDepartments = useCallback(async () => {
    setRolesLoading(true)
    setRolesError(false)
    setDepartmentsLoading(true)
    setDepartmentsError(false)

    const fetchRoles = async () => {
      try {
        const rolesResponse = await roleAPI.getRoles(token)
        if (rolesResponse.status && rolesResponse.data) {
          setRoles(rolesResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
        setRolesError(true)
      } finally {
        setRolesLoading(false)
      }
    }

    const fetchDepartments = async () => {
      try {
        const departmentsResponse = await departmentAPI.getDepartments(token, {
          per_page: 600,
        })
        if (departmentsResponse.status && departmentsResponse.data) {
          setDepartments(departmentsResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
        setDepartmentsError(true)
      } finally {
        setDepartmentsLoading(false)
      }
    }

    fetchRoles()
    fetchDepartments()
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

  useLayoutEffect(() => {
    if (rolesDropdownOpen && rolesButtonRef.current) {
      const rect = rolesButtonRef.current.getBoundingClientRect()
      const viewportH = window.innerHeight
      const spaceBelow = viewportH - rect.bottom
      const spaceAbove = rect.top
      const DROPDOWN_ESTIMATE = 240
      const up = spaceBelow < DROPDOWN_ESTIMATE
      setRolesPos({
        left: rect.left,
        width: rect.width,
        top: up ? undefined : rect.bottom,
        bottom: up ? viewportH - rect.top : undefined,
        maxHeight: up ? spaceAbove - 8 : spaceBelow - 8,
      })
    }
  }, [rolesDropdownOpen])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        rolesButtonRef.current &&
        !rolesButtonRef.current.contains(e.target) &&
        rolesContainerRef.current &&
        !rolesContainerRef.current.contains(e.target) &&
        rolesDropdownRef.current &&
        !rolesDropdownRef.current.contains(e.target)
      ) {
        setRolesDropdownOpen(false)
      }
    }
    if (rolesDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      return () =>
        document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [rolesDropdownOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (stepName && step) {
      onUpdateStep({
        ...step,
        name: stepName,
        description,
        assignedRole: assignedRoles,
        requiredDepartmentId,
        timeLimit,
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
          <p className="text-sm text-gray-600">
            Configure the step properties and approval requirements
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Step Name
              </label>
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
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Step Type
              </label>
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
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this step does"
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative" ref={rolesContainerRef}>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Assigned Roles
              </label>
              <button
                ref={rolesButtonRef}
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
                  <span
                    className={
                      assignedRoles.length ? 'text-gray-900' : 'text-gray-400'
                    }
                  >
                    {assignedRoles.length > 0
                      ? `${assignedRoles.length} selected`
                      : 'Select one or more roles'}
                  </span>
                )}
                <FiChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {rolesError && !rolesLoading && (
                <div className="mt-1 flex items-center gap-2 justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <span className="flex-1 min-w-0 truncate">
                    Failed to load roles
                  </span>
                  <button
                    type="button"
                    onClick={fetchRolesAndDepartments}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {assignedRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {assignedRoles.map((id) => {
                    const role = roles.find((r) => r.id === id)
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
                    ) : null
                  })}
                </div>
              )}

              {rolesDropdownOpen &&
                createPortal(
                  <div
                    ref={rolesDropdownRef}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg py-1"
                    style={{
                      left: rolesPos?.left,
                      width: rolesPos?.width,
                      top: rolesPos?.top,
                      bottom: rolesPos?.bottom,
                      maxHeight: rolesPos?.maxHeight,
                      overflowY: 'auto',
                    }}
                  >
                    {rolesLoading ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-2">
                        <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></span>
                        <p className="text-sm text-gray-600">
                          Loading roles...
                        </p>
                      </div>
                    ) : rolesError ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-sm text-red-600">
                          Failed to load roles
                        </p>
                        <button
                          type="button"
                          onClick={fetchRolesAndDepartments}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    ) : roles.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">
                        No roles available
                      </p>
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
                          <span className="text-sm text-gray-900">
                            {role.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>,
                  document.body,
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Required Department (optional)
              </label>
              <SearchableDepartmentDropdown
                value={requiredDepartmentId}
                onChange={(id) => setRequiredDepartmentId(id)}
                token={token}
                departments={departments}
                onDepartmentsChange={setDepartments}
                loading={departmentsLoading}
                error={departmentsError}
                onRetry={fetchRolesAndDepartments}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Time Limit (hours)
              </label>
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