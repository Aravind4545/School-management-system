import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly, studentOnly }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gold border-t-navy rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (studentOnly && user.role === 'admin') return <Navigate to="/admin" replace />;
  if ((user.mustChangePassword || user.must_change_password) && !window.location.pathname.includes('change-password')) {
    return <Navigate to="/change-password" replace />;
  }
  return children;
}
