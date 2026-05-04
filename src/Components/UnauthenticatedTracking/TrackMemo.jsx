import React, { useState, useEffect } from 'react'
import { FiSearch, FiFileText, FiArrowRight, FiExternalLink, FiLoader, FiChevronRight } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import TrackMemoDetails from './TrackMemoDetails'
import axios from 'axios'
import logoDark from '../../assets/SMTLogoBLCK.png'

function UnauthenticatedTrackMemo() {
  const [trackingId, setTrackingId] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!trackingId.trim()) return

    setLoading(true)
    setError(null)
    setSearchResult(null)

    try {
      const response = await axios.get(
        `https://memo.smt.tfnsolutions.us/api/v1/external-memos/tracking/${trackingId}`,
        {
          headers: {
            'Authorization': 'Bearer 77|BJFAQjjEMznllju74cyTinyj88zbe30O3fSV2mHG07366d79'
          }
        }
      )

      if (response.data.status) {
        setSearchResult(response.data.data)
        setHasSearched(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch memo. Please check the tracking ID.')
    } finally {
      setLoading(false)
    }
  }

  const fillSample = (id) => {
    setTrackingId(id)
  }

  const handleViewDetails = () => {
    navigate(`/memo-tracker-details/${searchResult.tracking_id}`)
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

      <div className="pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-2">
              <FiFileText className="w-6 h-6 text-gray-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Memo Tracker</h1>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Track the status and movement of your memos in real-time using your unique tracking ID
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">Enter Tracking ID</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter the tracking ID provided to you when the memo was recorded or in your notification email
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="tracking-id" className="block text-xs font-medium text-gray-700 mb-1">
                  Tracking ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="tracking-id"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 border focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                    placeholder="EXT-2024-001"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <FiLoader className="mr-2 -ml-1 h-4 w-4 animate-spin" /> : <FiSearch className="mr-2 -ml-1 h-4 w-4" />}
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Try these sample tracking IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {['EXT-2024-001', 'EXT-2024-002', 'EXT-2024-003'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => fillSample(id)}
                      className="inline-flex items-center px-2.5 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && searchResult && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">Search Results</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Click on a memo to view detailed tracking information
                </p>
              </div>

              <div
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer group"
                onClick={handleViewDetails}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                        {searchResult.subject}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${searchResult.status === 'completed' ? 'bg-green-100 text-green-800' :
                          searchResult.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            searchResult.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {searchResult.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">From: {searchResult.sender_organization}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${searchResult.priority === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      searchResult.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                    {searchResult.priority}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 py-3 border-t border-gray-100">
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide">Tracking ID</dt>
                    <dd className="mt-0.5 text-xs font-medium text-gray-900">{searchResult.tracking_id}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide">Reference</dt>
                    <dd className="mt-0.5 text-xs font-medium text-gray-900">{searchResult.reference_number}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide">Category</dt>
                    <dd className="mt-0.5 text-xs font-medium text-gray-900">{searchResult.category}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide">Date Received</dt>
                    <dd className="mt-0.5 text-xs font-medium text-gray-900">{new Date(searchResult.date_received).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</dd>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button className="text-xs font-medium text-gray-900 group-hover:text-blue-600 flex items-center gap-1">
                    View Details <FiArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiExternalLink className="w-4 h-4 text-gray-900" />
              <h2 className="text-base font-semibold text-gray-900">How to Use Memo Tracker</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-900">Get Your Tracking ID</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    You will receive a tracking ID via email when a memo is recorded on your behalf, or when shared with you
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-900">Enter the Tracking ID</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Enter your unique tracking ID in the search box above
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-900">Track Your Memo</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    View real-time updates on your memo's status, current location, and processing timeline
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-[10px] text-gray-400">
              Having trouble tracking your memo? Contact the registry office for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

      export default UnauthenticatedTrackMemo
