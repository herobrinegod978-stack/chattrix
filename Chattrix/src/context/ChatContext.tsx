import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthContext';
import type { Chat, User, Message } from '../types';

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!user) { setChats([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from('chats')
      .select(`
        id, user1_id, user2_id, last_message_id, created_at,
        user1:users!user1_id(id, name, phone, dp_url, is_online, email),
        user2:users!user2_id(id, name, phone, dp_url, is_online, email)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) { console.error('Error fetching chats:', error); setLoading(false); return; }

    // Process chats — attach other_user and last_message
    const processedChats: Chat[] = [];
    for (const chat of (data || [])) {
      const otherUser = chat.user1_id === user.id
        ? (chat.user2 as unknown as User)
        : (chat.user1 as unknown as User);

      let lastMessage: Message | undefined;
      if (chat.last_message_id) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('id', chat.last_message_id)
          .single();
        if (msgData) lastMessage = msgData as Message;
      }

      // Get unread count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chat.id)
        .neq('sender_id', user.id)
        .eq('status', 'sent')
        .is('deleted_at', null);

      processedChats.push({
        ...chat,
        other_user: otherUser,
        last_message: lastMessage,
        unread_count: count || 0,
      });
    }

    // Sort by last message time
    processedChats.sort((a, b) => {
      const timeA = a.last_message?.created_at || a.created_at;
      const timeB = b.last_message?.created_at || b.created_at;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    setChats(processedChats);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chats-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
      }, () => { fetchChats(); })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => { fetchChats(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchChats]);

  return (
    <ChatContext.Provider value={{ chats, loading, refreshChats: fetchChats }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
}
