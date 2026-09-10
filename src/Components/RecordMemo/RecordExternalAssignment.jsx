import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  FiArrowLeft,
  FiChevronRight,
  FiCheck,
  FiHome,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { departmentAPI, userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const mergeDepartments = (base, extra) => {
  const map = new Map();
  [...base, ...extra].forEach((d) => map.set(String(d.id), d));
  return Array.from(map.values());
};

const NO_DEPARTMENT_OPTION = { id: "none", name: "No department" };

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

  const selectedDept =
    departments.find((d) => String(d.id) === String(value)) ||
    (String(value) === "none" ? NO_DEPARTMENT_OPTION : null);

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
    if (onDepartmentsChange && dept.id !== "none") {
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
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={handleOpenToggle}
        disabled={loading}
        className="w-full overflow-hidden px-3 py-2 border border-gray-300 rounded-lg text-sm bg-[#F3F3F5] flex items-center justify-between gap-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left disabled:opacity-60 disabled:cursor-not-allowed"
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
            <li key="none">
              <button
                type="button"
                onClick={() => handleSelect(NO_DEPARTMENT_OPTION)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                  String(value) === "none"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {NO_DEPARTMENT_OPTION.name}
              </button>
            </li>
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

export default function RecordExternalAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const previousData = location.state || {};

  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [loadingOfficers, setLoadingOfficers] = useState(false);

  const [departmentId, setDepartmentId] = useState(
    previousData.departmentId || "",
  );
  const [officerId, setOfficerId] = useState(previousData.officerId || "");
  const [remarks, setRemarks] = useState(previousData.remarks || "");

  const fetchDepartments = useCallback(async () => {
    setLoadingDepartments(true);
    setDepartmentsError(null);
    try {
      const deptRes = await departmentAPI.getDepartments(token, {
        per_page: 600,
      });
      if (deptRes.status && deptRes.data) {
        setDepartments(deptRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartmentsError("Failed to load departments. Please try again.");
    } finally {
      setLoadingDepartments(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchDepartments();
  }, [fetchDepartments, token]);

  useEffect(() => {
    if (!token || !departmentId) {
      setOfficers([]);
      setOfficerId("");
      setLoadingOfficers(false);
      return;
    }

    setLoadingOfficers(true);
    setOfficers([]);
    setOfficerId("");

    const fetchOfficers = async () => {
      try {
        const userRes = await userAPI.getDepartmentUsers(departmentId, token);
        if (userRes.status && userRes.data) {
          setOfficers(userRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching officers:", error);
      } finally {
        setLoadingOfficers(false);
      }
    };
    fetchOfficers();
  }, [token, departmentId]);

  const isFormValid = departmentId && officerId && remarks;

  const handleNext = () => {
    if (!isFormValid) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    const selectedDept = departments.find(
      (d) => d.id === parseInt(departmentId) || d.id === departmentId,
    );
    const selectedOfficer = officers.find(
      (u) => u.id === parseInt(officerId) || u.id === officerId,
    );

    navigate("/record-external-review", {
      state: {
        ...previousData,
        departmentId,
        officerId,
        department:
          departmentId === "none"
            ? "No department"
            : selectedDept
              ? selectedDept.name
              : "",
        officer: selectedOfficer
          ? `${selectedOfficer.first_name} ${selectedOfficer.last_name}`
          : "",
        remarks,
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4 lg:py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Record External Memo
      </h1>
      <p className="text-gray-600 text-sm mt-1">
        Record incoming memo from external organization
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center sm:flex-nowrap flex-wrap gap-4 sm:gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                <FiCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Metadata</p>
                <p className="text-xs text-gray-600">Basic information</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-600">
              <span className="w-8 h-px bg-green-600"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                <FiCheck className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Attachments
                </p>
                <p className="text-xs text-gray-600">Upload files (optional)</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-600">
              <span className="w-8 h-px bg-green-600"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Assignment
                </p>
                <p className="text-xs text-gray-600">Department & officer</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400">
              <span className="w-8 h-px bg-gray-200"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center">
                4
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Review</p>
                <p className="text-xs text-gray-600">Confirm details</p>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-3 w-full bg-gray-200 h-1 rounded-full">
          <div className="bg-black h-1 rounded-full" style={{ width: '75%' }}></div>
        </div> */}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6">
        <div>
          <p className="text-sm font-semibold text-gray-900">Assignment</p>
          <p className="text-xs text-gray-600">Department & officer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">
              Assign to Department <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center gap-2">
              <span className="w-8 h-10 rounded-lg bg-[#F3F3F5] border border-gray-300 flex items-center justify-center flex-shrink-0">
                <FiHome className="w-4 h-4 text-gray-600" />
              </span>
              <SearchableDepartmentDropdown
                value={departmentId}
                onChange={setDepartmentId}
                token={token}
                departments={departments}
                onDepartmentsChange={setDepartments}
                loading={loadingDepartments}
                error={departmentsError}
                onRetry={fetchDepartments}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">
              Assign to Officer <span className="text-red-500">*</span>
            </label>
            <select
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]"
              disabled={loadingOfficers}
            >
              <option value="">
                {loadingOfficers ? "Loading officers..." : "Select officer"}
              </option>
              {officers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} (
                  {user.role?.name || "User"})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">
              Assignment Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any special instructions or notes for the assigned officer"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 bg-[#F3F3F5]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg"
            onClick={() =>
              navigate("/record-external-attachments", {
                state: { ...previousData, departmentId, officerId, remarks },
              })
            }
          >
            Previous
          </button>
          <button
            disabled={!isFormValid}
            className={`px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg flex items-center gap-2 ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleNext}
          >
            Next
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
