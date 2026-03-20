import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import Avatar from '../components/Avatar';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import ConfirmModal from '../components/ConfirmModal';
import { formatDateSeparator, isSameDay } from '../utils/formatDate';
import { formatLastSeen } from '../utils/formatTime';
import type { User } from '../types';
import './ChatPage.css';

export default function ChatPage() {
  const { id: chatId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { messages, loading, sendMessage, deleteMessage } = useMessages(chatId || '');
  const { isOtherTyping, broadcastTyping } = useTyping(chatId || '');

  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch other user info
  useEffect(() => {
    if (!chatId || !user) return;

    async function fetchChatInfo() {
      const { data: chat } = await supabase
        .from('chats')
        .select(`
          user1_id, user2_id,
          user1:users!user1_id(id, name, phone_number, dp_url, is_online, last_login, email),
          user2:users!user2_id(id, name, phone_number, dp_url, is_online, last_login, email)
        `)
        .eq('id', chatId!)
        .single();

      if (chat) {
        const other = chat.user1_id === user!.id
          ? chat.user2 as unknown as User
          : chat.user1 as unknown as User;
        setOtherUser(other);
      }
    }
    fetchChatInfo();
  }, [chatId, user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      broadcastTyping();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        alert('Only text messages are allowed');
        return;
      }
    }
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <Avatar
          src={otherUser?.dp_url}
          name={otherUser?.name || otherUser?.email}
          size={36}
          isOnline={otherUser?.is_online || false}
          showOnlineIndicator={false}
        />
        <div className="chat-header-info">
          <span className="chat-header-name">
            {otherUser?.name || otherUser?.phone_number || otherUser?.email || 'Loading...'}
          </span>
          <span className="chat-header-status">
            {otherUser?.is_online
              ? 'online'
              : otherUser?.last_login
                ? formatLastSeen(otherUser.last_login)
                : ''}
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="messages-area">
        {loading ? (
          <div className="messages-loading">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const showDateSep = idx === 0 ||
              !isSameDay(messages[idx - 1].created_at, msg.created_at);

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="date-separator">
                    <span>{formatDateSeparator(msg.created_at)}</span>
                  </div>
                )}
                <ChatBubble
                  message={msg}
                  isOwn={msg.sender_id === user?.id}
                  onLongPress={() => {
                    if (msg.sender_id === user?.id && !msg.deleted_at) {
                      setDeleteMessageId(msg.id);
                    }
                  }}
                />
              </div>
            );
          })
        )}
        {isOtherTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="input-bar">
        <textarea
          ref={inputRef}
          className="message-input"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Message..."
          rows={1}
        />
        <button
          className={`send-btn ${inputText.trim() ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <Send size={20} />
        </button>
      </div>

      {/* Delete Confirm */}
      {deleteMessageId && (
        <ConfirmModal
          message="Delete this message?"
          onConfirm={async () => {
            await deleteMessage(deleteMessageId);
            setDeleteMessageId(null);
          }}
          onCancel={() => setDeleteMessageId(null)}
        />
      )}
    </div>
  );
}
