import { useCallback, useEffect, useState } from 'react';
import { ActionBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/ToastContext';
import { api, ApiError } from '../lib/api';
import { toAuditEvent } from '../lib/mappers';
import type { AuditAction, AuditEvent } from '../lib/types';
import { AuditIcon, DownloadIcon } from '../components/ui/Icons';

export function AuditPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<AuditAction | ''>('');

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const page = await api.getAuditEvents({ action: filter, size: 100 });
      setEvents(page.content.map(toAuditEvent));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function exportCSV() {
    const rows = [['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'Details']];
    events.forEach(e => rows.push([e.timestamp, e.user, e.action, e.entity, e.entityId ?? '', e.detail]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(csv);
    a.download = `smartdocs-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Audit log exported as CSV.', 'success');
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Complete audit trail of all system operations and user actions</p>
      </div>

      <div className="info-box">
        <div className="info-box-icon"><AuditIcon /></div>
        <div>
          <div className="info-box-title">Immutable Audit Trail</div>
          <div className="info-box-text">
            All system events are logged immutably to PostgreSQL with full timestamp and user tracking.
            This ensures complete traceability and compliance with data processing regulations.
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="toolbar-row">
          <div>
            <div className="card-title">System Activity Log</div>
            <div className="card-subtitle">{events.length} event{events.length !== 1 ? 's' : ''} recorded</div>
          </div>
          <div className="toolbar-filters">
            <button className="btn btn-secondary" onClick={exportCSV}>
              <DownloadIcon />
              Export CSV
            </button>
            <select className="select-field" value={filter} onChange={e => setFilter(e.target.value as AuditAction | '')}>
              <option value="">All Actions</option>
              <option value="UPLOAD">Upload</option>
              <option value="PROCESSED">Processed</option>
              <option value="ERROR">Error</option>
              <option value="STATUS">Status</option>
              <option value="DELETE">Delete</option>
              <option value="TASK_GEN">Task Gen</option>
              <option value="REPROCESS">Reprocess</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">Loading audit log...</div></div></td></tr>
              ) : loadError ? (
                <tr><td colSpan={6}><div className="empty-state">
                  <div className="empty-state-title">Could not load audit log</div>
                  <div className="empty-state-text">{loadError}</div>
                </div></td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">No events recorded yet.</div></div></td></tr>
              ) : events.map(e => (
                <tr key={e.id}>
                  <td style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{e.timestamp}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="user-avatar-sm" style={{ background: e.color }}>{e.initials}</div>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{e.user}</span>
                    </div>
                  </td>
                  <td><ActionBadge value={e.action} /></td>
                  <td style={{ fontSize: 13, color: '#6B7280' }}>{e.entity}</td>
                  <td style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>{e.entityId ?? '-'}</td>
                  <td style={{ fontSize: 13, color: '#6B7280', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
