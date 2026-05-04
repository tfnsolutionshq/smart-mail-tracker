import React from 'react'

function UserAnalytics({ dashboard, loading }) {
  const userStats = [
    {
      label: 'Total Users',
      value: dashboard?.identity?.total_users ?? 0,
      color: 'blue'
    },
    {
      label: 'Active Users',
      value: dashboard?.identity?.active_users ?? 0,
      color: 'green'
    },
    {
      label: 'Total Departments',
      value: dashboard?.identity?.total_departments ?? 0,
      color: 'purple'
    },
    {
      label: 'Pending Reviews',
      value: dashboard?.overview?.pending_reviews ?? 0,
      color: 'yellow'
    }
  ]
  
  const getColorClass = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700'
      case 'green': return 'bg-green-100 text-green-700'
      case 'purple': return 'bg-purple-100 text-purple-700'
      case 'yellow': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">User & System Analytics</h3>
        <p className="text-sm text-gray-600">Overview of user activity and system metrics</p>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getColorClass(stat.color)}`}>
                Active
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Replies</span>
              <span className="text-sm font-semibold text-gray-900">{dashboard?.overview?.total_replies ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Forwards</span>
              <span className="text-sm font-semibold text-gray-900">{dashboard?.overview?.total_forwards ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Reviews</span>
              <span className="text-sm font-semibold text-gray-900">{dashboard?.overview?.pending_reviews ?? 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Memos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Scheduled</span>
              <span className="text-sm font-semibold text-gray-900">{dashboard?.scheduled_memos?.total_scheduled ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next 7 Days</span>
              <span className="text-sm font-semibold text-gray-900">{dashboard?.scheduled_memos?.next_7_days ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next 30 Days</span>
              <span className="text-sm font-semibold text-gray-900">{dashboard?.scheduled_memos?.next_30_days ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAnalytics