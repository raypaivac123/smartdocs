import { useState } from 'react';
import { Auth } from '../lib/auth';
import { useToast } from '../components/ui/ToastContext';
import { LockIcon, ShieldIcon } from '../components/ui/Icons';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track"><div className="toggle-thumb" /></div>
    </label>
  );
}

export function SettingsPage() {
  const { showToast } = useToast();
  const currentUser = Auth.getUser();

  const [name, setName] = useState(currentUser?.name ?? 'Anna Schmidt');
  const [email, setEmail] = useState(currentUser?.email ?? 'dev@smartdocs.de');
  const [initials, setInitials] = useState(currentUser?.initials ?? 'AS');
  const role = currentUser?.role ?? 'ADMIN';

  const [twoFa, setTwoFa] = useState(false);
  const [notifProcessing, setNotifProcessing] = useState(true);
  const [notifErrors, setNotifErrors] = useState(true);
  const [notifTasks, setNotifTasks] = useState(false);

  function saveProfile() {
    if (!name.trim() || !email.trim()) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    const newInitials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setInitials(newInitials);
    Auth.save(Auth.getToken() ?? 'mock-jwt', { name: name.trim(), email: email.trim(), initials: newInitials, role });
    showToast('Profile saved successfully.', 'success');
  }

  function toggleChanged(label: string, val: boolean) {
    showToast(`${label} ${val ? 'enabled' : 'disabled'}.`, 'info');
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account settings and system preferences</p>
      </div>

      <div className="settings-card">
        <div className="settings-card-title">User Profile</div>
        <div className="settings-card-sub">Your personal account information</div>

        <div className="profile-header-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
          <div className="profile-avatar">{initials}</div>
          <div className="profile-fields">
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldIcon className="text-muted" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Role</div>
              <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>Your system access level</div>
            </div>
          </div>
          <span className="role-badge">{role}</span>
        </div>

        <div className="settings-divider" />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-title">Security Settings</div>
        <div className="settings-card-sub">Manage your password and security preferences</div>

        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-row-icon"><LockIcon /></div>
            <div>
              <div className="setting-row-title">Password</div>
              <div className="setting-row-sub">Last changed 3 months ago</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => showToast('Password change dialog coming soon.', 'info')}>
            Change Password
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-row-icon"><ShieldIcon /></div>
            <div>
              <div className="setting-row-title">Two-Factor Authentication</div>
              <div className="setting-row-sub">Add an extra layer of security</div>
            </div>
          </div>
          <Toggle checked={twoFa} onChange={v => { setTwoFa(v); toggleChanged('2FA', v); }} />
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-title">Notification Preferences</div>
        <div className="settings-card-sub">Choose what notifications you want to receive</div>

        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-row-icon" style={{ background: '#FFF7ED' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <div>
              <div className="setting-row-title">Document Processing Complete</div>
              <div className="setting-row-sub">Get notified when AI processing finishes</div>
            </div>
          </div>
          <Toggle checked={notifProcessing} onChange={v => { setNotifProcessing(v); toggleChanged('Document Processing', v); }} />
        </div>

        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-row-icon" style={{ background: '#FFF7ED' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <div>
              <div className="setting-row-title">Processing Errors</div>
              <div className="setting-row-sub">Get notified about system errors</div>
            </div>
          </div>
          <Toggle checked={notifErrors} onChange={v => { setNotifErrors(v); toggleChanged('Error Notifications', v); }} />
        </div>

        <div className="setting-row">
          <div className="setting-row-left">
            <div className="setting-row-icon" style={{ background: '#FFF7ED' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <div>
              <div className="setting-row-title">New Task Assigned</div>
              <div className="setting-row-sub">Get notified when a task is assigned to you</div>
            </div>
          </div>
          <Toggle checked={notifTasks} onChange={v => { setNotifTasks(v); toggleChanged('Task Notifications', v); }} />
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-title">API &amp; Integrations</div>
        <div className="settings-card-sub">Connected services and infrastructure status</div>

        <div className="integration-row">
          <div className="integration-left">
            <div className="integration-icon" style={{ background: '#F0FDF4' }}>🤖</div>
            <div>
              <div className="integration-name">AI Provider</div>
              <div className="integration-desc">Document analysis engine (Claude / Groq)</div>
            </div>
          </div>
          <span className="badge badge-processed">Connected</span>
        </div>

        <div className="integration-row">
          <div className="integration-left">
            <div className="integration-icon" style={{ background: '#FFFBEB' }}>🐰</div>
            <div>
              <div className="integration-name">RabbitMQ</div>
              <div className="integration-desc">Message queue for async processing</div>
            </div>
          </div>
          <span className="badge badge-processed">Connected</span>
        </div>

        <div className="integration-row">
          <div className="integration-left">
            <div className="integration-icon" style={{ background: '#EFF6FF' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            </div>
            <div>
              <div className="integration-name">PostgreSQL</div>
              <div className="integration-desc">Primary database</div>
            </div>
          </div>
          <span className="badge badge-processed">Connected</span>
        </div>

        <div className="integration-row">
          <div className="integration-left">
            <div className="integration-icon" style={{ background: '#EFF6FF' }}>🐳</div>
            <div>
              <div className="integration-name">Docker</div>
              <div className="integration-desc">Containerization platform</div>
            </div>
          </div>
          <span className="badge badge-blue">Active</span>
        </div>
      </div>
    </>
  );
}
