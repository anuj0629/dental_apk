import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import UserDetailPage from './pages/admin/UserDetailPage.jsx';
import UserDashboard from './pages/user/UserDashboard.jsx';
import NewAnalysisPage from './pages/user/NewAnalysisPage.jsx';
import HistoryPage from './pages/user/HistoryPage.jsx';
import PatientsPage from './pages/user/PatientsPage.jsx';
import ProfilePage from './pages/user/ProfilePage.jsx';
import ResultPage from './pages/ResultPage.jsx';

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPage />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="records" element={<HistoryPage adminView />} />
      </Route>
      <Route
        path="/user"
        element={
          <ProtectedRoute roles={['user', 'admin']}>
            <DashboardLayout role="user" />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="analysis/new" element={<NewAnalysisPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route
        path="/results/:id"
        element={
          <ProtectedRoute roles={['admin', 'user']}>
            <ResultPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
