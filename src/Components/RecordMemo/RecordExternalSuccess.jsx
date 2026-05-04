import React, { useEffect } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'

export default function RecordExternalSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showNotification } = useNotification()
  const state = location.state || {}
  
  // Use data from state or fallbacks
  const trackingId = state.memo?.tracking_id || state.reference || 'N/A'
  const reference = state.reference || 'N/A'
  const senderOrg = state.senderOrg || 'N/A'
  const category = state.category || 'N/A'
  const department = state.department || 'N/A'
  const officer = state.officer || 'N/A'
  const qrCode = state.memo?.qr_code || state.memo?.qr_code_url

  useEffect(() => {
    if (trackingId !== 'N/A') {
      showNotification(`Tracking ID: ${trackingId}`, 'success')
    }
  }, [trackingId])

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(trackingId)
      showNotification('Tracking ID copied', 'success')
    } catch {}
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4 lg:py-6">
      <div className="bg-white rounded-lg border border-green-200 p-8 mt-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
            <FiCheck className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-3">Memo Recorded Successfully!</h2>
          <p className="text-sm text-gray-600">The external memo has been recorded and assigned</p>

          <div className="bg-white border rounded-lg p-4 mt-6 w-full max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Tracking ID</p>
                <p className="text-lg font-bold text-gray-900">{trackingId}</p>
              </div>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2" onClick={copyId}>
                <FiCopy className="w-4 h-4" />
                Copy
              </button>
            </div>
            {qrCode && (
              <div className="mt-4 flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-24 h-24" />
              </div>
            )}
            {!qrCode && (
              <div className="mt-4 flex justify-center">
                 <div className="w-24 h-24 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">No QR</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-3xl">
            <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-600">Reference Number</p>
              <p className="text-sm font-medium text-gray-900">{reference}</p>
            </div>
            <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-600">Sender Organization</p>
              <p className="text-sm font-medium text-gray-900">{senderOrg}</p>
            </div>
            <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-600">Assigned Department</p>
              <p className="text-sm font-medium text-gray-900">{department}</p>
            </div>
            <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-600">Assigned Officer</p>
              <p className="text-sm font-medium text-gray-900">{officer}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg" onClick={() => navigate('/record-external-memo')}>Record Another Memo</button>
            <button className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg" onClick={() => navigate('/record-memo')}>Back to Record Memo</button>
          </div>
        </div>
      </div>
    </div>
  )
}
