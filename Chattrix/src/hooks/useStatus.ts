import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Status } from '../types';

export function useStatus() {
  const { user } = useAuthContext();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    const { data, error } = await supabase
      .from('status')
      .select('*, user:users(id, name, dp_url, email)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) { console.error('Fetch statuses error:', error); return; }

    const all = (data || []) as Status[];
    setStatuses(all.filter(s => s.user_id !== user?.id));
    setMyStatuses(all.filter(s => s.user_id === user?.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('status-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'status',
      }, () => { fetchStatuses(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchStatuses]);

  const createStatus = useCallback(async (content: string, backgroundColor: string) => {
    if (!user) return;
    await supabase.from('status').insert({
      user_id: user.id,
      content,
      background_color: backgroundColor,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    await fetchStatuses();
  }, [user, fetchStatuses]);

  const deleteStatus = useCallback(async (statusId: string) => {
    await supabase.from('status').delete().eq('id', statusId);
    await fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, myStatuses, loading, createStatus, deleteStatus, refreshStatuses: fetchStatuses };
}
