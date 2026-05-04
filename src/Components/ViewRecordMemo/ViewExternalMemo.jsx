import React, { useState, useEffect } from 'react'
import { FiArrowLeft, FiCopy, FiShare2, FiCheckCircle, FiArrowUpRight, FiDownload, FiEye, FiPaperclip, FiClock, FiHome, FiFileText, FiTrash2 } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import ConfirmationModal from './ConfirmationModal'
import ShareMemo from './ShareMemo'
import ForwardMemo from './ForwardMemo'

export default function ViewExternalMemo() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const memoId = searchParams.get('id')
  const { showNotification } = useNotification()
  const { token } = useAuth()
  
  const [memo, setMemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  useEffect(() => {
    if (memoId && token) {
      fetchMemoDetails()
    } else {
        setLoading(false)
    }
  }, [memoId, token])

  const fetchMemoDetails = async () => {
    try {
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}`,
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      };
      const response = await axios.request(config)
      if (response.data && response.data.data) {
        setMemo(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching memo details:', error)
      showNotification('Failed to load memo details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const copyTracking = async () => {
    if (memo?.tracking_id) {
      try {
        await navigator.clipboard.writeText(memo.tracking_id)
        showNotification('Tracking ID copied', 'success')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const data = JSON.stringify({
        "comment": newComment
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}/comments`,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        data : data
      };

      await axios.request(config)
      showNotification('Comment added successfully', 'success')
      setNewComment('')
      fetchMemoDetails() // Refresh to show new comment
    } catch (error) {
      console.error('Error adding comment:', error)
      showNotification('Failed to add comment', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleAcknowledge = async () => {
    setIsProcessingAction(true)
    try {
      const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}/complete`,
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      };
      await axios.request(config)
      showNotification('Memo acknowledged successfully', 'success')
      setShowAcknowledgeModal(false)
      fetchMemoDetails()
    } catch (error) {
      console.error('Error acknowledging memo:', error)
      showNotification('Failed to acknowledge memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleMarkComplete = async () => {
    setIsProcessingAction(true)
    try {
      const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}/status`,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        data: {
          status: 'completed'
        }
      };
      await axios.request(config)
      showNotification('Memo marked as complete', 'success')
      setShowCompleteModal(false)
      fetchMemoDetails()
    } catch (error) {
      console.error('Error marking memo as complete:', error)
      showNotification('Failed to mark memo as complete', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleForwardMemo = async (data) => {
    setIsProcessingAction(true)
    try {
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}/forward`,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        data: {
          department_id: data.departmentId,
          email: data.email,
          remarks: data.remarks
        }
      };
      await axios.request(config)
      showNotification('Memo forwarded successfully', 'success')
      setShowForwardModal(false)
      fetchMemoDetails()
    } catch (error) {
      console.error('Error forwarding memo:', error)
      showNotification('Failed to forward memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleShareNotification = async (data) => {
    setIsProcessingAction(true)
    try {
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}/share`,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        data: {
          email: data.email,
          message: data.message
        }
      };
      await axios.request(config)
      
      showNotification('Memo shared successfully', 'success')
      setShowShareModal(false)
    } catch (error) {
      console.error('Error sharing memo:', error)
      showNotification('Failed to share memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleToggleTrackability = async () => {
    setIsProcessingAction(true)
    try {
      const config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}/trackability`,
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        data: {
          is_publicly_trackable: !memo.is_publicly_trackable
        }
      };
      
      await axios.request(config)
      
      setMemo(prev => ({
        ...prev,
        is_publicly_trackable: !prev.is_publicly_trackable
      }))

      showNotification('Trackability updated successfully', 'success')
    } catch (error) {
      console.error('Error updating trackability:', error)
      showNotification('Failed to update trackability', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  const handleDeleteMemo = async () => {
    setIsProcessingAction(true)
    try {
      const config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `https://memo.smt.tfnsolutions.us/api/v1/external-memos/${memoId}`,
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      };
      await axios.request(config)
      showNotification('Memo deleted successfully', 'success')
      setShowDeleteModal(false)
      navigate(-1)
    } catch (error) {
      console.error('Error deleting memo:', error)
      showNotification('Failed to delete memo', 'error')
    } finally {
      setIsProcessingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading memo details...</div>
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6">
          <FiArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Memo not found or could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <FiArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowShareModal(true)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2">
            <FiShare2 className="w-4 h-4" />
            Share
          </button>
          {/* <button type="button" onClick={() => setShowAcknowledgeModal(true)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            Acknowledge
          </button> */}
          <button type="button" onClick={() => setShowForwardModal(true)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2">
            <FiArrowUpRight className="w-4 h-4" />
            Forward
          </button>
          <button type="button" onClick={() => setShowCompleteModal(true)} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">Mark Complete</button>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2">
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">External Memo Details</h1>
          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
            memo.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
            memo.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {memo.status}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
        <span className="font-medium">{memo.tracking_id}</span>
        <button type="button" onClick={copyTracking} className="p-1 rounded hover:bg-gray-100"><FiCopy className="w-4 h-4" /></button>
        <span className="text-gray-500">Received: {formatDate(memo.date_received)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{memo.subject}</h2>
                <p className="text-xs text-gray-600">{memo.reference_number}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                memo.priority === 'high' || memo.priority === 'critical' ? 'bg-red-100 text-red-700' :
                memo.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {memo.priority} priority
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-gray-600">Sender Organization</div>
                <div className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900"><FiHome className="w-3.5 h-3.5 text-gray-600" />{memo.sender_organization}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Sender Contact</div>
                <div className="mt-1 text-sm text-gray-900">{memo.sender_contact}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Category</div>
                <span className="mt-1 inline-flex px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium">{memo.category}</span>
              </div>
              <div>
                <div className="text-xs text-gray-600">Date Received</div>
                <div className="mt-1 text-sm font-medium text-gray-900">{formatDate(memo.date_received)}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-600">Description</div>
              <div className="mt-1 text-sm text-gray-900">{memo.description || 'No description provided.'}</div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Public Tracking</div>
                  <div className="text-xs text-gray-600">{memo.is_publicly_trackable ? 'External parties can track this memo' : 'Public tracking is disabled'}</div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleTrackability}
                  disabled={isProcessingAction}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${memo.is_publicly_trackable ? 'bg-gray-900' : 'bg-gray-300'} ${isProcessingAction ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${memo.is_publicly_trackable ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3 text-gray-900">
              <FiPaperclip className="w-4 h-4" />
              <span className="text-sm font-semibold">Attachments ({memo.attachments?.length || 0})</span>
            </div>
            {memo.attachments && memo.attachments.length > 0 ? (
              <div className="space-y-2">
                {memo.attachments.map((att, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <div className="text-sm text-gray-900">{att.name || `Attachment ${index + 1}`}</div>
                    <div className="flex items-center gap-3">
                      <button type="button" className="text-gray-700 hover:text-gray-900 flex items-center gap-1"><FiEye className="w-4 h-4" />View</button>
                      <button type="button" className="text-gray-700 hover:text-gray-900 flex items-center gap-1"><FiDownload className="w-4 h-4" />Download</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No attachments found.</div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2 text-gray-900">
              <FiClock className="w-4 h-4" />
              <span className="text-sm font-semibold">Movement Timeline</span>
            </div>
            <div className="text-xs text-gray-600">Track memo movement and processing history</div>
            <div className="mt-3 space-y-3">
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
                    <div className="text-xs text-gray-600 whitespace-nowrap">{formatDate(event.date_time)}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No movement history.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-sm font-semibold text-gray-900">Comments & Discussion</div>
            <div className="text-xs text-gray-600">Add notes and collaborate on this memo</div>
            <div className="mt-3 space-y-3">
              {memo.comments && memo.comments.length > 0 ? (
                memo.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {comment.user_name ? comment.user_name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{comment.user_name}</div>
                          <div className="text-xs text-gray-600">{comment.comment}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{formatDate(comment.created_at)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 mb-3">No comments yet.</div>
              )}
              
              <div className="flex items-end gap-2">
                <input 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-[#F3F3F5]" 
                  placeholder="Add a comment or note..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className={`px-4 py-2 bg-gray-900 text-white rounded-lg text-sm ${submittingComment || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                >
                  {submittingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-sm font-semibold text-gray-900">Assignment</div>
            <div className="mt-3">
              <div className="text-xs text-gray-600">Department</div>
              <div className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900"><FiHome className="w-3.5 h-3.5 text-gray-600" />{memo.assigned_to?.department_name || 'Unassigned'}</div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-600">Assigned Officer</div>
              <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-900">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                  {memo.assigned_to?.name ? memo.assigned_to.name.charAt(0) : 'U'}
                </div>
                <span>{memo.assigned_to?.name || 'Unassigned'}</span>
                {memo.assigned_to?.email && <span className="text-xs text-gray-600">{memo.assigned_to.email}</span>}
              </div>
            </div>
            {memo.assignment_remarks && (
              <div className="mt-3">
                <div className="text-xs text-gray-600">Assignment Remarks</div>
                <div className="mt-1 text-sm text-gray-900">{memo.assignment_remarks}</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-sm font-semibold text-gray-900">Processing Stats</div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700">Time in System</span><span className="text-sm font-medium text-gray-900">
                {Math.floor((new Date() - new Date(memo.created_at)) / (1000 * 60 * 60 * 24))} days
              </span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700">Total Movements</span><span className="text-sm font-medium text-gray-900">{memo.movement_timeline?.length || 0}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700">Comments</span><span className="text-sm font-medium text-gray-900">{memo.comments?.length || 0}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-700">Attachments</span><span className="text-sm font-medium text-gray-900">{memo.attachments?.length || 0}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-sm font-semibold text-gray-900">Quick Actions</div>
            <div className="mt-3 space-y-2">
              <button type="button" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2"><FiDownload className="w-4 h-4" />Download All Attachments</button>
              <button type="button" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2"><FiFileText className="w-4 h-4" />Generate Report</button>
              <button type="button" onClick={copyTracking} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2"><FiCopy className="w-4 h-4" />Copy Tracking URL</button>
              <button type="button" onClick={() => setShowShareModal(true)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2"><FiShare2 className="w-4 h-4" />Share Memo</button>
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

      <ConfirmationModal 
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleMarkComplete}
        title="Mark Memo as Complete"
        message="Close this memo and mark all actions as completed"
        subMessage="This will mark the memo as completed and close it for further processing."
        confirmText="Mark Complete"
        isProcessing={isProcessingAction}
      />

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMemo}
        title="Delete Memo"
        message="Are you sure you want to delete this memo?"
        subMessage="This action cannot be undone. All data associated with this memo will be permanently removed."
        confirmText="Delete Memo"
        isProcessing={isProcessingAction}
      />

      <ShareMemo
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        trackingId={memo.tracking_id}
        trackingUrl={`https://track.smt.tfnsolutions.us/${memo.tracking_id}`}
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

