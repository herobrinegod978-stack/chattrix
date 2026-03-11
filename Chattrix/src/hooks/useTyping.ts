import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

export function useTyping(chatId: string) {
  const { user } = useAuthContext();
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const channelRef = useRef<ReturnType<typeof supabase.channel>>();

  useEffect(() => {
    if (!chatId || !user) return;

    const channel = supabase.channel(`typing:${chatId}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherTyping = Object.entries(state).some(
          ([key, values]) => key !== user.id && (values as Array<{ typing?: boolean }>).some(v => v.typing)
        );
        setIsOtherTyping(otherTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ typing: false });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  const broadcastTyping = useCallback(async () => {
    if (!channelRef.current) return;

    await channelRef.current.track({ typing: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 1s of no keypress
    typingTimeoutRef.current = setTimeout(async () => {
      if (channelRef.current) {
        await channelRef.current.track({ typing: false });
      }
    }, 1000);
  }, []);

  return { isOtherTyping, broadcastTyping };
}
