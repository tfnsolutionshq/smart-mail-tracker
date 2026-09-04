"use client";

import {
  FiGrid,
  FiMail,
  FiGitBranch,
  FiBarChart2,
  FiSettings,
  FiEdit3,
  FiUsers,
  FiX,
  FiFileText,
  FiSearch,
  FiBriefcase,
  FiSliders,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/compose-memo") return "compose";
    if (path === "/record-memo") return "recordmemo";
    if (path === "/track-memo") return "trackmemo";
    if (path === "/manage-dept") return "managedept";
    if (path === "/view-department") return "viewdept";
    if (path === "/mailbox") return "mailbox";
    if (path === "/workflows") return "workflows";
    if (path === "/reports") return "reports";
    // if (path.startsWith('/users')) return 'users'
    if (path === "/administration") return "administration";
    if (path === "/settings") return "settings";
    return "dashboard";
  };

  const activeItem = getActiveItem();

  const isAdmin = role === "admin";
  const isDepartmentHead = role === "department head";

  const formatRole = (role) => {
    const roleMap = {
      admin: "Admin",
      department_head: "Head of Department",
      dean: "Dean",
      academic_dean: "Academic Dean",
      provost: "Provost",
    };
    return roleMap[role] || "User";
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const mainMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiGrid, path: "/dashboard" },
    {
      id: "compose",
      label: "Compose Memo",
      icon: FiEdit3,
      path: "/compose-memo",
    },
    {
      id: "recordmemo",
      label: "Record Memo",
      icon: FiFileText,
      path: "/record-memo",
    },
    {
      id: "trackmemo",
      label: "Memo Tracker",
      icon: FiSearch,
      path: "/track-memo",
    },
    {
      id: "mailbox",
      label: "Mailbox",
      icon: FiMail,
      count: 12,
      path: "/mailbox",
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: FiGitBranch,
      count: 5,
      path: "/workflows",
    },
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  const systemMenuItems = [
    { id: "reports", label: "Reports", icon: FiBarChart2, path: "/reports" },
    // { id: "users", label: "Users", icon: FiUsers, path: "/users" },
    {
      id: "administration",
      label: "Administration",
      icon: FiSliders,
      path: "/administration",
    },
    // { id: "settings", label: "Settings", icon: FiSettings, path: "/settings" },
  ];

  // Filter system menu items based on role
  const filteredSystemMenuItems = isAdmin ? systemMenuItems : [];

  const filteredDepartmentItems = !isAdmin
    ? isDepartmentHead
      ? [
          {
            id: "managedept",
            label: "Manage Dept",
            icon: FiBriefcase,
            path: "/manage-department",
          },
        ]
      : [
          {
            id: "viewdept",
            label: "View Dept",
            icon: FiBriefcase,
            path: "/view-department",
          },
        ]
    : [];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen
            ? "w-60 translate-x-0"
            : "w-[70px] -translate-x-full lg:translate-x-0"
        } bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden lg:relative fixed lg:translate-x-0 h-full z-30`}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={!isOpen ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Department Section */}
          {!isAdmin && filteredDepartmentItems.length > 0 && (
            <>
              <div className="pt-4">
                {isOpen && (
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                    DEPARTMENT
                  </p>
                )}
                {!isOpen && <hr className="border-gray-200 mb-2" />}
                {filteredDepartmentItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={!isOpen ? item.label : ""}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {isOpen && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* System Section - Only show for admin */}
          {isAdmin && filteredSystemMenuItems.length > 0 && (
            <div className="pt-4">
              {isOpen && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  SYSTEM
                </p>
              )}
              {!isOpen && <hr className="border-gray-200 mb-2" />}
              {filteredSystemMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title={!isOpen ? item.label : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20 animate-in fade-in duration-300"
          onClick={onToggle}
        ></div>
      )}
    </>
  );
}
