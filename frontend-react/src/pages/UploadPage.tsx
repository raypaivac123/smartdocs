import { useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/ToastContext';
import { api, ApiError } from '../lib/api';
import { DocumentsIcon, UploadIcon } from '../components/ui/Icons';

const STEPS = [
  { title: 'Upload PDF', desc: 'Upload your document securely to our system' },
  { title: 'Validate File', desc: 'Check file format, size, and integrity' },
  { title: 'Send to Queue', desc: 'Document added to RabbitMQ processing queue' },
  { title: 'AI Analysis', desc: 'AI extracts and analyzes content' },
  { title: 'Results Available', desc: 'View extracted data, summary, and generated tasks' },
];

export function UploadPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState('');

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF files are accepted.', 'error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('File too large. Max 20 MB.', 'error');
      return;
    }
    startUpload(file);
  }

  async function startUpload(file: File) {
    setUploading(true);
    setFilename(file.name);

    try {
      await api.uploadDocument(file);
      showToast(`"${file.name}" uploaded — processing started.`, 'success');
      navigate('/documents');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Upload failed. Is the backend running?', 'error');
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Upload Document</h1>
        <p className="page-subtitle">Upload PDF documents for AI-powered processing and analysis</p>
      </div>

      <div className="card mb-20">
        {!uploading ? (
          <div
            className={`dropzone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef} type="file" accept=".pdf"
              onChange={e => handleFile(e.target.files?.[0])}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
            <div className="dropzone-icon-wrap"><UploadIcon /></div>
            <div className="dropzone-title">Drop your PDF here or browse files</div>
            <div className="dropzone-sub">PDF only - Max size 20 MB</div>
            <button
              className="btn btn-primary"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="progress-overlay" style={{ display: 'flex' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{filename}</div>
            <div className="progress-bar-track" style={{ width: '100%' }}>
              <div className="progress-bar-fill progress-bar-indeterminate" />
            </div>
            <div style={{ fontSize: 13.5, color: '#6B7280' }}>Uploading and validating...</div>
          </div>
        )}
      </div>

      <div className="card mb-20">
        <div className="card-title" style={{ marginBottom: 4 }}>Processing Flow</div>
        <div className="card-subtitle mb-16">How your documents are processed</div>
        <div style={{ marginTop: 16 }}>
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="step-item"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 0',
                borderBottom: i < STEPS.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <div style={{
                width: 32, height: 32, background: '#EFF6FF', color: '#2563EB', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-box">
        <div className="info-box-icon"><DocumentsIcon /></div>
        <div>
          <div className="info-box-title">Supported Document Types</div>
          <div className="info-box-text">
            Our AI can process and classify common business documents including:{' '}
            <strong>contracts</strong>, <strong>invoices</strong>, <strong>applications</strong>,{' '}
            <strong>reports</strong>, and <strong>legal documents</strong>.
          </div>
        </div>
      </div>
    </>
  );
}
