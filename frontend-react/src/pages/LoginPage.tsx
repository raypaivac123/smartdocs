import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Auth } from '../lib/auth';
import { ApiError, api } from '../lib/api';
import { LogoIcon } from '../components/ui/Icons';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (Auth.isAuth()) {
    return <Navigate to="/dashboard" replace />;
  }

  function fillDemo() {
    setEmail('dev@smartdocs.de');
    setPassword('demo123');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { token, user } = await api.login(email.trim(), password);
      Auth.save(token, { name: user.name, email: user.email, role: user.role, initials: user.initials });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Is the backend running?');
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", background: '#F8F9FB', display: 'flex',
      alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#111827', padding: 16,
    }}>
      <div style={{ width: 420, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: '#2563EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoIcon className="login-logo-icon-svg" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>SmartDocs</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>AI-powered document intelligence platform</div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="form-label">Email address</label>
              <input
                className="form-input" type="email" placeholder="name@company.de"
                autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password" placeholder="Password"
                autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <div style={{ color: '#DC2626', fontSize: 12.5, marginTop: 6 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 12.5, color: '#374151' }}>
            <strong style={{ color: '#16A34A' }}>Demo credentials:</strong><br />
            <code onClick={fillDemo} style={{ fontFamily: 'monospace', background: '#fff', padding: '1px 6px', borderRadius: 4, border: '1px solid #D1D5DB', color: '#2563EB', cursor: 'pointer' }}>
              dev@smartdocs.de / demo123
            </code> - click to fill
          </div>
        </div>
      </div>
    </div>
  );
}
