import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClassificationBadge, StatusBadge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useToast } from '../components/ui/ToastContext';
import { api, ApiError } from '../lib/api';
import { toDocumentItem } from '../lib/mappers';
import type { Classification, DocumentItem, DocumentStatus } from '../lib/types';
import { DocumentsIcon, EyeIcon, RefreshIcon, SearchIcon, TrashIcon, UploadIcon } from '../components/ui/Icons';

export function DocumentsPage() {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<Classification | ''>('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; filename: string } | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const page = await api.getDocuments({ search, status: statusFilter, classification: typeFilter, size: 50 });
      setDocs(page.content.map(toDocumentItem));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const t = setTimeout(loadDocuments, 300);
    return () => clearTimeout(t);
  }, [loadDocuments]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await api.deleteDocument(pendingDelete.id);
      setDocs(prev => prev.filter(d => d.id !== pendingDelete.id));
      showToast('Document deleted successfully.', 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete document.', 'error');
    } finally {
      setPendingDelete(null);
    }
  }

  async function handleReprocess(id: string, filename: string) {
    try {
      await api.reprocessDocument(id);
      showToast(`"${filename}" queued for reprocessing.`, 'success');
      loadDocuments();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to reprocess document.', 'error');
    }
  }

  return (
    <>
      <div className="flex-between mb-16">
        <div>
          <h1 className="page-title">All Documents</h1>
          <p className="page-subtitle">{docs.length} document{docs.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <UploadIcon />
          Upload Document
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="toolbar-row">
          <div className="search-wrap" style={{ maxWidth: 300 }}>
            <SearchIcon />
            <input
              type="text" placeholder="Search by filename..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-filters">
            <select className="select-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value as DocumentStatus | '')}>
              <option value="">All Status</option>
              <option value="processed">Processed</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
            <select className="select-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value as Classification | '')}>
              <option value="">All Types</option>
              <option value="CONTRACT">Contract</option>
              <option value="INVOICE">Invoice</option>
              <option value="APPLICATION">Application</option>
              <option value="REPORT">Report</option>
              <option value="LEGAL_DOCUMENT">Legal Document</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Classification</th>
                <th>Status</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-text">Loading documents...</div></div></td></tr>
              ) : loadError ? (
                <tr><td colSpan={6}><div className="empty-state">
                  <div className="empty-state-title">Could not load documents</div>
                  <div className="empty-state-text">{loadError}</div>
                </div></td></tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><DocumentsIcon /></div>
                      <div className="empty-state-title">No documents found</div>
                      <div className="empty-state-text">Try adjusting your filters</div>
                    </div>
                  </td>
                </tr>
              ) : docs.map(d => (
                <tr key={d.id}>
                  <td>
                    <div className="doc-row">
                      <div className="doc-icon-wrap"><DocumentsIcon /></div>
                      <span className="doc-filename">{d.filename}</span>
                    </div>
                  </td>
                  <td><ClassificationBadge value={d.classification} /></td>
                  <td><StatusBadge value={d.status} /></td>
                  <td className="td-muted">{d.uploadedBy}</td>
                  <td className="td-muted">{d.uploadedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="btn-icon" title="View" onClick={() => showToast(d.summary ?? 'No summary available yet.', 'info')}>
                        <EyeIcon />
                      </button>
                      {d.status === 'error' && (
                        <button className="btn-icon" title="Reprocess" onClick={() => handleReprocess(d.id, d.filename)}>
                          <RefreshIcon />
                        </button>
                      )}
                      <button className="btn-icon danger" title="Delete" onClick={() => setPendingDelete({ id: d.id, filename: d.filename })}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Delete Document"
          text={`Are you sure you want to delete "${pendingDelete.filename}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
