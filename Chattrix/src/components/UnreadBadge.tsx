import './UnreadBadge.css';

interface UnreadBadgeProps {
  count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="unread-badge">
      {count > 99 ? '99+' : count}
    </span>
  );
}
