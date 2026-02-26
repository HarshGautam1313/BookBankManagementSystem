// ═══════════════════════════════════════════════
//  api.js — Centralised API layer
// ═══════════════════════════════════════════════

const BASE = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('bbms_token') || '';
}

function authHeaders() {
  const t = getToken();
  return {
    'Content-Type': 'application/json',
    ...(t ? { 'Authorization': `Bearer ${t}` } : {})
  };
}

async function request(method, path, body = null) {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

const api = {
  // ── AUTH ──────────────────────────────────────
  auth: {
    register: (payload) => request('POST', '/auth/register', payload),
    login:    (payload) => request('POST', '/auth/login', payload),
  },

  // ── BOOKS ─────────────────────────────────────
  books: {
    getAll:   ()     => request('GET',  '/books'),
    getOne:   (id)   => request('GET',  `/books/${id}`),
    add:      (data) => request('POST', '/books', data),
  },

  // ── STUDENTS ──────────────────────────────────
  students: {
    getAll:   ()     => request('GET',  '/students'),
    getOne:   (id)   => request('GET',  `/students/${id}`),
    add:      (data) => request('POST', '/students', data),
  },

  // ── TRANSACTIONS ──────────────────────────────
  transactions: {
    getAll:       ()          => request('GET',  '/transactions'),
    getOne:       (id)        => request('GET',  `/transactions/${id}`),
    byStudent:    (sid)       => request('GET',  `/transactions/student/${sid}`),
    issue:        (data)      => request('POST', '/transactions/issue', data),
    returnBook:   (data)      => request('POST', '/transactions/return', data),
  },

  // ── REPORTS ───────────────────────────────────
  reports: {
    overdue:    () => request('GET', '/reports/overdue'),
    issued:     () => request('GET', '/reports/issued'),
    available:  () => request('GET', '/reports/books'),
  },
};

window.api = api;
