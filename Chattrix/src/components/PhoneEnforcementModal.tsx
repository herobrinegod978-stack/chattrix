import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import '../pages/LoginPage.css'; // Reuse login styles

export default function PhoneEnforcementModal() {
  const { session, user, refreshUser } = useAuthContext();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show only if user is logged in but has no phone_number
  // We check for session because user profile might be null while loading initially
  if (!session || (user && user.phone_number)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict validation: must be 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // First, ensure the user record exists (it should have been created by a trigger, 
      // but let's be safe or just perform the update)
      const { error: updateError } = await supabase
        .from('users')
        .upsert({ 
          id: session.user.id, 
          email: session.user.email,
          phone_number: phone.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (updateError) throw updateError;
      
      // Refresh the context so the modal disappears
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to save phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="login-card" style={{ maxWidth: '400px', width: '90%' }}>
        <h2 className="login-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Complete Profile</h2>
        <p className="login-subtitle" style={{ marginBottom: '1.5rem' }}>
          Please enter your phone number to continue using Chattrix.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="Enter your phone number"
              className={`login-input ${error ? 'error' : ''}`}
              autoComplete="tel"
            />
            {error && <span className="field-error">{error}</span>}
          </div>

          <button
            type="submit"
            className="login-btn primary"
            disabled={loading || phone.trim().length < 10}
            style={{ marginTop: '1rem' }}
          >
            {loading ? (
              <Loader2 size={20} className="spinner" />
            ) : (
              'Save Phone Number'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
