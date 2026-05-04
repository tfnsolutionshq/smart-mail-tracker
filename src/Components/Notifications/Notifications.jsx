"use client"

import { FiCheck, FiClock, FiSettings, FiAlertTriangle, FiMessageCircle, FiMoreHorizontal, FiChevronDown } from "react-icons/fi"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import NotificationSettings from "./NotificationSettings"

export default function Notifications({ onClose, onUpdate }) {
  const { role, user, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const isAdmin = role === 'admin'

  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id || !token) {
        console.log('Missing user ID or token:', { userId: user?.id, hasToken: !!token })
        return
      }
      
      try {
        console.log('Fetching notifications for user:', user.id)
        const response = await axios.get(
          `https://notification.smt.tfnsolutions.us/api/v1/notifications/${user.id}?limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        console.log('Notifications response:', response.data)
        
        if (response.data.success) {
          setNotifications(response.data.data)
          setUnreadCount(response.data.unread_count)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        console.error('Error response:', error.response?.data)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotifications()
  }, [user?.id, token])
  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id)
    if (notification.data?.memo_id) {
      navigate(`/mail-content/${notification.data.memo_id}`)
      onClose()
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `https://notification.smt.tfnsolutions.us/api/v1/notifications/${notificationId}/read`
      )
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    try {
      await axios.put(
        `https://notification.smt.tfnsolutions.us/api/v1/notifications/${user.id}/read-all`
      )
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      onUpdate?.()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const filteredNotifications = activeTab === "unread" ? notifications.filter(n => !n.is_read) : notifications

  const getNotificationIcon = (type) => {
    switch (type) {
      case "memo_received": return FiMessageCircle
      case "memo_approval_required": return FiClock
      case "memo_commented": return FiMessageCircle
      case "memo_deadline_approaching": return FiAlertTriangle
      case "workflow_completed": return FiCheck
      case "approval_action_taken": return FiCheck
      default: return FiMessageCircle
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "memo_received": return "text-blue-500"
      case "memo_approval_required": return "text-orange-500"
      case "memo_commented": return "text-blue-500"
      case "memo_deadline_approaching": return "text-red-500"
      case "workflow_completed": return "text-green-500"
      case "approval_action_taken": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <>
      {/* Overlay to detect clicks outside */}
      <div className="fixed inset-0 z-30" onClick={onClose}></div>
      
      <div className="relative z-40 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 sm:max-h-[32rem] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <button onClick={markAllAsRead} className="text-xs hover:text-gray-700 font-medium">
            Mark all read
          </button>
          {/* {isAdmin && (
            <button 
              onClick={() => setShowSettings(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <FiSettings className="w-4 h-4 text-gray-600" />
            </button>
          )} */}
        </div>
      </div>

      {/* Filter Section */}
      {/* <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="relative">
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="appearance-none bg-gray-100 text-gray-700 px-3 py-2 pr-8 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
          </select>
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
        </div>
        <span className="text-xs text-gray-600 font-medium">{unreadCount} unread</span>
      </div> */}

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-80 sm:max-h-96">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  !notification.is_read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-full bg-gray-100 ${getIconColor(notification.type)}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-xs font-medium text-gray-900 truncate">{notification.title}</p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {/* <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0"></div> */}
                            <span className="text-xs text-gray-500 truncate">{notification.data?.actor_name || 'System'}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatTime(notification.created_at)}</span>
                        </div>
                      </div>
                      <button className="p-0.5 hover:bg-gray-200 rounded ml-1">
                        <FiMoreHorizontal className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      
      {/* Notification Settings */}
      {showSettings && (
        <NotificationSettings onClose={() => setShowSettings(false)} />
      )}
      </div>
    </>
  )
}