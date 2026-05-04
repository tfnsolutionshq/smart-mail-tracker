import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiPaperclip, FiDownload, FiCheckCircle, FiShare2, FiClock, FiArrowUpRight } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import ShareMemo from './ShareMemo'
import ForwardMemo from './ForwardMemo'
import ConfirmationModal from './ConfirmationModal'
import axios from 'axios'

export default function RecordMemoDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showNotification } = useNotification()
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  useEffect(() => {
    if (token && id) {
      fetchMemoDetails()
    } else if (!token) {
      setLoading(false)
      showNotification('Authentication required. Please log in.', 'error')
      navigate('/login')
    }
  }, [id, token])

  const fetchMemoDetails = async () => {
    if (!token) {
      showNotification('Authentication required', 'error')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(
        `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.status) {
        setMemo(response.data.data)
      }
    } catch (error) {
      if (error.response?.status === 401) {
        showNotification('Session expired. Please log in again.', 'error')
        navigate('/login')
      } else {
        showNotification('Failed to fetch memo details', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAcknowledge = async () => {
    setIsProcessingAction(true)
    try {
      await axios.put(
        `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${id}/status`,
        {
          status: 'completed'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      showNotification('Memo acknowledged successfully', 'success')
      setShowAcknowledgeModal(false)
      fetchMemoDetails()
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to acknowledge memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleShareNotification = async (data) => {
    setIsProcessingAction(true)
    try {
      await axios.post(
        `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${id}/share`,
        {
          email: data.email,
          message: data.message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      showNotification('Memo shared successfully', 'success')
      setShowShareModal(false)
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to share memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleForwardMemo = async (data) => {
    setIsProcessingAction(true)
    try {
      await axios.post(
        `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${id}/forward`,
        {
          department_id: data.departmentId,
          email: data.email,
          remarks: data.remarks
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      showNotification('Memo forwarded successfully', 'success')
      setShowForwardModal(false)
      fetchMemoDetails()
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to forward memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Memo not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{memo.subject}</h1>
          <p className="text-sm text-gray-600 mt-1">Tracking ID: {memo.tracking_id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <FiShare2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={() => setShowAcknowledgeModal(true)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <FiCheckCircle className="w-4 h-4" />
            Acknowledge
          </button>
          <button
            onClick={() => setShowForwardModal(true)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <FiArrowUpRight className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(memo.priority)}`}>
          {memo.priority}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(memo.status)}`}>
          {memo.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Memo Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Reference Number</p>
                <p className="text-sm font-medium text-gray-900">{memo.reference_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Date Received</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(memo.date_received)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Sender Organization</p>
                <p className="text-sm font-medium text-gray-900">{memo.sender_organization}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Sender Contact</p>
                <p className="text-sm font-medium text-gray-900">{memo.sender_contact}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900">{memo.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">{memo.assigned_to?.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-900">{memo.description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 mb-1">Assignment Remarks</p>
                <p className="text-sm text-gray-900">{memo.assignment_remarks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments ({memo.attachments?.length || 0})</h2>
            {memo.attachments && memo.attachments.length > 0 ? (
              <div className="space-y-2">
                {memo.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiPaperclip className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                        <p className="text-xs text-gray-600">{(file.file_size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No attachments</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Movements</p>
                <p className="text-sm font-medium text-gray-900">{memo.quick_info?.total_movements || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Days in System</p>
                <p className="text-sm font-medium text-gray-900">{Math.ceil(memo.quick_info?.days_in_system || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(memo.quick_info?.status)}`}>
                  {memo.quick_info?.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-2 text-gray-900">
              <FiClock className="w-4 h-4" />
              <span className="text-sm font-semibold">Movement Timeline</span>
            </div>
            <div className="text-xs text-gray-600 mb-3">Track memo movement and processing history</div>
            <div className="space-y-3">
              {memo.movement_timeline && memo.movement_timeline.length > 0 ? (
                memo.movement_timeline.map((event, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{event.action}</div>
                      <div className="text-xs text-gray-600">
                        {event.user_name && `By: ${event.user_name}`} 
                        {event.department && ` (${event.department})`}
                        {event.assigned_to && ` → ${event.assigned_to}`}
                      </div>
                      <div className="mt-1 bg-gray-100 rounded px-3 py-2 text-sm text-gray-900">
                        Status: {event.status || 'Completed'} | Priority: {event.priority}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 whitespace-nowrap">{event.date_time}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No movement history.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showAcknowledgeModal}
        onClose={() => setShowAcknowledgeModal(false)}
        onConfirm={handleAcknowledge}
        title="Acknowledge Memo"
        message="Confirm that you have received and reviewed this memo"
        subMessage="This will update the memo status and notify relevant parties that you have acknowledged receipt."
        confirmText="Confirm Acknowledgment"
        isProcessing={isProcessingAction}
      />

      <ShareMemo
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        trackingId={memo?.tracking_id}
        trackingUrl={`https://track.smt.tfnsolutions.us/${memo?.tracking_id}`}
        onSend={handleShareNotification}
        isProcessing={isProcessingAction}
      />

      <ForwardMemo
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        onConfirm={handleForwardMemo}
        isProcessing={isProcessingAction}
      />
    </div>
  )
}
