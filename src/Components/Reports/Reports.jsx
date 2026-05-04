import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Workflows from './Workflows'
import Performance from './Perfomance'
import Compliance from './Compliance'
import UserAnalytics from './UserAnalytics'

function Reports() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('Performance')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          'https://memo.smt.tfnsolutions.us/api/v1/dashboard/statistics',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setDashboard(res.data?.data)
      } catch (e) {
        console.error('Failed to load data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])
  
  const tabs = ['Performance', 'Workflows', 'Compliance', 'User Analytics']
  
  return (
    <div className="p-5 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 text-sm">Comprehensive insights into system performance and user activity</p>
        </div>
        {/* <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800">
            Configure
          </button>
        </div> */}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : dashboard?.identity?.total_users ?? 0}</p>
              <p className="text-sm text-green-600">{loading ? 'Loading...' : `${dashboard?.identity?.active_users ?? 0} active`}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : dashboard?.overview?.total_active_workflows ?? 0}</p>
              <p className="text-sm text-green-600">{loading ? 'Loading...' : 'Across departments'}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : dashboard?.overview?.total_pending_approvals ?? 0}</p>
              <p className="text-sm text-green-600">{loading ? 'Loading...' : 'Awaiting action'}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : dashboard?.identity?.total_departments ?? 0}</p>
              <p className="text-sm text-green-600">{loading ? 'Loading...' : '100% operational'}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      {/* <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>Jan 01 - Oct 14, 2025</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Departments:</span>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>All Departments</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Categories:</span>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>All Categories</option>
            </select>
          </div>
        </div>
      </div> */}
      
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'Overview' && (
            <div>
              {/* Charts commented out - using real data only */}
              {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Memo Volume Trends</h3>
                  <p className="text-sm text-gray-600 mb-4">Monthly memo creation and approval trends</p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Distribution</h3>
                  <p className="text-sm text-gray-600 mb-4">Breakdown of memos by category</p>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name} ${value}%`}
                          labelLine={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div> */}
              
              <div className="text-center py-12 text-gray-500">
                Overview data visualization coming soon
              </div>
            </div>
          )}
          
          {activeTab === 'Performance' && <Performance dashboard={dashboard} loading={loading} />}
          {activeTab === 'Workflows' && <Workflows dashboard={dashboard} loading={loading} />}
          {activeTab === 'Compliance' && <Compliance dashboard={dashboard} loading={loading} />}
          {activeTab === 'User Analytics' && <UserAnalytics dashboard={dashboard} loading={loading} />}
          
          {!['Overview', 'Performance', 'Workflows', 'Compliance', 'User Analytics'].includes(activeTab) && (
            <div className="text-center py-12">
              <p className="text-gray-500">Content for {activeTab} tab will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports