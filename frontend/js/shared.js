/* ============================================================
   SmartDocs — Shared JS
   Sidebar, topbar, auth guard, utilities, mock data
   ============================================================ */

// ── Auth ──────────────────────────────────────────────────────
const Auth = {
  KEY_TOKEN: 'sd_token',
  KEY_USER:  'sd_user',
  save(token, user) {
    localStorage.setItem(this.KEY_TOKEN, token);
    localStorage.setItem(this.KEY_USER, JSON.stringify(user));
  },
  getToken() { return localStorage.getItem(this.KEY_TOKEN); },
  getUser()  {
    try { return JSON.parse(localStorage.getItem(this.KEY_USER)); }
    catch { return null; }
  },
  isAuth()   { return !!this.getToken(); },
  logout()   {
    localStorage.removeItem(this.KEY_TOKEN);
    localStorage.removeItem(this.KEY_USER);
    window.location.href = '../index.html';
  },
  require()  {
    if (!this.isAuth()) { window.location.href = '../index.html'; }
  }
};

// ── Mock Data ─────────────────────────────────────────────────
const Mock = {
  documents: [
    { id:'doc-001', filename:'Mietvertrag_Berlin_2024.pdf',     classification:'VERTRAG',         status:'processed', uploadedBy:'Anna Schmidt',  uploadedAt:'2024-05-20 14:32', processedAt:'2024-05-20 14:35' },
    { id:'doc-002', filename:'Rechnung_Stadtwerke_April.pdf',   classification:'RECHNUNG',        status:'processed', uploadedBy:'Max Müller',    uploadedAt:'2024-05-20 10:15', processedAt:'2024-05-20 10:18' },
    { id:'doc-003', filename:'Kreditantrag_Deutsche_Bank.pdf',  classification:'ANTRAG',          status:'pending',   uploadedBy:'Sarah Weber',   uploadedAt:'2024-05-22 09:45', processedAt:null },
    { id:'doc-004', filename:'Jahresbericht_2023_Finanzen.pdf', classification:'BERICHT',         status:'processed', uploadedBy:'Thomas Klein',  uploadedAt:'2024-05-21 16:20', processedAt:'2024-05-21 16:28' },
    { id:'doc-005', filename:'Mahnung_Rechtsanwalt_Meyer.pdf',  classification:'RECHTSSCHREIBEN', status:'error',     uploadedBy:'Lisa Fischer',  uploadedAt:'2024-05-19 11:30', processedAt:null },
    { id:'doc-006', filename:'Arbeitsvertrag_Mitarbeiter_2024.pdf', classification:'VERTRAG',     status:'processed', uploadedBy:'Anna Schmidt',  uploadedAt:'2024-05-18 13:45', processedAt:'2024-05-18 13:48' },
    { id:'doc-007', filename:'Steuerrechnung_Q1_2024.pdf',      classification:'RECHNUNG',        status:'processed', uploadedBy:'Max Müller',    uploadedAt:'2024-05-17 08:00', processedAt:'2024-05-17 08:05' },
  ],
  tasks: [
    { id:'t001', title:'Review rental contract terms',      priority:'HIGH',   status:'in-progress', document:'Mietvertrag_Berlin_2024.pdf',     assignee:'Anna Schmidt', due:'2024-05-25' },
    { id:'t002', title:'Process utility invoice payment',  priority:'MEDIUM', status:'open',        document:'Rechnung_Stadtwerke_April.pdf',   assignee:'Max Müller',   due:'2024-05-23' },
    { id:'t003', title:'Verify loan application details',  priority:'HIGH',   status:'open',        document:'Kreditantrag_Deutsche_Bank.pdf',  assignee:'Sarah Weber',  due:'2024-05-24' },
    { id:'t004', title:'Archive annual financial report',  priority:'LOW',    status:'done',        document:'Jahresbericht_2023_Finanzen.pdf', assignee:'Thomas Klein', due:'2024-05-22' },
    { id:'t005', title:'Review attorney demand letter',    priority:'MEDIUM', status:'in-progress', document:'Mahnung_Rechtsanwalt_Meyer.pdf',  assignee:'Lisa Fischer', due:'2024-05-26' },
  ],
  auditEvents: [
    { id:'aud-001', timestamp:'2024-05-22 09:45:32', user:'Sarah Weber',  initials:'SW', color:'#7C3AED', action:'UPLOAD', entity:'Document', entityId:'doc-003', detail:'Uploaded Kreditantrag_Deutsche_Bank.pdf' },
    { id:'aud-002', timestamp:'2024-05-22 09:12:15', user:'Anna Schmidt', initials:'AS', color:'#2563EB', action:'LOGIN',  entity:'Auth',     entityId:null,      detail:'Successful login from 192.168.1.42' },
    { id:'aud-003', timestamp:'2024-05-21 16:28:44', user:'System',       initials:'SY', color:'#6B7280', action:'STATUS', entity:'Document', entityId:'doc-004', detail:'Document processed: BERICHT classification' },
    { id:'aud-004', timestamp:'2024-05-21 16:20:11', user:'Thomas Klein', initials:'TK', color:'#0D9488', action:'UPLOAD', entity:'Document', entityId:'doc-004', detail:'Uploaded Jahresbericht_2023_Finanzen.pdf' },
    { id:'aud-005', timestamp:'2024-05-20 14:35:02', user:'System',       initials:'SY', color:'#6B7280', action:'STATUS', entity:'Document', entityId:'doc-001', detail:'Document processed: VERTRAG classification' },
    { id:'aud-006', timestamp:'2024-05-20 14:32:18', user:'Anna Schmidt', initials:'AS', color:'#2563EB', action:'UPLOAD', entity:'Document', entityId:'doc-001', detail:'Uploaded Mietvertrag_Berlin_2024.pdf' },
    { id:'aud-007', timestamp:'2024-05-20 10:18:55', user:'System',       initials:'SY', color:'#6B7280', action:'TASK_GEN', entity:'Task',  entityId:'t002',    detail:'Auto-generated task from doc-002' },
    { id:'aud-008', timestamp:'2024-05-20 10:15:33', user:'Max Müller',   initials:'MM', color:'#DC2626', action:'UPLOAD', entity:'Document', entityId:'doc-002', detail:'Uploaded Rechnung_Stadtwerke_April.pdf' },
    { id:'aud-009', timestamp:'2024-05-19 11:30:10', user:'Lisa Fischer', initials:'LF', color:'#D97706', action:'UPLOAD', entity:'Document', entityId:'doc-005', detail:'Uploaded Mahnung_Rechtsanwalt_Meyer.pdf' },
    { id:'aud-010', timestamp:'2024-05-18 09:00:00', user:'Anna Schmidt', initials:'AS', color:'#2563EB', action:'LOGIN',  entity:'Auth',     entityId:null,      detail:'Successful login from 192.168.1.55' },
  ]
};

// ── Icons (SVG strings) ───────────────────────────────────────
const Icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  documents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  upload:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  tasks:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  audit:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  settings:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M20 12h-1M5 12H4M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 20v-1M12 5V4"/></svg>`,
  bell:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  search:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  filter:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  eye:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  trash:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  doc:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  logo:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="2"/><path d="M12 13v-2"/></svg>`,
  user:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  calendar:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  upload2:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
};

// ── Render Sidebar ────────────────────────────────────────────
function renderSidebar(activePage) {
  const user = Auth.getUser() || { name: 'Anna Schmidt', role: 'ADMIN', initials: 'AS' };
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  href: 'dashboard.html', icon: Icons.dashboard },
    { id: 'documents', label: 'Documents',  href: 'documents.html', icon: Icons.documents },
    { id: 'upload',    label: 'Upload',     href: 'upload.html',    icon: Icons.upload    },
    { id: 'tasks',     label: 'Tasks',      href: 'tasks.html',     icon: Icons.tasks     },
    { id: 'audit',     label: 'Audit Log',  href: 'audit.html',     icon: Icons.audit     },
    { id: 'settings',  label: 'Settings',   href: 'settings.html',  icon: Icons.settings  },
  ];
  const html = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">${Icons.logo}</div>
        <span class="sidebar-logo-text">SmartDocs</span>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-label">Main Menu</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
            ${item.icon}<span>${item.label}</span>
          </a>`).join('')}
      </div>
    </aside>`;
  const el = document.getElementById('sidebar');
  if (el) el.innerHTML = html;
}

// ── Render Topbar ─────────────────────────────────────────────
function renderTopbar() {
  const user = Auth.getUser() || { name: 'Anna Schmidt', role: 'ADMIN', initials: 'AS' };
  const html = `
    <header class="topbar">
      <div class="topbar-search">
        ${Icons.search}
        <input type="text" placeholder="Search documents, tasks, users..." />
      </div>
      <div class="topbar-spacer"></div>
      <div class="topbar-actions">
        <div class="topbar-bell">
          ${Icons.bell}
          <div class="topbar-bell-dot"></div>
        </div>
        <div class="topbar-user">
          <div class="topbar-user-info">
            <div class="topbar-user-name">${user.name}</div>
            <div class="topbar-user-role">${user.role}</div>
          </div>
          <div class="topbar-avatar">${user.initials || user.name.slice(0,2).toUpperCase()}</div>
        </div>
      </div>
    </header>`;
  const el = document.getElementById('topbar');
  if (el) el.innerHTML = html;
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-msg">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Confirm Modal ─────────────────────────────────────────────
function showConfirm(title, text, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">${title}</div>
      <div class="modal-text">${text}</div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-danger" id="modal-ok">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#modal-ok').onclick = () => { overlay.remove(); onConfirm(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// ── Badge helpers ─────────────────────────────────────────────
function classificationBadge(cls) {
  const map = {
    VERTRAG:         'badge-vertrag',
    RECHNUNG:        'badge-rechnung',
    ANTRAG:          'badge-antrag',
    BERICHT:         'badge-bericht',
    RECHTSSCHREIBEN: 'badge-rechtsschreiben',
  };
  return `<span class="badge ${map[cls] || ''}">${cls}</span>`;
}

function statusBadge(status) {
  const map = { processed:'badge-processed', pending:'badge-pending', error:'badge-error' };
  const label = { processed:'PROCESSED', pending:'PENDING', error:'ERROR' };
  return `<span class="badge ${map[status] || ''}">${label[status] || status.toUpperCase()}</span>`;
}

function priorityBadge(p) {
  const map = { HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' };
  return `<span class="badge ${map[p] || ''}">${p}</span>`;
}

function taskStatusBadge(s) {
  const map   = { open:'badge-open', 'in-progress':'badge-in-progress', done:'badge-done' };
  const label = { open:'OPEN', 'in-progress':'IN PROGRESS', done:'DONE' };
  return `<span class="badge ${map[s] || ''}">${label[s] || s.toUpperCase()}</span>`;
}

function actionBadge(action) {
  const map = { UPLOAD:'badge-upload', LOGIN:'badge-login', DELETE:'badge-delete', STATUS:'badge-status', TASK_GEN:'badge-task-gen' };
  return `<span class="badge ${map[action] || 'badge-status'}">${action}</span>`;
}
