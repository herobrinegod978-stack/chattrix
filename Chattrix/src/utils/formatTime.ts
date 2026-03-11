import { format, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'hh:mm a');
}

export function formatChatListTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'hh:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
}

export function formatLastSeen(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return `last seen today at ${format(date, 'hh:mm a')}`;
  if (isYesterday(date)) return `last seen yesterday at ${format(date, 'hh:mm a')}`;
  return `last seen ${format(date, 'dd/MM/yy')} at ${format(date, 'hh:mm a')}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return format(date, 'dd/MM/yy');
}
