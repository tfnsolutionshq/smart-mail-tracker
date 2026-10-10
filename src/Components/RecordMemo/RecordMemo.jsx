import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiUser,
  FiCalendar,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { memoBaseUrl, departmentAPI } from "../../services/api";

const mergeDeptOptions = (base, extra) => {
  const map = new Map();
  [...(base || []), ...(extra || [])].forEach((d) => {
    if (d && d.id !== undefined) map.set(String(d.id), d);
  });
  return Array.from(map.values());
};

function DepartmentFilterDropdown({
  value,
  onChange,
  token,
  departments,
  loading = false,
  error = null,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(departments || []);
  const [searching, setSearching] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchSeqRef = useRef(0);

  const selectedDept = useMemo(() => {
    if (!value) return null;
    const all = mergeDeptOptions(departments, options);
    return all.find((d) => String(d.id) === String(value)) || null;
  }, [value, departments, options]);

  useEffect(() => {
    setOptions((prev) => mergeDeptOptions(departments, prev));
  }, [departments]);

  useLayoutEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 240);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const fetchDepartments = useCallback(
    async (term, seq) => {
      const q = (term || "").trim();
      if (!q) {
        setOptions(departments || []);
        setSearching(false);
        return;
      }
      // Instant client-side live filter for immediate feedback
      const lowered = q.toLowerCase();
      const localMatches = (departments || []).filter((d) =>
        String(d?.name || "")
          .toLowerCase()
          .includes(lowered),
      );
      setOptions(localMatches);
      if (!token) return;
      setSearching(true);
      try {
        const res = await departmentAPI.getDepartments(token, {
          search: q,
          per_page: 600,
        });
        if (seq !== searchSeqRef.current) return;
        const results =
          res?.data?.data || res?.data || res?.departments || [];
        const list = Array.isArray(results) ? results : [];
        setOptions(mergeDeptOptions(localMatches, list));
      } catch (err) {
        console.error("Department live search error:", err);
      } finally {
        if (seq === searchSeqRef.current) setSearching(false);
      }
    },
    [token, departments],
  );

  const handleQueryChange = (e) => {
    const term = e.target.value;
    setQuery(term);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    // Live: filter instantly on every keystroke, debounce only the server call
    const lowered = term.trim().toLowerCase();
    if (!lowered) {
      setOptions(departments || []);
      setSearching(false);
      return;
    }
    const localMatches = (departments || []).filter((d) =>
      String(d?.name || "")
        .toLowerCase()
        .includes(lowered),
    );
    setOptions(localMatches);
    const seq = searchSeqRef.current + 1;
    searchSeqRef.current = seq;
    searchTimeoutRef.current = setTimeout(() => fetchDepartments(term, seq), 300);
  };

  const handleSelect = (deptId) => {
    onChange(deptId);
    setOpen(false);
    setQuery("");
    setOptions(departments || []);
  };

  const handleOpenToggle = () => {
    if (loading) return;
    const next = !open;
    setOpen(next);
    if (next) {
      setQuery("");
      setOptions(departments || []);
      setSearching(false);
    }
  };

  return (
    // Width is bound to this container so the dropdown matches the input exactly
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={handleOpenToggle}
        disabled={loading}
        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5] flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300 text-left text-black disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="flex-1 min-w-0 truncate text-black">
          {loading
            ? "Loading departments..."
            : selectedDept
              ? selectedDept.name
              : "All Departments"}
        </span>
        <FiChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col overflow-hidden ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="p-2 border-b border-gray-200 flex items-center gap-2">
            <FiSearch className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search departments..."
              value={query}
              onChange={handleQueryChange}
              className="w-full text-xs text-black placeholder:text-black/60 outline-none focus:ring-0 bg-transparent"
            />
            {searching && (
              <FiRefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin flex-shrink-0" />
            )}
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            <li key="all">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-2.5 py-1.5 text-xs text-black hover:bg-gray-100 truncate ${
                  !value ? "bg-gray-100 font-medium" : ""
                }`}
              >
                All Departments
              </button>
            </li>
            {error ? (
              <li className="px-2.5 py-1.5 text-xs text-red-500">
                {error}
              </li>
            ) : searching && options.length === 0 ? (
              <li className="px-2.5 py-1.5 text-xs text-gray-500">
                Searching...
              </li>
            ) : options.length === 0 ? (
              <li className="px-2.5 py-1.5 text-xs text-gray-500">
                {query.trim()
                  ? `No departments found for "${query.trim()}"`
                  : "No departments found"}
              </li>
            ) : (
              options.map((dept) => (
                <li key={dept.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(String(dept.id))}
                    title={dept.name}
                    className={`w-full text-left px-2.5 py-1.5 text-xs text-black hover:bg-gray-100 truncate ${
                      String(dept.id) === String(value)
                        ? "bg-gray-100 font-medium"
                        : ""
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

export default function RecordMemo() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { user, token } = useAuth();
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const MAX_RETRIES = 3;

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(15);

  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(null);

  const fetchDepartmentsInitial = useCallback(async () => {
    if (!token) return;
    setDepartmentsLoading(true);
    setDepartmentsError(null);
    try {
      const res = await departmentAPI.getDepartments(token, {
        per_page: 600,
      });
      if (res?.status && res?.data) {
        setDepartments(res.data.data || res.data || []);
      } else {
        setDepartmentsError("Failed to load departments.");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartmentsError(err.message || "Failed to load departments.");
    } finally {
      setDepartmentsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDepartmentsInitial();
  }, [fetchDepartmentsInitial]);

  const buildParams = useCallback(() => {
    const params = {
      per_page: perPage,
      page: currentPage,
    };
    const q = debouncedSearch.trim();
    if (q) params.search = q;
    if (statusFilter) params.status = statusFilter;
    if (deptFilter) params.department_id = deptFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  }, [
    currentPage,
    perPage,
    debouncedSearch,
    statusFilter,
    deptFilter,
    priorityFilter,
    dateFrom,
    dateTo,
  ]);

  const fetchMemos = useCallback(
    async (attempt = 0) => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const params = buildParams();
        const response = await axios.get(`${memoBaseUrl}/external-memos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
          signal: abortControllerRef.current.signal,
        });
        if (response.data && response.data.data) {
          const dataObj = response.data.data;
          const allMemos = dataObj.data || [];
          const userMemos = allMemos
            .filter((memo) => {
              if (!user) return true;
              const isAssigned =
                String(memo.assigned_officer_id) === String(user.id);
              const isRecorder =
                String(memo.recorded_by_user_id) === String(user.id);
              return isAssigned || isRecorder;
            })
            .map((memo) => {
              let direction = "External";
              if (user) {
                if (String(memo.assigned_officer_id) === String(user.id))
                  direction = "Received";
                else if (String(memo.recorded_by_user_id) === String(user.id))
                  direction = "Sent";
              }

              return {
                id: memo.tracking_id || memo.id,
                uuid: memo.id,
                type: direction,
                originalType: "External",
                ref: memo.reference_number || "N/A",
                subject: memo.subject || "No Subject",
                origin: memo.sender_organization || "Unknown",
                department: memo.assigned_to?.department_name || "N/A",
                officer: memo.assigned_to?.name || "Unassigned",
                received: memo.date_received
                  ? new Date(memo.date_received).toLocaleDateString() +
                    " " +
                    new Date(
                      memo.created_at || memo.date_received,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : memo.created_at
                    ? new Date(memo.created_at).toLocaleDateString()
                    : "N/A",
                status: memo.status,
              };
            });
          setMemos(userMemos);
          setCurrentPage(dataObj.current_page || 1);
          setLastPage(dataObj.last_page || 1);
          setTotal(dataObj.total || 0);
          setLoading(false);
        } else {
          throw new Error("Unexpected response format from the server.");
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching external memos:", err);
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          retryTimeoutRef.current = setTimeout(
            () => fetchMemos(attempt + 1),
            delay,
          );
          return;
        }
        setError(err.message || "Failed to load memos. Please try again.");
        setLoading(false);
      }
    },
    [token, user, buildParams],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (token && user) {
      fetchMemos(0);
    }
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [token, user, fetchMemos]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDeptChange = (value) => {
    setDeptFilter(value);
    setCurrentPage(1);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-4 sm:p-4 lg:p-6 w-full mx-auto">
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Record Memo
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Record and track external and internal memos
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/track-memo")}
          className="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-colors"
        >
          <FiSearch className="mr-2 h-4 w-4" />
          Track Memo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div
          className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer"
          onClick={() => navigate("/record-external-memo")}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Record External Memo
                </h2>
                <p className="text-sm text-gray-600">
                  Record incoming memos from external organizations
                </p>
              </div>
            </div>
            <button
              className="text-blue-600 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/record-external-memo");
              }}
            >
              <FiArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiCheckCircle className="w-4 h-4 text-gray-500" />
              <span>Capture sender organization details</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiCheckCircle className="w-4 h-4 text-gray-500" />
              <span>Assign to department and officer</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiCheckCircle className="w-4 h-4 text-gray-500" />
              <span>Track movement timeline</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">Recent External</p>
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
              3
            </span>
          </div>
        </div>

        <div
          className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer"
          onClick={() => navigate("/record-memo-inbox")}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Check External Memo Inbox
                </h2>
                <p className="text-sm text-gray-600">
                  View and manage your assigned record memos
                </p>
              </div>
            </div>
            <button
              className="text-green-600 hover:text-green-700"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/record-memo-inbox");
              }}
            >
              <FiArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiCheckCircle className="w-4 h-4 text-gray-500" />
              <span>View assigned memos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiCheckCircle className="w-4 h-4 text-gray-500" />
              <span>Track memo status</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiCheckCircle className="w-4 h-4 text-gray-500" />
              <span>View movement timeline</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">Inbox Memos</p>
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
              {memos.length}
            </span>
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recorded</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-sm text-green-600">+12% this month</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600">Active memos</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-green-600">Successfully closed</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Processing</p>
              <p className="text-2xl font-bold text-gray-900">3.2d</p>
              <p className="text-sm text-gray-600">Average time</p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Memos</h2>
          <p className="text-sm text-gray-600">
            View and manage recorded memos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by subject, tracking ID, reference or sender"
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 bg-[#F3F3F5]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <DepartmentFilterDropdown
            value={deptFilter}
            onChange={handleDeptChange}
            token={token}
            departments={departments}
            loading={departmentsLoading}
            error={departmentsError}
          />
          <select
            value={priorityFilter}
            onChange={handlePriorityChange}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <br />
          <div className="flex">
            <div className="mr-3">
              <span className="text-xs mr-2">Date From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={handleDateFromChange}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
              />
            </div>
            <div>
              <span className="text-xs mr-2">Date To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={handleDateToChange}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button
                onClick={() => fetchMemos(0)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : (
            <table className="min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">
                    Tracking ID
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">
                    Type
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 hidden md:table-cell text-xs whitespace-nowrap">
                    Reference Number
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">
                    Subject
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 hidden lg:table-cell text-xs whitespace-nowrap">
                    Sender/Origin
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 hidden xl:table-cell text-xs whitespace-nowrap">
                    Department
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 hidden xl:table-cell text-xs whitespace-nowrap">
                    Officer
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 hidden md:table-cell text-xs whitespace-nowrap">
                    Date Received
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {memos.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 text-xs text-gray-900 whitespace-nowrap">
                      {m.id}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${
                          m.type === "Sent"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <FiFileText className="w-3 h-3" /> {m.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700 hidden md:table-cell whitespace-nowrap">
                      {m.ref}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 whitespace-nowrap">
                      {m.subject}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700 hidden lg:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <FiHome className="w-3.5 h-3.5 text-gray-500" />
                        {m.origin}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700 hidden xl:table-cell whitespace-nowrap">
                      {m.department}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700 hidden xl:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <FiUser className="w-3.5 h-3.5 text-gray-500" />
                        {m.officer}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700 hidden md:table-cell whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-gray-500" />
                        {m.received}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/view-external-memo?id=${m.uuid}`);
                        }}
                        className="px-2 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && memos.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-500">
            No memos found matching your filters.
          </div>
        )}

        {!loading && !error && total > 0 && lastPage > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
            <div className="text-xs text-gray-500">
              Showing page {currentPage} of {lastPage} • {total} total
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-3 h-3" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FiChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
