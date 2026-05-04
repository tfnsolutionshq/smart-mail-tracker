import React, { useState } from 'react'
import { FiX, FiCopy, FiCheck } from 'react-icons/fi'

export default function ShareMemo({ 
  isOpen, 
  onClose, 
  trackingId, 
  trackingUrl,
  onSend,
  isProcessing = false 
}) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [copiedId, setCopiedId] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'id') {
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
      } else {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/90 p-4 md:inset-0 h-modal md:h-full">
      <div className="relative w-full max-w-sm h-full md:h-auto">
        <div className="relative bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b rounded-t">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Share Memo
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Tracking Info Box */}
            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Tracking ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-900">{trackingId || 'N/A'}</span>
                  <button 
                    onClick={() => handleCopy(trackingId, 'id')}
                    className="text-gray-500 hover:text-gray-700"
                    title="Copy ID"
                  >
                    {copiedId ? <FiCheck className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Tracking URL:</span>
                <button 
                  onClick={() => handleCopy(trackingUrl, 'url')}
                  className="flex items-center gap-1 text-xs text-gray-900 hover:text-gray-700"
                >
                  <FiCopy className="w-3 h-3" />
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900">Recipient Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block p-2 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="name@company.com"
                required
              />
            </div>

            {/* Message Input */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-900">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                className="block p-2 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a message..."
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2 hover:text-gray-900 focus:z-10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSend({ email, message })}
              disabled={isProcessing || !email}
              className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center flex items-center gap-2"
            >
              {isProcessing && (
                <svg className="animate-spin h-3 w-3 text-white" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
