import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiPower,
  FiTrash2,
} from "react-icons/fi";
import { MdEditNote } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { categoryAPI } from "../../services/api";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";

function MemoCategories() {
  const [showCategoryMenu, setShowCategoryMenu] = useState(null);
  const [categoryMenuDropUp, setCategoryMenuDropUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [pageFrom, setPageFrom] = useState(0);
  const [pageTo, setPageTo] = useState(0);
  const categoryMenuRef = useRef(null);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const response = await categoryAPI.getCategories(token, { page });
      if (response.status && response.data) {
        const list = response.data.data || [];
        // Step back if the current page became empty (e.g. after a delete)
        if (list.length === 0 && page > 1) {
          fetchCategories(page - 1);
          return;
        }
        setCategories(list);
        setCurrentPage(response.data.current_page || page);
        setTotalPages(response.data.last_page || 1);
        setTotalCategories(response.data.total ?? list.length);
        setPageFrom(response.data.from || 0);
        setPageTo(response.data.to || 0);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close category menu on outside click
  useEffect(() => {
    if (!showCategoryMenu) return;
    const handleMouseDown = (e) => {
      if (categoryMenuRef.current && categoryMenuRef.current.contains(e.target))
        return;
      setShowCategoryMenu(null);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showCategoryMenu]);

  const getIcon = (name) => {
    const icons = {
      "Internal memo": "📝",
      "External communication": "📧",
      "Policy update": "📋",
      "Urgent notice": "⚠️",
      Confidential: "🔒",
    };
    return icons[name] || "📄";
  };

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchesSearch =
        !q ||
        (cat.name && cat.name.toLowerCase().includes(q)) ||
        (cat.description && String(cat.description).toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === "All Statuses" ||
        (statusFilter === "Active" && cat.is_active) ||
        (statusFilter === "Inactive" && !cat.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const handleToggleStatus = async () => {
    setTogglingStatus(true);
    try {
      const response = await categoryAPI.toggleCategoryStatus(
        categoryToToggle.id,
        token,
      );

      if (response.status) {
        const action = categoryToToggle.is_active ? "deactivated" : "activated";
        showNotification(`Category ${action} successfully`, "success");
        fetchCategories(currentPage);
      }
    } catch (error) {
      console.error("Error toggling category status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update category status";
      showNotification(errorMessage, "error");
    } finally {
      setTogglingStatus(false);
      setShowToggleConfirm(false);
      setCategoryToToggle(null);
    }
  };

  const handleDeleteCategory = async () => {
    setDeletingCategory(true);
    try {
      const response = await categoryAPI.deleteCategory(
        categoryToDelete.id,
        token,
      );

      if (response.status) {
        showNotification("Category deleted successfully", "success");
        fetchCategories(currentPage);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete category";
      showNotification(errorMessage, "error");
    } finally {
      setDeletingCategory(false);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-xs hover:bg-gray-800 flex items-center gap-2"
          >
            <FiPlus className="w-3 h-3" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Memo Categoriess
        </h2>
        <p className="text-xs text-gray-600">
          Manage categories for organizing memos
          {!searchTerm.trim() && statusFilter === "All Statuses"
            ? ` (${totalCategories} ${totalCategories === 1 ? "category" : "categories"})`
            : ` (${filteredCategories.length} match${filteredCategories.length === 1 ? "" : "es"} on this page)`}
        </p>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
              No categories match your search or filters.
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      {getIcon(category.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {category.name}
                        </h3>
                        {/* {category.internal_value && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.internal_value}
                        </span>
                      )} */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            category.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.is_active ? "active" : "inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {category.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{category.total_memos_sent || 0} memos sent</span>
                        <span>•</span>
                        <span>
                          Last updated on{" "}
                          {new Date(category.updated_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!category.is_active ? (
                      <button
                        onClick={() => {
                          setCategoryToToggle(category);
                          setShowToggleConfirm(true);
                        }}
                        className="px-3 py-1.5 bg-white border rounded-lg text-xs hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FiPower className="w-3 h-3" />
                        Activate
                      </button>
                    ) : (
                      <div
                        className="relative"
                        ref={
                          showCategoryMenu === category.id
                            ? categoryMenuRef
                            : null
                        }
                      >
                        <button
                          onClick={(e) => {
                            if (showCategoryMenu !== category.id) {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              setCategoryMenuDropUp(
                                window.innerHeight - rect.bottom < 180,
                              );
                            }
                            setShowCategoryMenu(
                              showCategoryMenu === category.id
                                ? null
                                : category.id,
                            );
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiMoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {showCategoryMenu === category.id && (
                          <div
                            className={`absolute right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 ${categoryMenuDropUp ? "bottom-8 mb-1" : "top-8 mt-1"}`}
                          >
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowEditCategory(true);
                                setShowCategoryMenu(null);
                              }}
                              className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                            >
                              <MdEditNote className="w-3 h-3 mr-2" />
                              Edit Category
                            </button>
                            <button
                              onClick={() => {
                                setCategoryToToggle(category);
                                setShowToggleConfirm(true);
                                setShowCategoryMenu(null);
                              }}
                              className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                            >
                              <FiPower className="w-3 h-3 mr-2" />
                              Deactivate
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => {
                                setCategoryToDelete(category);
                                setShowDeleteConfirm(true);
                                setShowCategoryMenu(null);
                              }}
                              className="flex items-center w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600"
                            >
                              <FiTrash2 className="w-3 h-3 mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-600">
            Showing {pageFrom} to {pageTo} of {totalCategories} categories
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchCategories(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-xs text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchCategories(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddCategory && (
        <AddCategory
          onClose={() => setShowAddCategory(false)}
          onSuccess={() => fetchCategories(currentPage)}
        />
      )}
      {showEditCategory && selectedCategory && (
        <EditCategory
          category={selectedCategory}
          onClose={() => {
            setShowEditCategory(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => fetchCategories(currentPage)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Category
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{categoryToDelete.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                disabled={deletingCategory}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={deletingCategory}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingCategory ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      {showToggleConfirm && categoryToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {categoryToToggle.is_active ? "Deactivate" : "Activate"} Category
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to{" "}
              {categoryToToggle.is_active ? "deactivate" : "activate"} "
              {categoryToToggle.name}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowToggleConfirm(false);
                  setCategoryToToggle(null);
                }}
                disabled={togglingStatus}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  categoryToToggle.is_active
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {togglingStatus
                  ? categoryToToggle.is_active
                    ? "Deactivating..."
                    : "Activating..."
                  : categoryToToggle.is_active
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoCategories;
