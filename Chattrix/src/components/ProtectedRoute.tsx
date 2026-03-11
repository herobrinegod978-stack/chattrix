import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { session, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)'
      }}>
        <div className="loading-spinner" style={{
          width: 32, height: 32, border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-primary)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
