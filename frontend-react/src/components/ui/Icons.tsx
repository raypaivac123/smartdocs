type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const DashboardIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);

export const DocumentsIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

export const UploadIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

export const TasksIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
);

export const AuditIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);

export const SettingsIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M20 12h-1M5 12H4M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 20v-1M12 5V4"/></svg>
);

export const BellIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

export const FilterIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

export const LogoIcon = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2.5} className={className}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="2"/><path d="M12 13v-2"/></svg>
);

export const MenuIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export const EyeIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

export const TrashIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
);

export const ClockIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export const CheckCircleIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export const XCircleIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

export const RefreshIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
);

export const DownloadIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

export const CalendarIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

export const UserIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export const ShieldIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2" ry="2"/><path d="M7 10V7a5 5 0 0110 0v3"/></svg>
);

export const DatabaseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
);
