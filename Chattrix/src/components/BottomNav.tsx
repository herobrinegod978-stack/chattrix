import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, CircleDot, User } from 'lucide-react';
import './BottomNav.css';

const tabs = [
  { path: '/home', icon: MessageCircle, label: 'Chats' },
  { path: '/status', icon: CircleDot, label: 'Status' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <tab.icon size={22} />
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
