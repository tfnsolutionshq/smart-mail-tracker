import React from 'react'

function Performance({ dashboard, loading }) {
  const categories = dashboard?.top_performers?.categories ?? []
  const priorities = dashboard?.top_performers?.priorities ?? []
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Categories</h3>
          <p className="text-sm text-gray-600 mb-4">Most used memo categories</p>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white">
                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{c.count} memos</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No category data available</div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Distribution</h3>
          <p className="text-sm text-gray-600 mb-4">Memos by priority level</p>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : priorities.length > 0 ? (
            <div className="space-y-3">
              {priorities.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white">
                  <span className="text-sm font-medium text-gray-900">{p.priority ?? 'Unspecified'}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">{p.count} memos</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No priority data available</div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Memo Distribution</h3>
        <p className="text-sm text-gray-600 mb-4">Workflow usage statistics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">With Workflow</p>
            <p className="text-lg font-semibold text-gray-900">{dashboard?.memo_distribution?.with_workflow ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">Without Workflow</p>
            <p className="text-lg font-semibold text-gray-900">{dashboard?.memo_distribution?.without_workflow ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Performance