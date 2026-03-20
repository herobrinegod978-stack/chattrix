import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { usePresence } from './hooks/usePresence';
import AppRouter from './routes/AppRouter';
import PhoneEnforcementModal from './components/PhoneEnforcementModal';

function AppContent() {
  usePresence();
  return (
    <Suspense fallback={
      <div className="global-loader" style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="loading-spinner" style={{
          width: 32, height: 32, border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-primary)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    }>
      <AppRouter />
      <PhoneEnforcementModal />
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
