import { useState } from 'react';
import { useStatus } from '../hooks/useStatus';
import { useAuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import FloatingActionButton from '../components/FloatingActionButton';
import BottomNav from '../components/BottomNav';
import { formatRelativeTime } from '../utils/formatTime';
import type { Status } from '../types';
import './StatusPage.css';

const COLOR_OPTIONS = [
  '#FFD700', '#FFFFFF', '#000000', '#25D366',
  '#1E90FF', '#EF4444', '#8B5CF6', '#F97316',
  '#EC4899', '#14B8A6',
];

export default function StatusPage() {
  const { user } = useAuthContext();
  const { statuses, myStatuses, createStatus, deleteStatus } = useStatus();

  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFD700');
  const [viewingStatus, setViewingStatus] = useState<Status | null>(null);
  const [viewingList, setViewingList] = useState<Status[]>([]);
  const [viewingIndex, setViewingIndex] = useState(0);

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, s) => {
    const uid = s.user_id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(s);
    return acc;
  }, {} as Record<string, Status[]>);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    await createStatus(newContent.trim(), selectedColor);
    setNewContent('');
    setShowCreate(false);
  };

  const openStatusViewer = (statusList: Status[], index: number = 0) => {
    setViewingList(statusList);
    setViewingIndex(index);
    setViewingStatus(statusList[index]);
  };

  const nextStatus = () => {
    if (viewingIndex < viewingList.length - 1) {
      const next = viewingIndex + 1;
      setViewingIndex(next);
      setViewingStatus(viewingList[next]);
    } else {
      closeViewer();
    }
  };

  const closeViewer = () => {
    setViewingStatus(null);
    setViewingList([]);
    setViewingIndex(0);
  };

  return (
    <div className="status-page">
      <header className="status-header">
        <h1>Status</h1>
      </header>

      <div className="status-content">
        {/* My Status */}
        <div className="status-section">
          <div
            className="status-item my-status"
            onClick={() => myStatuses.length > 0 ? openStatusViewer(myStatuses) : setShowCreate(true)}
          >
            <Avatar
              src={user?.dp_url}
              name={user?.name || user?.email}
              size={48}
              showOnlineIndicator={false}
            />
            <div className="status-info">
              <span className="status-name">My Status</span>
              <span className="status-time">
                {myStatuses.length > 0
                  ? formatRelativeTime(myStatuses[0].created_at)
                  : 'Tap to add status'}
              </span>
            </div>
          </div>
        </div>

        {/* Contacts Statuses */}
        {Object.keys(groupedStatuses).length > 0 && (
          <div className="status-section">
            <h3 className="section-title">Recent updates</h3>
            {Object.entries(groupedStatuses).map(([userId, userStatuses]) => {
              const statusUser = userStatuses[0].user;
              return (
                <div
                  key={userId}
                  className="status-item"
                  onClick={() => openStatusViewer(userStatuses)}
                >
                  <div className="status-avatar-ring">
                    <Avatar
                      src={statusUser?.dp_url}
                      name={statusUser?.name || statusUser?.email}
                      size={48}
                      showOnlineIndicator={false}
                    />
                  </div>
                  <div className="status-info">
                    <span className="status-name">
                      {statusUser?.name || statusUser?.email || 'Unknown'}
                    </span>
                    <span className="status-time">
                      {formatRelativeTime(userStatuses[0].created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(groupedStatuses).length === 0 && (
          <div className="status-empty">
            <p>No status updates from your contacts</p>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setShowCreate(true)} />
      <BottomNav />

      {/* Create Status Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="create-status-modal" onClick={e => e.stopPropagation()}>
            <h3>New Status</h3>
            <div
              className="status-preview"
              style={{ background: selectedColor }}
            >
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={700}
                className="status-textarea"
                style={{ color: selectedColor === '#000000' || selectedColor === '#8B5CF6' ? '#FFFFFF' : '#000000' }}
              />
            </div>
            <div className="color-picker">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <button className="post-status-btn" onClick={handlePost} disabled={!newContent.trim()}>
              Post Status
            </button>
          </div>
        </div>
      )}

      {/* Status Viewer */}
      {viewingStatus && (
        <div className="status-viewer" onClick={nextStatus}>
          <div className="status-viewer-header">
            <div className="viewer-progress">
              {viewingList.map((_, i) => (
                <div key={i} className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${i < viewingIndex ? 'done' : i === viewingIndex ? 'active' : ''}`}
                  />
                </div>
              ))}
            </div>
            <div className="viewer-user-info">
              <Avatar
                src={viewingStatus.user?.dp_url}
                name={viewingStatus.user?.name}
                size={32}
                showOnlineIndicator={false}
              />
              <span className="viewer-name">{viewingStatus.user?.name || 'Unknown'}</span>
              <span className="viewer-time">{formatRelativeTime(viewingStatus.created_at)}</span>
            </div>
            <button className="viewer-close" onClick={(e) => { e.stopPropagation(); closeViewer(); }}>✕</button>
          </div>
          <div
            className="status-viewer-content"
            style={{ background: viewingStatus.background_color }}
          >
            <p style={{
              color: viewingStatus.background_color === '#000000' || viewingStatus.background_color === '#8B5CF6'
                ? '#FFFFFF' : '#000000'
            }}>
              {viewingStatus.content}
            </p>
          </div>
          {/* Delete own status */}
          {viewingStatus.user_id === user?.id && (
            <button
              className="delete-status-btn"
              onClick={(e) => { e.stopPropagation(); deleteStatus(viewingStatus.id); closeViewer(); }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
