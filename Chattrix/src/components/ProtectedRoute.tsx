import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { session, user, loading } = useAuthContext();

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

  // If user profile is loaded and phone_number is missing, we let the PhoneEnforcementModal handle it,
  // but we could also force a redirect here if we had a dedicated /complete-profile route.
  // Since the modal is global, we just ensure it's rendered in App.tsx.
  // However, for extra security, we can prevent rendering the Outlet if phone is missing.
  if (user && !user.phone_number) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)'
      }}>
        {/* Placeholder to keep screen empty while modal shows */}
      </div>
    );
  }

  return <Outlet />;
}
