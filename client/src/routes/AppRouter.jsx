import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/shared/LoadingScreen';
import PrivateRoute from './PrivateRoute';
import HomePage from '../pages/HomePage';
import FeedPage from '../pages/FeedPage';
import NetworkPage from '../pages/NetworkPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import JobsPage from '../features/jobs/JobsPage';
import MessagingPage from '../features/messaging/MessagingPage';
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
      <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
      <Route path="/mynetwork" element={<PrivateRoute><NetworkPage /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
      <Route path="/messaging" element={<PrivateRoute><MessagingPage /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
      <Route path="/profile/setup" element={<PrivateRoute><ProfileSetupPage /></PrivateRoute>} />
      <Route path="/in/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
