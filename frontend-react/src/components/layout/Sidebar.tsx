import { NavLink } from 'react-router-dom';
import {
  AuditIcon, CloseIcon, DashboardIcon, DocumentsIcon, LogoIcon, SettingsIcon, TasksIcon, UploadIcon,
} from '../ui/Icons';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/documents', label: 'Documents', icon: DocumentsIcon },
  { to: '/upload', label: 'Upload', icon: UploadIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
  { to: '/audit', label: 'Audit Log', icon: AuditIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><LogoIcon /></div>
          <span className="sidebar-logo-text">SmartDocs</span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Fechar menu">
            <CloseIcon />
          </button>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}
