import { useState, useEffect } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../types';
import { formatMessageTime } from '../utils/formatTime';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  onLongPress?: () => void;
}

export default function ChatBubble({ message, isOwn, onLongPress }: ChatBubbleProps) {
  const [showSmoke, setShowSmoke] = useState(false);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Show smoke effect for new messages
    const msgAge = Date.now() - new Date(message.created_at).getTime();
    if (msgAge < 2000) {
      setShowSmoke(true);
      const timer = setTimeout(() => setShowSmoke(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message.created_at]);

  const handleTouchStart = () => {
    if (isOwn && onLongPress) {
      const timer = setTimeout(() => onLongPress(), 600);
      setPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  if (message.deleted_at) {
    return (
      <div className={`chat-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
        <div className={`chat-bubble deleted ${isOwn ? 'sent' : 'received'}`}>
          <span className="deleted-text">🚫 This message was deleted</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
      <div
        className={`chat-bubble ${isOwn ? 'sent' : 'received'} ${message.type === 'emoji' ? 'emoji-only' : ''}`}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="bubble-content">{message.content}</span>
        <div className="bubble-meta">
          <span className="bubble-time">{formatMessageTime(message.created_at)}</span>
          {isOwn && (
            <span className={`bubble-status ${message.status}`}>
              {message.status === 'seen' ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>
      {showSmoke && (
        <div className="smoke-particles">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`smoke-particle ${isOwn ? 'smoke-sent' : 'smoke-received'}`}
              style={{
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              ●
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
