import type { ApiAuditEvent, ApiDocumentDto, ApiTaskItem } from './apiTypes';
import type { AuditAction, Classification, DocumentItem, DocumentStatus, TaskItem, TaskPriority, TaskStatus } from './types';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#0D9488', '#D97706', '#DC2626', '#16A34A'];

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.map(p => p[0]).join('').toUpperCase();
  return initials.slice(0, 2) || '?';
}

export function colorForUser(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function toDocumentItem(d: ApiDocumentDto): DocumentItem {
  return {
    id: d.id,
    filename: d.filename,
    classification: (d.classification as Classification) || null,
    status: d.status as DocumentStatus,
    uploadedBy: d.uploadedBy ?? 'Unknown',
    uploadedAt: d.uploadedAt ?? '',
    pageCount: d.pageCount,
    summary: d.summary,
    taskCount: d.tasks?.length ?? 0,
  };
}

export function toTaskItem(t: ApiTaskItem): TaskItem {
  return {
    id: t.id,
    title: t.title,
    priority: t.priority.toUpperCase() as TaskPriority,
    status: t.status as TaskStatus,
    document: t.documentName,
    assignee: t.assignedTo ?? 'Unassigned',
    due: t.dueDate,
  };
}

export function toAuditEvent(e: ApiAuditEvent) {
  return {
    id: e.id,
    timestamp: e.timestamp,
    user: e.user,
    initials: initialsOf(e.user),
    color: colorForUser(e.user),
    action: e.action as AuditAction,
    entity: e.entity,
    entityId: e.entityId || null,
    detail: e.detail,
  };
}
