import axios from 'axios';

// Four base URLs (strip trailing slash). Override via .env / build env.
const strip = (url, fallback) => (url || fallback || '').replace(/\/$/, '');
export const identityBaseUrl = strip(import.meta.env.VITE_IDENTITY_API_BASE_URL, 'https://identity.smt.tfnsolutions.us/api/v1');
export const identityStorageBase = identityBaseUrl.replace(/\/api\/v1\/?$/, '');
export const memoBaseUrl = strip(import.meta.env.VITE_MEMO_API_BASE_URL, 'https://memo.smt.tfnsolutions.us/api/v1');
export const notificationBaseUrl = strip(import.meta.env.VITE_NOTIFICATION_API_BASE_URL, 'https://notification.smt.tfnsolutions.us/api/v1');
export const settingsBaseUrl = strip(import.meta.env.VITE_SETTINGS_API_BASE_URL, 'https://setting.smt.tfnsolutions.us/api/v1');

/**
 * Mailbox GET responses use `data.memos.data` for the memo list (and `data.memos.meta`).
 * Older clients expected `data.data` at the top level of `data`.
 */
export function parseMailboxEnvelope(payload) {
  if (!payload || typeof payload !== 'object') {
    return { memos: [], meta: {} };
  }
  let memos = [];
  if (Array.isArray(payload.memos?.data)) {
    memos = payload.memos.data;
  } else if (Array.isArray(payload.data)) {
    memos = payload.data;
  }
  const meta = payload.memos?.meta ?? payload.meta ?? {};
  const counts =
    payload.counts && typeof payload.counts === 'object' ? payload.counts : null;
  return { memos, meta, counts };
}

const API_BASE_URL = identityBaseUrl;

const createApiClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const userAPI = {
  getUsers: async (filters = {}, token) => {
    const apiClient = createApiClient(token);
    const params = {
      per_page: 12
    };
    
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.status !== undefined && filters.status !== '') params.status = filters.status;
    if (filters.department) params.department = filters.department;
    if (filters.page) params.page = filters.page;
    
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  
  getUserById: async (userId, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  searchUsers: async (query, token) => {
    const apiClient = createApiClient(token);
    const params = { q: query };
    const response = await apiClient.get('/users/search', { params });
    return response.data;
  },
  
  createUser: async (userData, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  updateUser: async (userId, userData, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  resetUserPassword: async (userId, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.put(`/users/${userId}/reset-password`);
    return response.data;
  }
};

export const roleAPI = {
  getRoles: async (token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.get('/roles');
    return response.data;
  },
  
  getAvailablePermissions: async (token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.get('/roles/permissions/available');
    return response.data;
  }
};

export const departmentAPI = {
  getDepartments: async (token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.get('/departments');
    return response.data;
  },
  
  getDepartmentStats: async (token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.get('/departments/statistics');
    return response.data;
  },
  
  createDepartment: async (departmentData, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.post('/departments', departmentData);
    return response.data;
  },
  
  updateDepartment: async (departmentId, departmentData, token) => {
    const apiClient = createApiClient(token);
    const params = {
      ...departmentData,
      department_id: departmentId
    };
    const response = await apiClient.put(`/departments/${departmentId}`, null, { params });
    return response.data;
  },
  
  deleteDepartment: async (departmentId, token) => {
    const apiClient = createApiClient(token);
    const response = await apiClient.delete(`/departments/${departmentId}`);
    return response.data;
  }
};

const createMemoApiClient = (token) => {
  return axios.create({
    baseURL: memoBaseUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const categoryAPI = {
  getCategories: async (token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.get('/categories');
    return response.data;
  },
  
  createCategory: async (categoryData, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (categoryId, categoryData, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },
  
  toggleCategoryStatus: async (categoryId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.post(`/categories/${categoryId}/toggle-status`);
    return response.data;
  },
  
  deleteCategory: async (categoryId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data;
  }
};

/** Query params for GET /workflows and GET /workflows/active (see public/SMT/Memo/Workflow/Get List.yml). */
export function buildWorkflowListParams(raw = {}) {
  const out = {};
  const set = (key, val) => {
    if (val === undefined || val === null) return;
    if (typeof val === 'string' && val.trim() === '') return;
    out[key] = val;
  };
  set('search', raw.search?.trim?.() ? raw.search.trim() : raw.search);
  set('category_id', raw.category_id != null && raw.category_id !== '' ? String(raw.category_id) : undefined);
  set('category', raw.category?.trim?.() ? raw.category.trim() : raw.category);
  if (raw.roles != null && raw.roles !== '') {
    const r = Array.isArray(raw.roles) ? raw.roles.filter(Boolean).join(',') : String(raw.roles);
    if (r) out.roles = r;
  }
  set('estimated_time_min', raw.estimated_time_min != null && raw.estimated_time_min !== '' ? String(raw.estimated_time_min) : undefined);
  set('estimated_time_max', raw.estimated_time_max != null && raw.estimated_time_max !== '' ? String(raw.estimated_time_max) : undefined);
  set('type', raw.type?.trim?.() ? raw.type.trim() : raw.type);
  if (raw.is_active === 0 || raw.is_active === 1 || raw.is_active === '0' || raw.is_active === '1') {
    out.is_active = Number(raw.is_active);
  }
  return out;
}

export const workflowAPI = {
  createWorkflow: async (workflowData, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.post('/workflows', workflowData);
    return response.data;
  },
  
  getWorkflows: async (token, filterParams = {}) => {
    const apiClient = createMemoApiClient(token);
    const params = buildWorkflowListParams(filterParams);
    const response = await apiClient.get('/workflows', { params });
    return response.data;
  },
  
  getWorkflow: async (workflowId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.get(`/workflows/${workflowId}`);
    return response.data;
  },
  
  updateWorkflow: async (workflowId, workflowData, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.put(`/workflows/${workflowId}`, workflowData);
    return response.data;
  },
  
  deleteWorkflow: async (workflowId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.delete(`/workflows/${workflowId}`);
    return response.data;
  },
  
  toggleWorkflowStatus: async (workflowId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.put(`/workflows/${workflowId}/toggle-status`);
    return response.data;
  },
  
  getActiveWorkflows: async (token, filterParams = {}) => {
    const apiClient = createMemoApiClient(token);
    const params = buildWorkflowListParams(filterParams);
    const response = await apiClient.get('/workflows/active', { params });
    return response.data;
  }
};

export const memoAPI = {
  createMemo: async (memoData, token) => {
    const apiClient = createMemoApiClient(token);
    const hasAttachments = Array.isArray(memoData?.attachments) && memoData.attachments.length > 0
    if (hasAttachments) {
      const fd = new FormData()
      fd.append('subject', memoData.subject || '')
      fd.append('body', memoData.body || '')
      fd.append('status', memoData.status || 'sent')
      fd.append('is_public', memoData.is_public ? '1' : '0')
      if (memoData.workflow_id !== null && memoData.workflow_id !== undefined) {
        fd.append('workflow_id', String(memoData.workflow_id))
      }
      if (memoData.category_id !== undefined && memoData.category_id !== null) {
        fd.append('category_id', String(memoData.category_id))
      }
      if (memoData.priority) {
        fd.append('priority', memoData.priority)
      }
      if (memoData.scheduled_for) {
        fd.append('scheduled_for', memoData.scheduled_for)
      }
      if (Array.isArray(memoData.recipients)) {
        memoData.recipients.forEach((rec, idx) => {
          if (rec?.recipient_id !== undefined) {
            fd.append(`recipients[${idx}][recipient_id]`, String(rec.recipient_id))
          }
          if (rec?.recipient_type !== undefined) {
            fd.append(`recipients[${idx}][recipient_type]`, String(rec.recipient_type))
          }
          if (rec?.recipient_role !== undefined) {
            fd.append(`recipients[${idx}][recipient_role]`, String(rec.recipient_role))
          }
        })
      }
      memoData.attachments.forEach((file) => {
        if (file) fd.append('attachments[]', file)
      })
      const response = await apiClient.post('/memos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } else {
      const response = await apiClient.post('/memos', memoData)
      return response.data
    }
  },
  updateMemo: async (memoId, memoData, token) => {
    const apiClient = createMemoApiClient(token)
    const hasAttachments = Array.isArray(memoData?.attachments) && memoData.attachments.length > 0
    const useMultipart = hasAttachments || true
    if (useMultipart) {
      const fd = new FormData()
      if (memoData.subject !== undefined) fd.append('subject', memoData.subject || '')
      if (memoData.body !== undefined) fd.append('body', memoData.body || '')
      if (memoData.status) fd.append('status', memoData.status)
      fd.append('is_public', memoData.is_public ? '1' : '0')
      if (memoData.workflow_id !== null && memoData.workflow_id !== undefined) {
        fd.append('workflow_id', String(memoData.workflow_id))
      }
      if (memoData.category_id !== undefined && memoData.category_id !== null) {
        fd.append('category_id', String(memoData.category_id))
      }
      if (memoData.priority) {
        fd.append('priority', memoData.priority)
      }
      if (memoData.scheduled_for) {
        fd.append('scheduled_for', memoData.scheduled_for)
      }
      if (Array.isArray(memoData.recipients)) {
        memoData.recipients.forEach((rec, idx) => {
          if (rec?.recipient_id !== undefined) {
            fd.append(`recipients[${idx}][recipient_id]`, String(rec.recipient_id))
          }
          if (rec?.recipient_type !== undefined) {
            fd.append(`recipients[${idx}][recipient_type]`, String(rec.recipient_type))
          }
          if (rec?.recipient_role !== undefined) {
            fd.append(`recipients[${idx}][recipient_role]`, String(rec.recipient_role))
          }
        })
      }
      if (hasAttachments) {
        memoData.attachments.forEach((file) => {
          if (file) fd.append('attachments[]', file)
        })
      }
      const response = await apiClient.post(`/memos/${memoId}/update`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } else {
      const response = await apiClient.post(`/memos/${memoId}/update`, memoData)
      return response.data
    }
  },
  
  getMemo: async (memoId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.get(`/memos/${memoId}`);
    return response.data;
  },
  
  pinMemo: async (memoId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.post(`/memos/${memoId}/pin`);
    return response.data;
  },
  
  starMemo: async (memoId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.post(`/memos/${memoId}/star`);
    return response.data;
  },
  
  archiveMemo: async (memoId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.post(`/memos/${memoId}/archive`);
    return response.data;
  },
  
  deleteMemo: async (memoId, token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.delete(`/memos/${memoId}`);
    return response.data;
  },
  
  getDrafts: async (token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.get('/mailbox/drafts');
    return response.data;
  },
  
  getArchived: async (token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.get('/mailbox/archived');
    return response.data;
  },

  /** Folder totals + unread (from GET /mailbox/inbox `data.counts` and `data.memos.meta`). */
  getMailboxSidebarCounts: async (token) => {
    const apiClient = createMemoApiClient(token);
    const response = await apiClient.get('/mailbox/inbox');
    const body = response.data;
    if (!body?.status || !body.data) {
      return { counts: {}, unreadCount: 0 };
    }
    const { meta, counts } = parseMailboxEnvelope(body.data);
    return {
      counts: counts || {},
      unreadCount: meta.unread_count ?? 0,
    };
  },
};
