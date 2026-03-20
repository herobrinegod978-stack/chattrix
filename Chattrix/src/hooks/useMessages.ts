import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Message } from '../types';

export function useMessages(chatId: string) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) { console.error('Fetch messages error:', error); return; }
    setMessages((data || []) as Message[]);
    setLoading(false);
  }, [chatId]);

  // Mark messages as seen when chat is opened
  const markAsSeen = useCallback(async () => {
    if (!user || !chatId) return;
    await supabase
      .from('messages')
      .update({ status: 'seen' })
      .eq('chat_id', chatId)
      .neq('sender_id', user.id)
      .eq('status', 'sent');
  }, [user, chatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !chatId || !content.trim()) return;

    const isEmoji = /^[\p{Emoji}\s]+$/u.test(content.trim());
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content: content.trim(),
        type: isEmoji ? 'emoji' : 'text',
      })
      .select()
      .single();

    if (error) { console.error('Send message error:', error); return; }

    // Update chat's last_message_id
    await supabase
      .from('chats')
      .update({ last_message_id: (message as Message).id })
      .eq('id', chatId);
  }, [user, chatId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;
    await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('sender_id', user.id);
  }, [user]);

  useEffect(() => {
    fetchMessages();
    markAsSeen();
  }, [fetchMessages, markAsSeen]);

  // Realtime subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload: any) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark as seen if it's from the other user
        if (user && newMsg.sender_id !== user.id) {
          supabase
            .from('messages')
            .update({ status: 'seen' })
            .eq('id', newMsg.id)
            .then();
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload: any) => {
        const updated = payload.new as Message;
        setMessages(prev =>
          prev.map(m => m.id === updated.id ? updated : m)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, user]);

  return { messages, loading, sendMessage, deleteMessage, markAsSeen };
}
