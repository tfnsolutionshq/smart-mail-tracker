import React from 'react'

function Workflows({ dashboard, loading }) {
  const workflowData = dashboard?.top_performers?.workflows ?? []
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Workflows</h3>
        <p className="text-sm text-gray-600">Most active workflows by memo count</p>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : workflowData.length > 0 ? (
        <div className="space-y-3">
          {workflowData.map((w) => (
            <div key={w.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white">
              <div>
                <div className="text-sm font-medium text-gray-900">{w.name}</div>
                <div className="text-xs text-gray-500">Workflow ID: {w.id}</div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{w.memos_count} memos</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No workflow data available</div>
      )}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">Avg Completion Time</p>
          <p className="text-lg font-semibold text-gray-900">{dashboard?.workflow_health?.average_completion_time_hours ?? 0} hrs</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">Failure Rate</p>
          <p className="text-lg font-semibold text-gray-900">{dashboard?.workflow_health?.failure_rate ?? 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">Disabled Workflows</p>
          <p className="text-lg font-semibold text-gray-900">{dashboard?.workflow_health?.disabled_workflows ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

export default Workflows