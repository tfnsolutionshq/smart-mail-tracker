import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react'
import { FiX, FiChevronDown, FiSearch, FiRefreshCw } from 'react-icons/fi'
import { departmentAPI, userAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const NO_DEPARTMENT_ID = "no-department";
const NO_DEPARTMENT = { id: NO_DEPARTMENT_ID, name: "No Department" };

const mergeDepartments = (base, extra) => {
  const map = new Map()
  ;[...(base || []), ...(extra || [])].forEach((d) => {
    if (d && d.id !== undefined) map.set(String(d.id), d)
  })
  return Array.from(map.values())
}

function DepartmentLiveSearch({
  value,
  onChange,
  token,
  departments,
  onDepartmentsMerge,
  loading = false,
  error = null,
  onRetry,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState(departments || [])
  const [searching, setSearching] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const containerRef = useRef(null)
  const timeoutRef = useRef(null)
  const seqRef = useRef(0)

  const selectedDept = useMemo(() => {
    if (!value) return null
    if (String(value) === NO_DEPARTMENT_ID) return NO_DEPARTMENT
    return mergeDepartments(departments, options).find(
      (d) => String(d.id) === String(value),
    ) || null
  }, [value, departments, options])

  useEffect(() => {
    setOptions((prev) => mergeDepartments(departments, prev))
  }, [departments])

  useLayoutEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < 240)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const runSearch = useCallback(
    async (term, seq) => {
      const q = (term || '').trim()
      if (!q) {
        setOptions(departments || [])
        setSearching(false)
        return
      }
      const lowered = q.toLowerCase()
      const localMatches = (departments || []).filter((d) =>
        String(d?.name || '').toLowerCase().includes(lowered),
      )
      setOptions(localMatches)
      if (!token) return
      setSearching(true)
      try {
        const res = await departmentAPI.getDepartments(token, {
          search: q,
          per_page: 600,
        })
        if (seq !== seqRef.current) return
        const results = res?.data?.data || res?.data || []
        setOptions(mergeDepartments(localMatches, Array.isArray(results) ? results : []))
      } catch (err) {
        console.error('Department live search error:', err)
      } finally {
        if (seq === seqRef.current) setSearching(false)
      }
    },
    [token, departments],
  )

  const handleQueryChange = (e) => {
    const term = e.target.value
    setQuery(term)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const lowered = term.trim().toLowerCase()
    if (!lowered) {
      setOptions(departments || [])
      setSearching(false)
      return
    }
    // instant live filter
    setOptions(
      (departments || []).filter((d) =>
        String(d?.name || '').toLowerCase().includes(lowered),
      ),
    )
    const seq = seqRef.current + 1
    seqRef.current = seq
    timeoutRef.current = setTimeout(() => runSearch(term, seq), 300)
  }

  const handleSelect = (dept) => {
    onChange(String(dept.id))
    if (String(dept.id) !== NO_DEPARTMENT_ID && onDepartmentsMerge) onDepartmentsMerge((prev) => mergeDepartments(prev, [dept]))
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (loading) return
          setOpen((p) => !p)
          setQuery('')
          setOptions(departments || [])
        }}
        className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 flex items-center justify-between gap-2 text-left disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="flex-1 min-w-0 truncate">
          {loading ? 'Loading departments...' : selectedDept ? selectedDept.name : 'Select Department'}
        </span>
        <FiChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
      </button>

      {error && (
        <div className="mt-1 flex items-center gap-2 justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="flex-1 min-w-0 truncate">{error}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col overflow-hidden ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <div className="p-2 border-b border-gray-200 flex items-center gap-2">
            <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search departments..."
              value={query}
              onChange={handleQueryChange}
              className="w-full text-sm text-black outline-none focus:ring-0 bg-transparent"
            />
            {searching && <FiRefreshCw className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {(!query.trim() || "no department".includes(query.trim().toLowerCase())) && (
              <li key={NO_DEPARTMENT_ID}>
                <button
                  type="button"
                  title="No Department"
                  onClick={() => handleSelect(NO_DEPARTMENT)}
                  className={`w-full text-left px-3 py-2 text-sm truncate hover:bg-blue-50 ${
                    String(value) === NO_DEPARTMENT_ID ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  No Department
                </button>
              </li>
            )}
            {searching && options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">Searching...</li>
            ) : options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                {query.trim() ? `No departments found for "${query.trim()}"` : 'No departments found'}
              </li>
            ) : (
              options.map((dept) => (
                <li key={dept.id}>
                  <button
                    type="button"
                    title={dept.name}
                    onClick={() => handleSelect(dept)}
                    className={`w-full text-left px-3 py-2 text-sm truncate hover:bg-blue-50 ${
                      String(dept.id) === String(value) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {dept.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ForwardMemo({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false
}) {
  const { token } = useAuth()

  const [departments, setDepartments] = useState([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [departmentsError, setDepartmentsError] = useState(null)

  const [officers, setOfficers] = useState([])
  const [officersLoading, setOfficersLoading] = useState(false)
  const [officersError, setOfficersError] = useState(null)

  const [departmentId, setDepartmentId] = useState('')
  const [officerId, setOfficerId] = useState('')
  const [remarks, setRemarks] = useState('')

  const fetchDepartments = useCallback(async () => {
    if (!token) return
    setDepartmentsLoading(true)
    setDepartmentsError(null)
    try {
      const deptRes = await departmentAPI.getDepartments(token, { per_page: 600 })
      if (deptRes?.status && deptRes?.data) {
        setDepartments(deptRes.data.data || deptRes.data || [])
      } else {
        setDepartmentsError('Failed to load departments.')
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartmentsError(error?.message || 'Failed to load departments.')
    } finally {
      setDepartmentsLoading(false)
    }
  }, [token])

  // Load all departments when modal opens; reset form when closed
  useEffect(() => {
    if (isOpen && token) {
      fetchDepartments()
    }
    if (!isOpen) {
      setDepartmentId('')
      setOfficerId('')
      setRemarks('')
      setOfficers([])
      setOfficersError(null)
    }
  }, [isOpen, token, fetchDepartments])

  const fetchOfficers = useCallback(async (deptId) => {
    if (!token || !deptId) {
      setOfficers([])
      return
    }
    setOfficersLoading(true)
    setOfficersError(null)
    setOfficers([])
    try {
      const res = await userAPI.getDepartmentUsers(deptId, token)
      if (res?.status && res?.data) {
        setOfficers(Array.isArray(res.data) ? res.data : res.data.data || [])
      } else {
        setOfficersError('Failed to load officers.')
      }
    } catch (error) {
      console.error('Error fetching officers:', error)
      setOfficersError(error?.message || 'Failed to load officers.')
    } finally {
      setOfficersLoading(false)
    }
  }, [token])

  // Fetch officers whenever the selected department changes
  // "No Department" loads users from /users/departments/none
  useEffect(() => {
    if (!isOpen) return
    setOfficerId('')
    if (!departmentId) {
      setOfficers([])
      setOfficersError(null)
      setOfficersLoading(false)
      return
    }
    if (String(departmentId) === NO_DEPARTMENT_ID) {
      fetchOfficers("none")
      return
    }
    fetchOfficers(departmentId)
  }, [departmentId, isOpen, fetchOfficers])

  const isNoDepartment = String(departmentId) === NO_DEPARTMENT_ID

  const handleDepartmentChange = (id) => {
    setDepartmentId(id)
  }

  const handleSubmit = () => {
    // Find the selected officer to get their email
    const selectedOfficer = officers.find(o => String(o.id) === String(officerId))

    onConfirm({
      departmentId: isNoDepartment ? null : departmentId,
      officerId: officerId || null,
      email: selectedOfficer ? selectedOfficer.email : '',
      remarks
    })
  }

  if (!isOpen) return null

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
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900">Department</label>
              <DepartmentLiveSearch
                value={departmentId}
                onChange={handleDepartmentChange}
                token={token}
                departments={departments}
                onDepartmentsMerge={setDepartments}
                loading={departmentsLoading}
                error={departmentsError}
                onRetry={fetchDepartments}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900">Officer</label>
              <div className="relative">
                <select
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  disabled={!departmentId || officersLoading || !!officersError}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!departmentId
                      ? 'Select a department first'
                      : officersLoading
                        ? 'Loading officers...'
                        : officersError
                          ? 'Failed to load officers'
                          : officers.length === 0
                            ? 'No officers found'
                            : 'Select Officer'}
                  </option>
                  {officers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {officersLoading
                    ? <FiRefreshCw className="h-4 w-4 animate-spin" />
                    : <FiChevronDown className="h-4 w-4" />}
                </div>
              </div>
              {officersError && departmentId && (
                <div className="mt-1 flex items-center gap-2 justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="flex-1 min-w-0 truncate">{officersError}</span>
                  <button
                    type="button"
                    onClick={() => fetchOfficers(isNoDepartment ? "none" : departmentId)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
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
              disabled={isProcessing || departmentsLoading || officersLoading || !departmentId || !officerId}
              className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing && (
                <svg className="animate-spin h-3 w-3 text-white" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isProcessing ? 'Forwarding...' : 'Forward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
