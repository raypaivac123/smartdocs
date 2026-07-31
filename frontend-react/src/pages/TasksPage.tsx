import { useCallback, useEffect, useMemo, useState } from 'react';
import { PriorityBadge, TaskStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/ToastContext';
import { api, ApiError } from '../lib/api';
import { toTaskItem } from '../lib/mappers';
import type { TaskItem, TaskStatus } from '../lib/types';
import { CalendarIcon, CheckCircleIcon, ClockIcon, DocumentsIcon, RefreshIcon, TasksIcon, UserIcon } from '../components/ui/Icons';

export function TasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<TaskStatus | ''>('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const page = await api.getTasks({ status: filter });
      setTasks(page.content.map(toTaskItem));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks]);

  async function changeStatus(id: string, status: TaskStatus) {
    const previous = tasks;
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)));
    try {
      await api.updateTaskStatus(id, status);
      showToast('Task status updated.', 'success');
    } catch (err) {
      setTasks(previous);
      showToast(err instanceof ApiError ? err.message : 'Failed to update task.', 'error');
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <p className="page-subtitle">Manage automatically generated tasks from document processing</p>
      </div>

      <div className="stats-grid cols-4">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Tasks</span>
            <div className="stat-icon gray"><TasksIcon /></div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pending</span>
            <div className="stat-icon yellow"><ClockIcon /></div>
          </div>
          <div className="stat-value yellow">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">In Progress</span>
            <div className="stat-icon blue"><RefreshIcon /></div>
          </div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Done</span>
            <div className="stat-icon green"><CheckCircleIcon /></div>
          </div>
          <div className="stat-value green">{stats.done}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="toolbar-row">
          <div>
            <div className="card-title">All Tasks</div>
            <div className="card-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</div>
          </div>
          <select className="select-field" value={filter} onChange={e => setFilter(e.target.value as TaskStatus | '')}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div style={{ padding: '0 20px' }}>
          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading tasks...</div></div>
          ) : loadError ? (
            <div className="empty-state">
              <div className="empty-state-title">Could not load tasks</div>
              <div className="empty-state-text">{loadError}</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No tasks found</div>
              <div className="empty-state-text">Try adjusting your filter</div>
            </div>
          ) : tasks.map((t, i) => (
            <div key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid #F3F4F6' : 'none', padding: '18px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: '#111827' }}>{t.title}</span>
                    <PriorityBadge value={t.priority} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {t.document && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6B7280' }}>
                        <DocumentsIcon className="icon-13" /> {t.document}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6B7280' }}>
                      <UserIcon className="icon-13" /> {t.assignee}
                    </span>
                    {t.due && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6B7280' }}>
                        <CalendarIcon className="icon-13" /> Due: {t.due}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <TaskStatusBadge value={t.status} />
                  <select
                    className="select-field" style={{ fontSize: 12.5, padding: '5px 28px 5px 10px' }}
                    value={t.status} onChange={e => changeStatus(t.id, e.target.value as TaskStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
