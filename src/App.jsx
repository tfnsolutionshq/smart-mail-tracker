import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './Pages/login'
import LandingPage from './Pages/landing'
import ForgotPassword from './Pages/forgot-password'
import ResetPassword from './Pages/reset-password'
import ResetPasswordNewPage from './Pages/reset-password-new'
import Dashboard from './Pages/dashboard'
import ComposeMemoPage from './Pages/ComposeMemoPage'
import Mailbox from './Pages/mailbox'
import Reports from './Pages/reports'
import MailContent from './Components/Mailbox/MailContent'
import Administration from './Pages/administration'
import Settings from './Pages/settings'
import Workflows from './Pages/workflows'
import CreateWorkflowPage from './Pages/create-workflow'
import WorkflowDetailsPage from './Pages/workflow-details'
import WorkflowAdminDetailsPage from './Pages/workflow-admin-details'
import ProfilePage from './Pages/profile'
import ActivityLogsPage from './Pages/activity-logs'
import RecordMemoPage from './Pages/RecordMemo/recordmemo'
import RecordExternalMemoPage from './Pages/RecordMemo/record-external'
import RecordExternalAttachmentsPage from './Pages/RecordMemo/record-external-attachments'
import RecordExternalAssignmentPage from './Pages/RecordMemo/record-external-assignment'
import RecordExternalReviewPage from './Pages/RecordMemo/record-external-review'
import RecordExternalSuccessPage from './Pages/RecordMemo/record-external-success'
import ViewExternalMemoPage from './Pages/ViewRecordMemo/view-external-memo'
import RecordMemoInboxPage from './Pages/ViewRecordMemo/record-memo-inbox'
import RecordMemoDetailsPage from './Pages/ViewRecordMemo/record-memo-details'
import UsersPage from './Pages/Users/users'
import UserMemosPage from './Pages/Users/UserMemosPage'
import AllMemosPage from './Pages/Users/AllMemosPage'
import AdminMailContent from './Components/Users/AdminMailContent'
import TrackMemoPage from './Pages/RecordMemo/track-memo'
import TrackMemoDetailsPage from './Pages/RecordMemo/track-memo-details'
import ManageDepartment from './Pages/ManageDepartment/manage-department'
import ViewDepartment from './Pages/ViewDepartment'
import UnauthenticatedTrackMemoPage from './Pages/UnauthenticatedTracker/track-memo'
import UnauthenticatedTrackMemoDetailsPage from './Pages/UnauthenticatedTracker/track-memo-details'
import BroadcastMemoPage from './Pages/BroadcastMemoPage'


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/new" element={<ResetPasswordNewPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/compose-memo" element={<ComposeMemoPage />} />
            <Route path="/mailbox" element={<Mailbox />} />
            <Route path="/mail-content/:id" element={<MailContent />} />
            <Route path="/record-memo" element={<RecordMemoPage />} />
            <Route path="/record-external-memo" element={<RecordExternalMemoPage />} />
            <Route path="/record-external-attachments" element={<RecordExternalAttachmentsPage />} />
            <Route path="/record-external-assignment" element={<RecordExternalAssignmentPage />} />
            <Route path="/record-external-review" element={<RecordExternalReviewPage />} />
            <Route path="/record-external-success" element={<RecordExternalSuccessPage />} />
            <Route path="/view-external-memo" element={<ViewExternalMemoPage />} />
            <Route path="/record-memo-inbox" element={<RecordMemoInboxPage />} />
            <Route path="/record-memo-details/:id" element={<RecordMemoDetailsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/create-workflow" element={<CreateWorkflowPage />} />
            <Route path="/edit-workflow/:id" element={<CreateWorkflowPage />} />
            <Route path="/workflow/:id" element={<WorkflowDetailsPage />} />
            <Route path="/workflow-admin/:id" element={<WorkflowAdminDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/activity-logs" element={<ActivityLogsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId/memos" element={<UserMemosPage />} />
            <Route path="/admin/all-memos" element={<AllMemosPage />} />
            <Route path="/admin/mail-content/:id" element={<AdminMailContent />} />
            <Route path="/track-memo" element={<TrackMemoPage />} />
            <Route path="/track-memo-details/:id" element={<TrackMemoDetailsPage />} />
            <Route path="/manage-department" element={<ManageDepartment />} />
            <Route path="/view-department" element={<ViewDepartment />} />
            <Route path="/broadcast-memo" element={<BroadcastMemoPage />} />
            <Route path="/memo-tracker" element={<UnauthenticatedTrackMemoPage />} />
            <Route path="/memo-tracker-details/:id" element={<UnauthenticatedTrackMemoDetailsPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
