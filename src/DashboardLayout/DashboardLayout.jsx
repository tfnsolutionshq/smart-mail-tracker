"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const shouldShowPasswordBanner =
    user &&
    (user.must_change_password === 1 || user.must_change_password === true);

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {shouldShowPasswordBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 text-amber-900">
                <span className="font-semibold whitespace-nowrap">
                  Security reminder:
                </span>
                <span className="leading-snug">
                  Please change your default password to keep your account
                  secure.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/profile?tab=security")}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 w-full sm:w-auto"
              >
                Change password
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto ">{children}</main>
      </div>
    </div>
  );
}
