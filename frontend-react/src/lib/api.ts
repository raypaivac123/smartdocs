import { Auth } from './auth';
import type {
  ApiAuditPage, ApiDocumentDto, ApiPage, ApiTaskItem, ApiTaskPage, LoginResponse,
} from './apiTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = Auth.getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // response body wasn't JSON, keep default message
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getDocuments(params: { search?: string; classification?: string; status?: string; page?: number; size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.classification) query.set('classification', params.classification);
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return request<ApiPage<ApiDocumentDto>>(`/api/documents?${query.toString()}`);
  },

  getDocument(id: string) {
    return request<ApiDocumentDto>(`/api/documents/${id}`);
  },

  uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request<ApiDocumentDto>('/api/documents/upload', { method: 'POST', body: formData });
  },

  deleteDocument(id: string) {
    return request<void>(`/api/documents/${id}`, { method: 'DELETE' });
  },

  reprocessDocument(id: string) {
    return request<ApiDocumentDto>(`/api/documents/${id}/reprocess`, { method: 'POST' });
  },

  getTasks(params: { status?: string; page?: number; size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 50));
    return request<ApiTaskPage>(`/api/tasks?${query.toString()}`);
  },

  updateTaskStatus(id: string, status: string) {
    return request<ApiTaskItem>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getAuditEvents(params: { action?: string; user?: string; page?: number; size?: number } = {}) {
    const query = new URLSearchParams();
    if (params.action) query.set('action', params.action);
    if (params.user) query.set('user', params.user);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 50));
    return request<ApiAuditPage>(`/api/audit?${query.toString()}`);
  },
};
