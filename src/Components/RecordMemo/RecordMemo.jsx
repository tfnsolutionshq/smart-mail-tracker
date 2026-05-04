import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiFileText,
  FiHome,
  FiUser,
  FiCalendar,
  FiSearch
} from 'react-icons/fi'

export default function RecordMemo() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [deptFilter, setDeptFilter] = useState('All Departments')

  const { user, token } = useAuth()
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token && user) {
      const fetchMemos = async () => {
        try {
          const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://memo.smt.tfnsolutions.us/api/v1/external-memos',
            headers: { 
              'Authorization': `Bearer ${token}` 
            }
          };
          const response = await axios.request(config);
          if (response.data && response.data.data && response.data.data.data) {
            const allMemos = response.data.data.data;
            const userMemos = allMemos.filter(memo => {
              const isAssigned = String(memo.assigned_officer_id) === String(user.id);
              const isRecorder = String(memo.recorded_by_user_id) === String(user.id);
              return isAssigned || isRecorder;
            }).map(memo => {
              let direction = 'External';
              if (String(memo.assigned_officer_id) === String(user.id)) direction = 'Received';
              else if (String(memo.recorded_by_user_id) === String(user.id)) direction = 'Sent';
              
              return {
                id: memo.tracking_id || memo.id,
                uuid: memo.id,
                type: direction,
                originalType: 'External',
                ref: memo.reference_number || 'N/A',
                subject: memo.subject || 'No Subject',
                origin: memo.sender_organization || 'Unknown',
                department: memo.assigned_to?.department_name || 'N/A',
                officer: memo.assigned_to?.name || 'Unassigned',
                received: new Date(memo.date_received).toLocaleDateString() + ' ' + new Date(memo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: memo.status
              };
            });
            setMemos(userMemos);
          }
        } catch (error) {
          console.error('Error fetching external memos:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMemos();
    }
  }, [token, user]);

  const filtered = useMemo(() => {
    return memos.filter((m) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        String(m.id).toLowerCase().includes(q) ||
        String(m.ref).toLowerCase().includes(q) ||
        String(m.subject).toLowerCase().includes(q) ||
        String(m.origin).toLowerCase().includes(q)

      const matchesType =
        typeFilter === 'All Types' || 
        String(m.type).toLowerCase() === typeFilter.toLowerCase() ||
        (m.originalType && String(m.originalType).toLowerCase() === typeFilter.toLowerCase())

      const matchesStatus = 
        statusFilter === 'All Statuses' || 
        (m.status && String(m.status).toLowerCase() === statusFilter.toLowerCase())

      const matchesDept =
        deptFilter === 'All Departments' || 
        String(m.department).toLowerCase().includes(deptFilter.toLowerCase())

      return matchesQuery && matchesType && matchesStatus && matchesDept
    })
  }, [memos, query, typeFilter, statusFilter, deptFilter])

  return (
    <div className="p-4 sm:p-4 lg:p-6 w-full mx-auto">
      <div className="mb-6 flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Record Memo</h1>
          <p className="text-gray-600 text-sm mt-1">Record and track external and internal memos</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/track-memo')}
          className="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-colors"
        >
          <FiSearch className="mr-2 h-4 w-4" />
          Track Memo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer" onClick={() => navigate('/record-external-memo')}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Record External Memo</h2>
                <p className="text-sm text-gray-600">Record incoming memos from external organizations</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700" onClick={(e) => { e.stopPropagation(); navigate('/record-external-memo') }}>
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
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">3</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer" onClick={() => navigate('/record-memo-inbox')}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Check Record Memo Inbox</h2>
                <p className="text-sm text-gray-600">View and manage your assigned record memos</p>
              </div>
            </div>
            <button className="text-green-600 hover:text-green-700" onClick={(e) => { e.stopPropagation(); navigate('/record-memo-inbox') }}>
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
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{memos.length}</span>
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
          <p className="text-sm text-gray-600">View and manage recorded memos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="md:col-span-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memos..."
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 bg-[#F3F3F5]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
          >
            <option>All Types</option>
            <option>External</option>
            <option>Internal</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
          >
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Completed</option>
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-[#F3F3F5]"
          >
            <option>All Departments</option>
            <option>Academic Affairs</option>
            <option>Finance</option>
            <option>Human Resources</option>
          </select>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading memos...</div>
          ) : (
            <table className="min-w-[1100px]">
              <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">Tracking ID</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">Type</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 hidden md:table-cell text-xs whitespace-nowrap">Reference Number</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">Subject</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 hidden lg:table-cell text-xs whitespace-nowrap">Sender/Origin</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 hidden xl:table-cell text-xs whitespace-nowrap">Department</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 hidden xl:table-cell text-xs whitespace-nowrap">Officer</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 hidden md:table-cell text-xs whitespace-nowrap">Date Received</th>
                <th className="text-left py-2 px-3 font-medium text-gray-900 text-xs whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-xs text-gray-900 whitespace-nowrap">{m.id}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${
                      m.type === 'Sent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      <FiFileText className="w-3 h-3" /> {m.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700 hidden md:table-cell whitespace-nowrap">{m.ref}</td>
                  <td className="py-2 px-3 text-xs text-gray-900 whitespace-nowrap">{m.subject}</td>
                  <td className="py-2 px-3 text-xs text-gray-700 hidden lg:table-cell whitespace-nowrap">
                    <span className="inline-flex items-center gap-1"><FiHome className="w-3.5 h-3.5 text-gray-500" />{m.origin}</span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700 hidden xl:table-cell whitespace-nowrap">{m.department}</td>
                  <td className="py-2 px-3 text-xs text-gray-700 hidden xl:table-cell whitespace-nowrap">
                    <span className="inline-flex items-center gap-1"><FiUser className="w-3.5 h-3.5 text-gray-500" />{m.officer}</span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700 hidden md:table-cell whitespace-nowrap">
                    <span className="inline-flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5 text-gray-500" />{m.received}</span>
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
      </div>
    </div>
  )
}
