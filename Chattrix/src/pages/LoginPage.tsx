import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validateEmail';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailError, setEmailError] = useState('');

  const isValid = email.trim() !== '' && validateEmail(email) && password.length >= 6 && (!isSignUp || phone.trim().length >= 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!phone.trim()) {
        setEmailError('Phone number is required');
        return;
      }
      const data = await signUp(email, password, phone);
      if (data) {
        // Since trigger auto-confirms, we can auto-login
        const loginData = await signIn(email, password);
        if (loginData) navigate('/home', { replace: true });
      }
    } else {
      const data = await signIn(email, password);
      if (data) navigate('/home', { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Chattrix</h1>
        <p className="login-subtitle">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); clearError(); }}
              placeholder="Enter your email"
              className={`login-input ${emailError ? 'error' : ''}`}
              autoComplete="email"
            />
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          {isSignUp && (
            <div className="input-group">
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); clearError(); }}
                placeholder="Enter your phone number"
                className="login-input"
                autoComplete="tel"
              />
            </div>
          )}

          <div className="input-group">
            <div className="password-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                placeholder="Enter your password"
                className="login-input"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isSignUp && password.length > 0 && password.length < 6 && (
              <span className="field-error">Password must be at least 6 characters</span>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="login-btn primary"
            disabled={!isValid || loading}
          >
            {loading ? (
              <Loader2 size={20} className="spinner" />
            ) : (
              isSignUp ? 'Create Account' : 'Log In'
            )}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          className="login-btn google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="toggle-auth">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            className="toggle-link"
            onClick={() => { setIsSignUp(!isSignUp); clearError(); }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
