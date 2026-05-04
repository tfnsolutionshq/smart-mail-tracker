import React from 'react'
import { FiArrowLeft, FiChevronRight, FiCheck, FiPaperclip } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import axios from 'axios'

export default function RecordExternalReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const { showNotification } = useNotification()
  const state = location.state || {}

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('subject', state.subject || '');
      data.append('sender_organization', state.senderOrg || '');
      data.append('sender_contact', state.senderContact || '');
      data.append('date_received', state.dateReceived || '');
      data.append('priority', state.priority || 'Medium');
      data.append('category', state.category || '');
      data.append('description', state.description || '');
      
      data.append('department_id', state.departmentId || ''); 
      data.append('assigned_officer_id', state.officerId || ''); 
      data.append('assignment_remarks', state.remarks || '');
      
      if (state.attachments && state.attachments.length > 0) {
        state.attachments.forEach((file) => {
          data.append('attachments[]', file);
        });
      }

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://memo.smt.tfnsolutions.us/api/v1/external-memos',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
        data : data
      };

      const response = await axios.request(config);
      showNotification('External memo recorded successfully', 'success')
      navigate('/record-external-success', { 
        state: { 
          memo: response.data?.data || response.data, // Handle potentially nested data wrapper
          ...state 
        } 
      });
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to submit memo', 'error')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4 lg:py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4">
        <FiArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Record External Memo</h1>
      <p className="text-gray-600 text-sm mt-1">Record incoming memo from external organization</p>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center sm:flex-nowrap flex-wrap gap-4 sm:gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center"><FiCheck className="w-3.5 h-3.5" /></span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Metadata</p>
                <p className="text-xs text-gray-600">Basic information</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-600">
              <span className="w-8 h-px bg-green-600"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center"><FiCheck className="w-3.5 h-3.5" /></span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Attachments</p>
                <p className="text-xs text-gray-600">Upload files (optional)</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-600">
              <span className="w-8 h-px bg-green-600"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center"><FiCheck className="w-3.5 h-3.5" /></span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Assignment</p>
                <p className="text-xs text-gray-600">Department & officer</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-600">
              <span className="w-8 h-px bg-green-600"></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">4</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Review</p>
                <p className="text-xs text-gray-600">Confirm details</p>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-3 w-full bg-gray-200 h-1 rounded-full">
          <div className="bg-black h-1 rounded-full" style={{ width: '100%' }}></div>
        </div> */}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mt-6">
        <div>
          <p className="text-sm font-semibold text-gray-900">Review</p>
          <p className="text-xs text-gray-600">Confirm details</p>
        </div>

        <div className="mt-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <FiPaperclip className="w-3.5 h-3.5 text-gray-700" />
              </span>
              <p className="text-sm font-medium text-gray-900">Memo Details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Reference Number</p>
                <p className="text-sm font-medium text-gray-900">{state.reference || '-'}</p>
              </div>
              <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Date Received</p>
                <p className="text-sm font-medium text-gray-900">{state.dateReceived || '-'}</p>
              </div>
              <div className="md:col-span-2 bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Subject</p>
                <p className="text-sm font-medium text-gray-900">{state.subject || '-'}</p>
              </div>
              <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Sender Organization</p>
                <p className="text-sm font-medium text-gray-900">{state.senderOrg || '-'}</p>
              </div>
              <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Priority</p>
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium">{state.priority || 'Medium'}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <FiPaperclip className="w-3.5 h-3.5 text-gray-700" />
              </span>
              <p className="text-sm font-medium text-gray-900">Attachments ({state.attachments?.length || 0})</p>
            </div>
            {state.attachments && state.attachments.length > 0 ? (
              <div className="space-y-2">
                {state.attachments.map((file, idx) => (
                  <div key={idx} className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2 flex items-center gap-2">
                    <FiPaperclip className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-sm text-gray-900 flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No attachments</p>
            )}
          </div>

          <div className="border rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <FiPaperclip className="w-3.5 h-3.5 text-gray-700" />
              </span>
              <p className="text-sm font-medium text-gray-900">Assignment</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Department</p>
                <p className="text-sm font-medium text-gray-900">{state.department || '-'}</p>
              </div>
              <div className="bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Officer</p>
                <p className="text-sm font-medium text-gray-900">{state.officer || '-'}</p>
              </div>
              <div className="md:col-span-2 bg-[#F3F3F5] border border-gray-300 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Assignment Remarks</p>
                <p className="text-sm font-medium text-gray-900">{state.remarks || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg" onClick={() => navigate('/record-external-assignment', { state })}>Previous</button>
          <button className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  )
}
