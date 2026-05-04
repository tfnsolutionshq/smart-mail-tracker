import React, { useState } from 'react'
import { FiX, FiUpload, FiFile, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { identityBaseUrl } from '../../services/api'
import axios from 'axios'

function BulkUpload({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const { token } = useAuth()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        `${identityBaseUrl}/users/bulk-upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.status) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-bold text-gray-900">Bulk Upload Users</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Upload Successful!</h3>
              <p className="text-xs text-gray-600">Users have been uploaded successfully.</p>
            </div>
          ) : (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FiUpload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-xs font-medium text-gray-900 mb-1">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-500">Excel or CSV files only</p>
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FiFile className="w-4 h-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {!success && (
          <div className="flex items-center justify-end gap-2 p-4 border-t">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="w-3 h-3" />
                  Upload
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BulkUpload
