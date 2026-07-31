import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  iconColor?: 'blue' | 'yellow' | 'green' | 'red' | 'teal' | 'gray';
  valueColor?: 'yellow' | 'green' | 'red';
}

export function StatCard({ label, value, icon, iconColor = 'blue', valueColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon ${iconColor}`}>{icon}</div>
      </div>
      <div className={`stat-value ${valueColor ?? ''}`}>{value}</div>
    </div>
  );
}
