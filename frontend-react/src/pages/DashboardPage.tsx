import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { ClassificationBadge, StatusBadge } from '../components/ui/Badge';
import { api, ApiError } from '../lib/api';
import { toDocumentItem } from '../lib/mappers';
import type { DocumentItem } from '../lib/types';
import {
  CheckCircleIcon, ClockIcon, DocumentsIcon, TasksIcon, XCircleIcon,
} from '../components/ui/Icons';

const WEEKLY_DATA = [17, 24, 32, 29, 25];
const WEEKLY_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

function useBarChart(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = 220;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const maxVal = 36;
      const padL = 44, padR = 16, padT = 12, padB = 36;
      const chartW = w - padL - padR;
      const chartH = h - padT - padB;
      const barW = (chartW / WEEKLY_DATA.length) * 0.55;
      const barGap = chartW / WEEKLY_DATA.length;

      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 1;
      [0, 8, 16, 24, 32].forEach(v => {
        const y = padT + chartH - (v / maxVal) * chartH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(v), padL - 6, y + 4);
      });

      WEEKLY_DATA.forEach((v, i) => {
        const x = padL + i * barGap + (barGap - barW) / 2;
        const bh = (v / maxVal) * chartH;
        const y = padT + chartH - bh;
        const r = 6;
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + bh);
        ctx.lineTo(x, y + bh);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#6B7280';
        ctx.font = '11.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(WEEKLY_LABELS[i], x + barW / 2, h - 10);
      });
    }

    const t = setTimeout(draw, 50);
    window.addEventListener('resize', draw);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', draw);
    };
  }, [canvasRef]);
}

function DemoDataTag() {
  return (
    <span
      className="badge"
      style={{ color: '#9CA3AF', background: '#F3F4F6', borderColor: '#E5E7EB', marginLeft: 8 }}
      title="No aggregation endpoint exists on the backend yet for this widget — kept as illustrative data"
    >
      demo data
    </span>
  );
}

export function DashboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBarChart(canvasRef);

  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [openTasks, setOpenTasks] = useState<number>(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [docsPage, tasksPage] = await Promise.all([
          api.getDocuments({ size: 100 }),
          api.getTasks({ status: 'pending', size: 1 }),
        ]);
        setDocs(docsPage.content.map(toDocumentItem));
        setOpenTasks(tasksPage.totalElements);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : 'Could not reach the server.');
      }
    }
    load();
  }, []);

  const stats = useMemo(() => ({
    total: docs.length,
    pending: docs.filter(d => d.status === 'pending').length,
    processed: docs.filter(d => d.status === 'processed').length,
    error: docs.filter(d => d.status === 'error').length,
  }), [docs]);

  const recentDocs = docs.slice(0, 4);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of document processing and system activity</p>
      </div>

      {loadError && (
        <div className="info-box" style={{ borderLeftColor: '#DC2626' }}>
          <div className="info-box-icon" style={{ background: '#FEF2F2' }}><XCircleIcon className="text-red" /></div>
          <div>
            <div className="info-box-title">Could not load live data</div>
            <div className="info-box-text">{loadError}</div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard label="Total Documents" value={stats.total} icon={<DocumentsIcon />} iconColor="blue" />
        <StatCard label="Pending Processing" value={stats.pending} icon={<ClockIcon />} iconColor="yellow" valueColor="yellow" />
        <StatCard label="Processed" value={stats.processed} icon={<CheckCircleIcon />} iconColor="green" valueColor="green" />
        <StatCard label="Errors" value={stats.error} icon={<XCircleIcon />} iconColor="red" valueColor="red" />
        <StatCard label="Open Tasks" value={openTasks} icon={<TasksIcon />} iconColor="teal" />
      </div>

      <div className="grid-auto mb-20">
        <div className="card">
          <div className="card-title">Documents Processed per Week<DemoDataTag /></div>
          <div className="card-subtitle mb-16">Last 5 weeks processing activity</div>
          <canvas ref={canvasRef} height={220} style={{ width: '100%', display: 'block' }} />
        </div>

        <div className="card">
          <div className="card-title">AI Processing Queue<DemoDataTag /></div>
          <div className="card-subtitle">Current processing status</div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                <span style={{ fontSize: 13.5, color: '#374151' }}>Active Workers</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClockIcon className="text-amber" />
                <span style={{ fontSize: 13.5, color: '#374151' }}>In Queue</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{stats.pending}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircleIcon className="text-green" />
                <span style={{ fontSize: 13.5, color: '#374151' }}>Processed Today</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{stats.processed}</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>System Status</span>
              <span className="badge badge-operational">Operational</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['RabbitMQ: Connected', 'AI Provider: Active', 'PostgreSQL: Connected'].map(label => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-16">
          <div>
            <div className="card-title">Recent Documents</div>
            <div className="card-subtitle">Latest uploaded and processed documents</div>
          </div>
          <Link to="/documents" className="btn btn-ghost" style={{ fontSize: 13, color: '#2563EB' }}>View all →</Link>
        </div>
        <div>
          {recentDocs.length === 0 ? (
            <div className="empty-state"><div className="empty-state-text">No documents uploaded yet.</div></div>
          ) : recentDocs.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                borderBottom: i < recentDocs.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <div className="doc-icon-wrap"><DocumentsIcon /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.filename}
                </div>
                <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>
                  Uploaded by {d.uploadedBy} &bull; {d.uploadedAt}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <StatusBadge value={d.status} />
                <ClassificationBadge value={d.classification} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
