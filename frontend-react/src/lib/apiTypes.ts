export interface ApiUser {
  id: number;
  email: string;
  name: string;
  role: string;
  initials: string;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface ApiTaskDto {
  id: string;
  title: string;
  documentId: string;
  documentName: string | null;
}

export interface ApiDocumentDto {
  id: string;
  filename: string;
  classification: string | null;
  status: string;
  pageCount: number | null;
  fileSizeMb: number | null;
  summary: string | null;
  extractedFields: Record<string, string> | null;
  uploadedBy: string | null;
  uploadedAt: string | null;
  tasks: ApiTaskDto[];
}
// Note: the backend's DocumentDto has no processedAt field today (see
// DocumentController.DocumentDto) — only uploadedAt is available.

export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ApiTaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  documentId: string | null;
  documentName: string | null;
  createdAt: string;
}

export interface ApiTaskPage {
  content: ApiTaskItem[];
  totalElements: number;
}

export interface ApiAuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
}

export interface ApiAuditPage {
  content: ApiAuditEvent[];
  totalElements: number;
  totalPages: number;
}
