import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  departmentAPI,
  roleAPI,
  userAPI,
  integrationAPI,
} from "../../services/api";
import { FiX, FiSearch } from "react-icons/fi";

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

  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [hasActiveIntegration, setHasActiveIntegration] = useState(false);
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
          active ? "success" : "info"
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
    try {
      const [deptResponse, rolesResponse] = await Promise.all([
        departmentAPI.getDepartments(token),
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
      showNotification("Failed to load departments and roles", "error");
    }
  };

  const handleLookup = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const response = await integrationAPI.lookupUser(searchId.trim(), token);
      if (response.status && response.data) {
        setFormData({
          firstName: response.data.first_name || "",
          lastName: response.data.last_name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          roleId: "",
          departmentId: "",
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
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
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
          <select
            value={formData.departmentId}
            onChange={(e) =>
              setFormData({ ...formData, departmentId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
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

        {integrationLoading
          ? renderIntegrationLoading()
          : hasActiveIntegration
            ? renderSearchBar()
            : renderForm()}
      </div>
    </div>,
    document.body,
  );
}

export default AddUser;
