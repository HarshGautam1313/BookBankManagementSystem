// ═══════════════════════════════════════════════
//  utils.js — Shared helpers
// ═══════════════════════════════════════════════

// ── Toast notifications ──────────────────────
function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  el.innerHTML = `<span style="font-size:1rem">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateX(30px)';
    el.style.transition = 'all 0.25s ease';
    setTimeout(() => el.remove(), 250);
  }, 3500);
}

window.toast = toast;

// ── Modal helpers ────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

window.openModal = openModal;
window.closeModal = closeModal;

// ── Date helpers ─────────────────────────────
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

window.formatDate = formatDate;
window.today = today;
window.daysFromToday = daysFromToday;

// ── Status badge HTML ─────────────────────────
function statusBadge(status) {
  const map = {
    issue:    ['badge-blue',  'Issued'],
    returned: ['badge-green', 'Returned'],
    overdue:  ['badge-red',   'Overdue'],
    OPEN:     ['badge-blue',  'Open'],
    CLOSED:   ['badge-dim',   'Closed'],
    Admin:    ['badge-gold',  'Admin'],
    Student:  ['badge-blue',  'Student'],
  };
  const [cls, label] = map[status] || ['badge-dim', status || '—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

window.statusBadge = statusBadge;

// ── Loading HTML ──────────────────────────────
function loadingHTML() {
  return `<div class="loading"><div class="spinner"></div><br>Loading…</div>`;
}

function emptyHTML(msg = 'No records found') {
  return `<div class="empty-state"><div class="empty-icon">📭</div><p>${msg}</p></div>`;
}

window.loadingHTML = loadingHTML;
window.emptyHTML = emptyHTML;

// ── Availability pct ──────────────────────────
function availBar(available, total) {
  if (!total) return '';
  const pct = Math.round((available / total) * 100);
  const color = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--amber)' : 'var(--red)';
  return `
    <div style="font-size:0.78rem;color:var(--text-dim)">${available}/${total} copies</div>
    <div class="avail-bar"><div class="avail-fill" style="width:${pct}%;background:${color}"></div></div>
  `;
}

window.availBar = availBar;

// ── Auth helpers ──────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('bbms_user') || 'null'); } catch { return null; }
}

function setSession(token, user) {
  if (token) localStorage.setItem('bbms_token', token);
  if (user)  localStorage.setItem('bbms_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('bbms_token');
  localStorage.removeItem('bbms_user');
}

window.getUser = getUser;
window.setSession = setSession;
window.clearSession = clearSession;

// ── Input reset ───────────────────────────────
function resetForm(formId) {
  document.getElementById(formId)?.reset();
}

window.resetForm = resetForm;

// ── Close modals on overlay click ─────────────
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
