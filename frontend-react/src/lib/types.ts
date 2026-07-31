export type Classification = 'CONTRACT' | 'INVOICE' | 'APPLICATION' | 'REPORT' | 'LEGAL_DOCUMENT';
export type DocumentStatus = 'processed' | 'pending' | 'error';

export interface DocumentItem {
  id: string;
  filename: string;
  classification: Classification | null;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  pageCount: number | null;
  summary: string | null;
  taskCount: number;
}

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'pending' | 'in-progress' | 'done';

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  document: string | null;
  assignee: string;
  due: string | null;
}

export type AuditAction = 'UPLOAD' | 'DELETE' | 'STATUS' | 'TASK_GEN' | 'REPROCESS' | 'PROCESSED' | 'ERROR';

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  initials: string;
  color: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  detail: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  initials: string;
}
