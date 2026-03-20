import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

export function usePresence() {
  const { user } = useAuthContext();

  const setOnline = useCallback(async (online: boolean) => {
    if (!user) return;
    await supabase
      .from('users')
      .update({ is_online: online, last_login: new Date().toISOString() })
      .eq('id', user.id);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set online
    setOnline(true);

    // Track with Supabase Presence
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // Presence synced
      })
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Set offline on unload
    const handleUnload = () => {
      setOnline(false);
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      setOnline(false);
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, setOnline]);
}
