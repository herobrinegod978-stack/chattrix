import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { useChats } from '../hooks/useChats';
import Avatar from '../components/Avatar';
import UnreadBadge from '../components/UnreadBadge';
import FloatingActionButton from '../components/FloatingActionButton';
import ConfirmModal from '../components/ConfirmModal';
import BottomNav from '../components/BottomNav';
import { formatChatListTime } from '../utils/formatTime';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { chats, loading } = useChatContext();
  const { createChat, deleteChat } = useChats();

  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [phone, setPhone] = useState('');
  const [newChatError, setNewChatError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const filteredChats = chats.filter(chat => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = chat.other_user?.name?.toLowerCase() || '';
    const chatPhone = chat.other_user?.phone_number || '';
    return name.includes(q) || chatPhone.includes(q);
  });

  const handleNewChat = async () => {
    setNewChatError('');
    const phoneTrimmed = phone.trim();
    if (!phoneTrimmed) return;
    
    // Quick validation
    if (!/^[0-9]{10}$/.test(phoneTrimmed)) {
      setNewChatError('Enter a valid 10-digit phone number');
      return;
    }

    const chatId = await createChat(phoneTrimmed);
    if (chatId) {
      setShowNewChat(false);
      setPhone('');
      navigate(`/chat/${chatId}`);
    } else {
      setNewChatError('User not found or unavailable in Chattrix');
    }
  };

  const handleLongPressStart = (chatId: string) => {
    const timer = setTimeout(() => setDeleteTarget(chatId), 600);
    setPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <h1 className="header-title">Chattrix</h1>
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Chat List */}
      <div className="chat-list">
        {loading ? (
          <div className="empty-state">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-state">
            <p>{search ? 'No chats match your search' : 'No chats yet. Tap + to start a conversation'}</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => navigate(`/chat/${chat.id}`)}
              onMouseDown={() => handleLongPressStart(chat.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(chat.id)}
              onTouchEnd={handleLongPressEnd}
            >
              <Avatar
                src={chat.other_user?.dp_url}
                name={chat.other_user?.name || chat.other_user?.email}
                size={48}
                isOnline={chat.other_user?.is_online || false}
              />
              <div className="chat-info">
                <div className="chat-top-row">
                  <span className="chat-name">
                    {chat.other_user?.name || chat.other_user?.phone_number || chat.other_user?.email || 'Unknown'}
                  </span>
                  {chat.last_message && (
                    <span className="chat-time">{formatChatListTime(chat.last_message.created_at)}</span>
                  )}
                </div>
                <div className="chat-bottom-row">
                  <span className="chat-last-msg">
                    {chat.last_message
                      ? (chat.last_message.deleted_at
                          ? '🚫 This message was deleted'
                          : chat.last_message.content)
                      : 'Start a conversation...'}
                  </span>
                  <UnreadBadge count={chat.unread_count || 0} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FloatingActionButton onClick={() => setShowNewChat(true)} />
      <BottomNav />

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay" onClick={() => { setShowNewChat(false); setNewChatError(''); }}>
          <div className="new-chat-modal" onClick={e => e.stopPropagation()}>
            <h3>New Chat</h3>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={e => { setPhone(e.target.value); setNewChatError(''); }}
              className="modal-input"
            />
            {newChatError && <p className="modal-error">{newChatError}</p>}
            <button className="modal-search-btn" onClick={handleNewChat}>
              Search & Chat
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmModal
          message="Delete this chat?"
          onConfirm={async () => { await deleteChat(deleteTarget); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
