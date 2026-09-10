import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  departmentAPI,
  roleAPI,
  userAPI,
  integrationAPI,
} from "../../services/api";
import { FiX, FiSearch, FiChevronDown } from "react-icons/fi";

const mergeDepartments = (base, extra) => {
  const map = new Map();
  [...base, ...extra].forEach((d) => map.set(String(d.id), d));
  return Array.from(map.values());
};

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
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const selectedDept = departments.find((d) => String(d.id) === String(value));

  useEffect(() => {
    setOptions((prev) => mergeDepartments(prev, departments));
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
      onDepartmentsChange((prev) => mergeDepartments(prev, [dept]));
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
        className="w-full overflow-hidden px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white flex items-center justify-between gap-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span
          className={`flex-1 min-w-0 truncate ${
            selectedDept ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {loading
            ? "Loading departments..."
            : selectedDept
            ? selectedDept.name
            : "Select department"}
        </span>
        <FiChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
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
          ref={dropdownRef}
          className={`absolute z-50 w-full max-w-[calc(100vw-4rem)] bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col ${
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
              options.map((dept) => (
                <li key={dept.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(dept)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                      String(dept.id) === String(value)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
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
  );
}

function AddUser({ onClose, onSuccess }) {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);

  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [hasActiveIntegration, setHasActiveIntegration] = useState(false);
  const [activeTab, setActiveTab] = useState("lookup");
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupPerformed, setLookupPerformed] = useState(false);

  useEffect(() => {
    checkIntegrationStatus();
    fetchDepartmentsAndRoles();
  }, []);

  const checkIntegrationStatus = async () => {
    setIntegrationLoading(true);
    try {
      const response = await integrationAPI.getIntegrationStatus();
      if (response.status && response.data) {
        const active = response.data.has_active_integration;
        setHasActiveIntegration(active);
        showNotification(
          active ? "Active Integrations confirmed" : "No Active Integrations",
          active ? "success" : "info",
        );
      }
    } catch (error) {
      console.error("Error checking integration status:", error);
      setHasActiveIntegration(false);
      showNotification("No Active Integrations", "info");
    } finally {
      setIntegrationLoading(false);
    }
  };

  const fetchDepartmentsAndRoles = async () => {
    setDepartmentsLoading(true);
    setDepartmentsError(null);
    try {
      const [deptResponse, rolesResponse] = await Promise.all([
        departmentAPI.getDepartments(token, { per_page: 600 }),
        roleAPI.getRoles(token),
      ]);

      if (deptResponse.status && deptResponse.data) {
        setDepartments(deptResponse.data.data);
      }

      if (rolesResponse.status && rolesResponse.data) {
        setRoles(rolesResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching departments and roles:", error);
      setDepartmentsError("Failed to load departments.");
      showNotification("Failed to load departments and roles", "error");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const resolveDepartmentId = (value, code) => {
    if (code) {
      const byId = departments.find(
        (d) => String(d.id).toLowerCase() === String(code).toLowerCase(),
      );
      if (byId) return byId.id;
      const byCode = departments.find(
        (d) =>
          (d.department_code || "").toLowerCase() ===
          String(code).toLowerCase(),
      );
      if (byCode) return byCode.id;
    }
    if (value == null) return "";
    let rawId = "";
    let rawName = "";
    if (typeof value === "object") {
      rawId = value.id || "";
      rawName = value.name || "";
    } else if (typeof value === "number" || /^\d+$/.test(String(value))) {
      rawId = String(value);
    } else {
      rawName = String(value);
    }
    const byDeptId = departments.find((d) => String(d.id) === String(rawId));
    if (byDeptId) return byDeptId.id;
    const byName = departments.find(
      (d) => (d.name || "").toLowerCase() === rawName.toLowerCase(),
    );
    return byName ? byName.id : "";
  };

  const handleLookup = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const response = await integrationAPI.lookupUser(searchId.trim(), token);
      if (response.status && response.data) {
        const code =
          response.data.department_code || response.data.department_id || "";
        const name = response.data.department_name || "";
        let resolvedDeptId = resolveDepartmentId(name, code);

        if (!resolvedDeptId && code) {
          setDepartments((prev) => {
            const exists = prev.some(
              (d) =>
                String(d.id).toLowerCase() === String(code).toLowerCase() ||
                (d.department_code || "").toLowerCase() ===
                  String(code).toLowerCase() ||
                (name && (d.name || "").toLowerCase() === name.toLowerCase()),
            );
            if (exists) return prev;
            return [
              ...prev,
              {
                id: code,
                department_code: code,
                name: name || code,
              },
            ];
          });
          resolvedDeptId = code;
        }

        setFormData({
          firstName: response.data.first_name || "",
          lastName: response.data.last_name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          roleId: "",
          departmentId: resolvedDeptId || "",
        });
        setLookupPerformed(true);
      } else {
        showNotification(response.message || "User not found", "error");
      }
    } catch (error) {
      console.error("Integration lookup error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to look up user";
      showNotification(message, "error");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await userAPI.createUser(
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          password: "password123",
          password_confirmation: "password123",
          department_id: formData.departmentId || null,
          role_id: formData.roleId || null,
        },
        token,
      );

      if (response.status) {
        showNotification("User created successfully", "success");
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      } else {
        showNotification(response.message || "Failed to create user", "error");
      }
    } catch (error) {
      console.error("User creation error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create user";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderIntegrationLoading = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="text-sm text-gray-600">
        Checking for an active integration...
      </p>
    </div>
  );

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        type="button"
        onClick={() => setActiveTab("lookup")}
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
          activeTab === "lookup"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Look Up by ID
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("manual")}
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
          activeTab === "manual"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Manual Entry
      </button>
    </div>
  );

  const renderSearchBar = () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Enter your institution's ID number to look up your details.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter ID number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={searching || !searchId.trim()}
            className="px-4 py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {lookupPerformed && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role (Optional)
              </label>
              <select
                value={formData.roleId}
                onChange={(e) =>
                  setFormData({ ...formData, roleId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department (Optional)
              </label>
              <SearchableDepartmentDropdown
                value={formData.departmentId}
                onChange={(id) =>
                  setFormData({ ...formData, departmentId: id })
                }
                token={token}
                departments={departments}
                onDepartmentsChange={setDepartments}
                loading={departmentsLoading}
                error={departmentsError}
                onRetry={fetchDepartmentsAndRoles}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role (Optional)
          </label>
          <select
            value={formData.roleId}
            onChange={(e) =>
              setFormData({ ...formData, roleId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department (Optional)
          </label>
          <SearchableDepartmentDropdown
            value={formData.departmentId}
            onChange={(id) => setFormData({ ...formData, departmentId: id })}
            token={token}
            departments={departments}
            onDepartmentsChange={setDepartments}
            loading={departmentsLoading}
            error={departmentsError}
            onRetry={fetchDepartmentsAndRoles}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add New User
            </h2>
            <p className="text-sm text-gray-600">Create a new user account</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {integrationLoading ? (
          renderIntegrationLoading()
        ) : hasActiveIntegration ? (
          <div>
            {renderTabs()}
            {activeTab === "lookup" ? renderSearchBar() : renderForm()}
          </div>
        ) : (
          renderForm()
        )}
      </div>
    </div>,
    document.body,
  );
}

export default AddUser;
