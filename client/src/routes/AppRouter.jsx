import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/shared/LoadingScreen';
import PrivateRoute from './PrivateRoute';
import HomePage from '../pages/HomePage';
import FeedPage from '../pages/FeedPage';
import NetworkPage from '../pages/NetworkPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import JobsPage from '../features/jobs/JobsPage';
import JobDetailPage from '../features/jobs/JobDetailPage';
import MyApplicationsPage from '../features/jobs/MyApplicationsPage';
import SavedJobsPage from '../features/jobs/SavedJobsPage';
import MyJobPostsPage from '../features/jobs/MyJobPostsPage';
import ApplicantsPage from '../features/jobs/ApplicantsPage';
import MessagesPage from '../features/messages/MessagesPage';
import BlockedUsersPage from '../features/messages/BlockedUsersPage';
import NotificationsPage from '../features/notifications/NotificationsPage';
import ProfilePage from '../features/profile/ProfilePage';
import ProfileSetupPage from '../features/profile/ProfileSetupPage';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/feed" replace />;
  return children;
}

export default function AppRouter() {
  const { isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
      <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
      <Route path="/mynetwork" element={<PrivateRoute><NetworkPage /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
      {/* Static routes must precede the "/jobs/:id" param route so they are not swallowed. */}
      <Route path="/jobs/my-applications" element={<PrivateRoute><MyApplicationsPage /></PrivateRoute>} />
      <Route path="/jobs/saved" element={<PrivateRoute><SavedJobsPage /></PrivateRoute>} />
      <Route path="/jobs/my-posts" element={<PrivateRoute><MyJobPostsPage /></PrivateRoute>} />
      <Route path="/jobs/:id/applicants" element={<PrivateRoute><ApplicantsPage /></PrivateRoute>} />
      <Route path="/jobs/:id" element={<PrivateRoute><JobDetailPage /></PrivateRoute>} />
      <Route path="/messages/blocked" element={<PrivateRoute><BlockedUsersPage /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
      <Route path="/profile/setup" element={<PrivateRoute><ProfileSetupPage /></PrivateRoute>} />
      <Route path="/in/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
