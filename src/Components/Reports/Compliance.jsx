import React from 'react'

function Compliance({ dashboard, loading }) {
  const complianceMetrics = [
    {
      title: 'Pending Approvals',
      current: dashboard?.overview?.total_pending_approvals ?? 0,
      target: 100,
      status: 'info',
      description: `Current: ${dashboard?.overview?.total_pending_approvals ?? 0} | Target: 0`
    },
    {
      title: 'Overdue Items',
      current: dashboard?.approvals?.overdue_count ?? 0,
      target: 0,
      status: dashboard?.approvals?.overdue_count > 0 ? 'poor' : 'good',
      description: `Current: ${dashboard?.approvals?.overdue_count ?? 0} | Target: 0`
    },
    {
      title: 'Upcoming Deadlines',
      current: dashboard?.approvals?.upcoming_deadlines_count ?? 0,
      target: 100,
      status: 'warning',
      description: `Current: ${dashboard?.approvals?.upcoming_deadlines_count ?? 0} items`
    },
    {
      title: 'Scheduled Memos',
      current: dashboard?.scheduled_memos?.total_scheduled ?? 0,
      target: 100,
      status: 'good',
      description: `Total: ${dashboard?.scheduled_memos?.total_scheduled ?? 0} | Next 7 days: ${dashboard?.scheduled_memos?.next_7_days ?? 0}`
    }
  ]
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }
  
  const getProgressBarColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  return (
    <div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complianceMetrics.map((metric, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{metric.title}</h3>
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{metric.description}</p>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Current Value</span>
                  <span>{metric.current}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(metric.status)}`}
                    style={{ width: `${Math.min((metric.current / (metric.target || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Compliance