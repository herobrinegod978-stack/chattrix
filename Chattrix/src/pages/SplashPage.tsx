import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './SplashPage.css';

export default function SplashPage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLeaving(true);

      setTimeout(async () => {
        const hasSession = localStorage.getItem('chattrix_session');
        if (hasSession) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/home', { replace: true });
            return;
          }
        }
        navigate('/login', { replace: true });
      }, 400);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`splash-screen ${leaving ? 'splash-leave' : ''}`}>
      <div className="splash-content">
        <h1 className="splash-logo">Chattrix</h1>
      </div>
      <p className="splash-footer">Powered by Pritam Choudhary</p>
    </div>
  );
}
