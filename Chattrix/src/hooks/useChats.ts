import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

export function useChats() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const createChat = useCallback(async (phone: string): Promise<string | null> => {
    if (!user) return null;
    setLoading(true);

    try {
      // Look up user by phone
      const { data: foundUser, error: findError } = await supabase
        .from('users')
        .select('id, name, phone, dp_url')
        .eq('phone', phone)
        .single();

      if (findError || !foundUser) {
        return null; // User not found
      }

      if (foundUser.id === user.id) {
        return null; // Can't chat with yourself
      }

      // Create or get existing chat
      const smallerId = user.id < foundUser.id ? user.id : foundUser.id;
      const largerId = user.id < foundUser.id ? foundUser.id : user.id;

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .upsert(
          { user1_id: smallerId, user2_id: largerId },
          { onConflict: 'user1_id,user2_id' }
        )
        .select()
        .single();

      if (chatError) { console.error('Create chat error:', chatError); return null; }
      return chat?.id || null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteChat = useCallback(async (chatId: string) => {
    await supabase.from('chats').delete().eq('id', chatId);
  }, []);

  return { createChat, deleteChat, loading };
}
