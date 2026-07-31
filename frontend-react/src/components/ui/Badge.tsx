import type { AuditAction, Classification, DocumentStatus, TaskPriority, TaskStatus } from '../../lib/types';

const classificationMap: Record<Classification, { cls: string; label: string }> = {
  CONTRACT: { cls: 'badge-vertrag', label: 'CONTRACT' },
  INVOICE: { cls: 'badge-rechnung', label: 'INVOICE' },
  APPLICATION: { cls: 'badge-antrag', label: 'APPLICATION' },
  REPORT: { cls: 'badge-bericht', label: 'REPORT' },
  LEGAL_DOCUMENT: { cls: 'badge-rechtsschreiben', label: 'LEGAL DOCUMENT' },
};

export function ClassificationBadge({ value }: { value: Classification | null }) {
  if (!value) return <span className="badge" style={{ color: '#9CA3AF' }}>—</span>;
  const { cls, label } = classificationMap[value];
  return <span className={`badge ${cls}`}>{label}</span>;
}

const statusMap: Record<DocumentStatus, { cls: string; label: string }> = {
  processed: { cls: 'badge-processed', label: 'PROCESSED' },
  pending: { cls: 'badge-pending', label: 'PENDING' },
  error: { cls: 'badge-error', label: 'ERROR' },
};

export function StatusBadge({ value }: { value: DocumentStatus }) {
  const { cls, label } = statusMap[value];
  return <span className={`badge ${cls}`}>{label}</span>;
}

const priorityMap: Record<TaskPriority, string> = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };

export function PriorityBadge({ value }: { value: TaskPriority }) {
  return <span className={`badge ${priorityMap[value]}`}>{value}</span>;
}

const taskStatusMap: Record<TaskStatus, { cls: string; label: string }> = {
  pending: { cls: 'badge-open', label: 'PENDING' },
  'in-progress': { cls: 'badge-in-progress', label: 'IN PROGRESS' },
  done: { cls: 'badge-done', label: 'DONE' },
};

export function TaskStatusBadge({ value }: { value: TaskStatus }) {
  const { cls, label } = taskStatusMap[value];
  return <span className={`badge ${cls}`}>{label}</span>;
}

const actionMap: Record<AuditAction, string> = {
  UPLOAD: 'badge-upload',
  DELETE: 'badge-delete',
  STATUS: 'badge-status',
  TASK_GEN: 'badge-task-gen',
  REPROCESS: 'badge-reprocess',
  PROCESSED: 'badge-processed',
  ERROR: 'badge-error',
};

export function ActionBadge({ value }: { value: AuditAction }) {
  return <span className={`badge ${actionMap[value] ?? 'badge-status'}`}>{value}</span>;
}
