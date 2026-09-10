import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import {
  FiX,
  FiCheck,
  FiEye,
  FiBell,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { departmentAPI, roleAPI } from "../../services/api";

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(departments);
  const [searching, setSearching] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const selectedDept = departments.find((d) => String(d.id) === String(value));

  useEffect(() => {
    if (departments.length > 0) {
      setOptions(departments);
    }
  }, [departments]);

  useLayoutEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom;
      const DROPDOWN_ESTIMATE = 240;
      setDropUp(spaceBelow < DROPDOWN_ESTIMATE);
    }
  }, [open]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [open]);

  const fetchDepartments = async (term) => {
    if (!term.trim()) {
      setOptions(departments);
      return;
    }
    setSearching(true);
    try {
      const response = await departmentAPI.getDepartments(token, {
        search: term.trim(),
        per_page: 600,
      });
      const results =
        response.status && response.data ? response.data.data : [];
      setOptions(results);
    } catch (error) {
      console.error("Department search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleQueryChange = (e) => {
    const term = e.target.value;
    setQuery(term);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchDepartments(term), 300);
  };

  const handleSelect = (dept) => {
    onChange(dept.id);
    if (onDepartmentsChange) {
      onDepartmentsChange((prev) => {
        const exists = prev.some((d) => String(d.id) === String(dept.id));
        return exists ? prev : [...prev, dept];
      });
    }
    setOpen(false);
    setQuery("");
  };

  const handleOpenToggle = () => {
    if (loading) return;
    setOpen((prev) => !prev);
    if (!open) {
      setQuery("");
      setOptions(departments);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpenToggle}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white flex items-center justify-between gap-2 text-left disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <span
          className={`flex-1 min-w-0 truncate ${
            selectedDept ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {loading
            ? "Loading departments..."
            : error
              ? "Failed to load departments"
              : selectedDept
                ? selectedDept.name
                : "No department restriction"}
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

      {open && (
        <div
          className={`absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg flex flex-col ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
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
              className="w-full text-sm outline-none focus:ring-0"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {searching ? (
              <li className="px-3 py-2 text-sm text-gray-500">Searching...</li>
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
                      onChange("");
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      !value ? "bg-gray-50 text-gray-900" : "text-gray-900"
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
                          ? "bg-gray-50 text-gray-900"
                          : "text-gray-900"
                      }`}
                    >
                      {dept.name}
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function AddStep({ isOpen, onClose, onAddStep }) {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState("");
  const [stepName, setStepName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [rolesDropUp, setRolesDropUp] = useState(false);
  const rolesContainerRef = useRef(null);
  const [requiredDepartmentId, setRequiredDepartmentId] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(false);

  const toggleRole = (roleId) => {
    setAssignedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const stepTypes = [
    {
      id: "approval",
      name: "Approval",
      description: "Requires approval from assigned role",
      icon: FiCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "review",
      name: "Review",
      description: "Review and comment, no approval required",
      icon: FiEye,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "notification",
      name: "Notification",
      description: "Send notification to specified roles",
      icon: FiBell,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  const fetchRolesAndDepartments = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(false);
    setDepartmentsLoading(true);
    setDepartmentsError(false);

    const fetchRoles = async () => {
      try {
        const rolesResponse = await roleAPI.getRoles(token);
        if (rolesResponse.status && rolesResponse.data) {
          setRoles(rolesResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRolesError(true);
      } finally {
        setRolesLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const departmentsResponse = await departmentAPI.getDepartments(token, {
          per_page: 600,
        });
        if (departmentsResponse.status && departmentsResponse.data) {
          setDepartments(departmentsResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartmentsError(true);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchRoles();
    fetchDepartments();
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchRolesAndDepartments();
    }
  }, [isOpen, fetchRolesAndDepartments]);

  useLayoutEffect(() => {
    if (rolesDropdownOpen && rolesContainerRef.current) {
      const rect = rolesContainerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom;
      const DROPDOWN_ESTIMATE = 240;
      setRolesDropUp(spaceBelow < DROPDOWN_ESTIMATE);
    }
  }, [rolesDropdownOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedType && stepName) {
      const stepType = stepTypes.find((type) => type.id === selectedType);
      onAddStep({
        id: Date.now(),
        type: selectedType,
        name: stepName,
        description,
        assignedRole: assignedRoles,
        requiredDepartmentId,
        timeLimit,
        icon: stepType.icon,
        color: stepType.color,
      });
      setSelectedType("");
      setStepName("");
      setDescription("");
      setAssignedRoles([]);
      setRequiredDepartmentId("");
      setTimeLimit("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add New Step</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Step Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Step Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stepTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-start gap-2 p-3 border rounded-lg text-left transition-colors ${
                      selectedType === type.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`p-1 rounded ${type.color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {type.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Details */}
          {selectedType && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Step Name
                </label>
                <input
                  type="text"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="Enter step name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this step does"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative" ref={rolesContainerRef}>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Assigned Roles
                  </label>
                  <button
                    type="button"
                    onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                    disabled={rolesLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-left flex items-center justify-between disabled:bg-gray-50"
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
                          assignedRoles.length
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {assignedRoles.length > 0
                          ? `${assignedRoles.length} selected`
                          : "Select one or more roles"}
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
                      <div className={`absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto py-1 ${
                        rolesDropUp ? "bottom-full mb-1" : "top-full mt-1"
                      }`}>
                        {rolesLoading ? (
                          <div className="flex items-center justify-center py-6 space-y-2 flex-col">
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
                      </div>
                    </>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </>
          )}

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
              disabled={!selectedType || !stepName}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Add Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStep;
