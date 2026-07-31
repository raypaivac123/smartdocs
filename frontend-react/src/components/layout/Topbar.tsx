import { useNavigate } from 'react-router-dom';
import { Auth } from '../../lib/auth';
import { BellIcon, MenuIcon, SearchIcon } from '../ui/Icons';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const user = Auth.getUser() ?? { name: 'Anna Schmidt', role: 'ADMIN', initials: 'AS', email: '' };

  function handleAvatarClick() {
    navigate('/settings');
  }

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Abrir menu">
        <MenuIcon />
      </button>
      <div className="topbar-search">
        <SearchIcon />
        <input type="text" placeholder="Search documents, tasks, users..." />
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <div className="topbar-bell">
          <BellIcon />
          <div className="topbar-bell-dot" />
        </div>
        <div className="topbar-user" onClick={handleAvatarClick}>
          <div className="topbar-user-info">
            <div className="topbar-user-name">{user.name}</div>
            <div className="topbar-user-role">{user.role}</div>
          </div>
          <div className="topbar-avatar">{user.initials || user.name.slice(0, 2).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}
