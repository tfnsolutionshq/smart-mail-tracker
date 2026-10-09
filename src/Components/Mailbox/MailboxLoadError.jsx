import React from 'react'
import { FiRefreshCw, FiWifiOff } from 'react-icons/fi'

function MailboxLoadError({ message, onRetry, retrying = false }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <FiWifiOff className="w-10 h-10 mb-4 text-red-400" />
      <p className="text-lg font-medium mb-2 text-gray-900">Couldn't load memos</p>
      <p className="text-sm text-gray-600 mb-4 max-w-sm">
        {message || 'Check your connection and try again.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <FiRefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
        {retrying ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  )
}

export default MailboxLoadError