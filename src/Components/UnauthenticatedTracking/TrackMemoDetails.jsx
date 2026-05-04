import React, { useState, useEffect } from 'react'
import { FiArrowLeft, FiCopy, FiClock, FiCheck, FiMapPin, FiUser, FiFileText, FiAlertCircle, FiChevronRight } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import logoDark from '../../assets/SMTLogoBLCK.png'
import axios from 'axios'

function TrackMemoDetails() {
  const [copied, setCopied] = useState(false)
  const [memoData, setMemoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchMemoDetails()
  }, [id])

  const fetchMemoDetails = async () => {
    try {
      const response = await axios.get(
        `https://memo.smt.tfnsolutions.us/api/v1/external-memos/tracking/${id}`,
        {
          headers: {
            'Authorization': 'Bearer 77|BJFAQjjEMznllju74cyTinyj88zbe30O3fSV2mHG07366d79'
          }
        }
      )
      
      if (response.data.status) {
        setMemoData(response.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch memo details:', err)
    } finally {
      setLoading(false)
    }
  }

  // Transform API data to component format
  const data = memoData ? {
    trackingId: memoData.tracking_id,
    title: memoData.subject,
    reference: memoData.reference_number,
    priority: memoData.priority,
    status: memoData.status,
    sender: memoData.sender_organization,
    senderContact: memoData.sender_contact,
    category: memoData.category_relation?.name || memoData.category,
    dateReceived: new Date(memoData.date_received).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    currentDepartment: memoData.movement_timeline?.[memoData.movement_timeline.length - 1]?.assigned_to_department || memoData.movement_timeline?.[memoData.movement_timeline.length - 1]?.forwarded_to_department || memoData.movement_timeline?.[memoData.movement_timeline.length - 1]?.department || 'N/A',
    daysInSystem: Math.ceil(memoData.quick_info?.days_in_system || 0),
    totalMovements: memoData.quick_info?.total_movements || 0,
    description: memoData.description,
    assignmentRemarks: memoData.assignment_remarks,
    timeline: memoData.movement_timeline?.map((item, index) => ({
      id: index + 1,
      title: item.action,
      subtitle: item.action === 'Assigned'
        ? `${item.assigned_by_department} → ${item.assigned_to_department}`
        : item.action === 'Forwarded'
          ? `${item.forwarded_by_department} → ${item.forwarded_to_department}`
          : null,
      date: item.date_time,
      description: item.action === 'Recorded'
        ? `Recorded by ${item.user_name} in ${item.department}`
        : item.action === 'Assigned'
          ? `Assigned by ${item.assigned_by} to ${item.assigned_to} (Status: ${item.status})`
          : item.action === 'Forwarded'
            ? `Forwarded by ${item.forwarded_by} to ${item.forwarded_to}${item.remarks ? ` - ${item.remarks}` : ''}`
            : item.action,
      status: index === memoData.movement_timeline.length - 1 ? 'current' : 'completed'
    })) || [],
    attachments: memoData.attachments || [],
    activityLogs: memoData.activity_logs || [],
    assignments: memoData.assignments || [],
    forwards: memoData.forwards || []
  } : {
    trackingId: 'EXT-2024-001',
    title: 'Curriculum Review Guidelines',
    reference: 'MOE/ADM/2024/0125',
    priority: 'high',
    status: 'processing',
    sender: 'Ministry of Education',
    category: 'Policy',
    dateReceived: 'Dec 9, 2024, 09:30 AM',
    currentDepartment: 'Academic Affairs',
    daysInSystem: 369,
    totalMovements: 4,
    description: 'New guidelines for curriculum review process for all academic departments. Requires implementation by Q1 2025.',
    timeline: [
      {
        id: 1,
        title: 'Received',
        date: 'Dec 9, 2024, 09:30 AM',
        description: 'Memo received from Ministry of Education via postal mail',
        status: 'completed'
      },
      {
        id: 2,
        title: 'Assigned',
        subtitle: 'Registry Office → Academic Affairs Department',
        date: 'Dec 9, 2024, 10:15 AM',
        description: 'Assigned to Academic Affairs for review and implementation',
        status: 'completed'
      },
      {
        id: 3,
        title: 'Acknowledged',
        date: 'Dec 9, 2024, 11:45 AM',
        description: 'Received and reviewing the guidelines',
        status: 'completed'
      },
      {
        id: 4,
        title: 'Forwarded',
        subtitle: 'Academic Affairs → Computer Science Department',
        date: 'Dec 9, 2024, 03:30 PM',
        description: 'Forwarded to CS department for curriculum updates',
        status: 'current'
      }
    ]
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.trackingId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoDark} alt="SmartMailTrack" className="h-12" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/memo-tracker" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all text-sm font-semibold">
              Track Memo
            </Link>
            <Link to="/login" className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-sm">
              <span className="text-sm font-semibold">Login</span>
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* Top Navigation & Tracking ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => navigate('/memo-tracker')}
              className="group flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
              Back to Search
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Tracking ID:</span>
              <span className="font-mono font-medium text-gray-900">{data.trackingId}</span>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                title="Copy Tracking ID"
              >
                {copied ? <FiCheck className="h-3 w-3 text-green-600" /> : <FiCopy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <FiClock className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-100 text-xs font-medium mb-1">
                  <FiClock className="w-3 h-3" />
                  Current Status
                </div>
                <h2 className="text-2xl font-bold capitalize">{data.status}</h2>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-blue-100 text-xs font-medium mb-1">Time in System</div>
                <div className="text-xl font-bold">{data.daysInSystem} days</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-4">

              {/* Memo Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{data.title}</h3>
                    <p className="text-xs text-gray-500 font-mono">{data.reference}</p>
                  </div>
                  {data.priority === 'high' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100 capitalize">
                      {data.priority} priority
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Sender Organization</dt>
                    <dd className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
                      <span className="p-0.5 rounded-full bg-gray-100 text-gray-600">
                        <FiUser className="w-2.5 h-2.5" />
                      </span>
                      {data.sender}
                    </dd>
                  </div>
                  {data.senderContact && (
                    <div>
                      <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Sender Contact</dt>
                      <dd className="text-xs font-medium text-gray-900">{data.senderContact}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Category</dt>
                    <dd className="text-xs font-medium text-gray-900">{data.category}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Date Received</dt>
                    <dd className="text-xs font-medium text-gray-900">{data.dateReceived}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Current Department</dt>
                    <dd className="text-xs font-medium text-gray-900">{data.currentDepartment}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Total Movements</dt>
                    <dd className="text-xs font-medium text-gray-900">{data.totalMovements}</dd>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Description</dt>
                  <dd className="text-xs text-gray-700 leading-relaxed">
                    {data.description}
                  </dd>
                </div>

                {data.assignmentRemarks && (
                  <div className="pt-4 border-t border-gray-100">
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Assignment Remarks</dt>
                    <dd className="text-xs text-gray-700 leading-relaxed">
                      {data.assignmentRemarks}
                    </dd>
                  </div>
                )}
              </div>

              {/* Timeline Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Processing Timeline</h3>
                    <p className="text-xs text-gray-500">Track the movement and processing history of your memo</p>
                  </div>
                </div>

                <div className="relative pl-3">
                  {/* Vertical line */}
                  <div className="absolute top-2 left-6 bottom-6 w-0.5 bg-gray-200" aria-hidden="true"></div>

                  <div className="space-y-6">
                    {data.timeline.map((step, index) => (
                      <div key={step.id} className="relative flex gap-4">
                        {/* Icon/Number */}
                        <div className="flex-shrink-0">
                          <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold border-2 border-white shadow-sm">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{step.title}</h4>
                              {step.subtitle && (
                                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                  {step.subtitle}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{step.date}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Column */}
            <div className="space-y-4">

              {/* Quick Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-4">Quick Info</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <dt className="text-xs text-gray-500">Status</dt>
                    <dd>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 capitalize">
                        {data.status}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <dt className="text-xs text-gray-500">Priority</dt>
                    <dd>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100 capitalize">
                        {data.priority}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <dt className="text-xs text-gray-500">Total Movements</dt>
                    <dd className="text-xs font-bold text-gray-900">{data.totalMovements}</dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <dt className="text-xs text-gray-500">Days in System</dt>
                    <dd className="text-xs font-bold text-gray-900">{data.daysInSystem}</dd>
                  </div>
                </dl>
              </div>

              {/* Status Guide Card */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-base font-bold text-gray-900 mb-3">Status Guide</h3>
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                      received
                    </span>
                    <p className="text-[10px] text-gray-600 leading-snug">Memo has been received and registered</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">
                      processing
                    </span>
                    <p className="text-[10px] text-gray-600 leading-snug">Currently being reviewed or actioned</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800">
                      forwarded
                    </span>
                    <p className="text-[10px] text-gray-600 leading-snug">Forwarded to another department</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                      completed
                    </span>
                    <p className="text-[10px] text-gray-600 leading-snug">Processing completed successfully</p>
                  </div>
                </div>
              </div>

              {/* Need Help Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-xs text-gray-500 mb-3">
                  If you have questions about your memo or need assistance, please contact:
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="font-medium text-gray-900 text-xs">Registry Office</div>
                  <a href="mailto:registry@university.edu" className="text-xs text-blue-600 hover:underline">
                    registry@university.edu
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
 )
}

      export default TrackMemoDetails
