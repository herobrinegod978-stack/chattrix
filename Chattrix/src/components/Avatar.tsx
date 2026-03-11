import './Avatar.css';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  isOnline?: boolean;
  showOnlineIndicator?: boolean;
  onClick?: () => void;
}

export default function Avatar({
  src,
  name,
  size = 48,
  isOnline = false,
  showOnlineIndicator = true,
  onClick,
}: AvatarProps) {
  const initial = (name || '?')[0].toUpperCase();

  return (
    <div
      className="avatar-container"
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="avatar-img"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="avatar-fallback"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {initial}
        </div>
      )}
      {showOnlineIndicator && (
        <span
          className={`avatar-status-dot ${isOnline ? 'online' : 'offline'}`}
          style={{
            width: size * 0.22,
            height: size * 0.22,
          }}
        />
      )}
    </div>
  );
}
