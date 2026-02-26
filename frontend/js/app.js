// ═══════════════════════════════════════════════
//  app.js — Router & app init
// ═══════════════════════════════════════════════

const PAGE_LOADERS = {
  dashboard:    loadDashboard,
  books:        loadBooks,
  students:     loadStudents,
  transactions: () => loadTransactions(),
  reports:      loadReports,
};

let currentPage = null;

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Show target page
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  // Highlight nav
  const navLink = document.querySelector(`[data-page="${page}"]`);
  if (navLink) navLink.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: '📊 Dashboard',
    books: '📚 Books',
    students: '🎓 Students',
    transactions: '🔁 Transactions',
    reports: '📈 Reports',
  };
  const tb = document.getElementById('topbar-title');
  if (tb) tb.textContent = titles[page] || page;

  // Load data
  if (currentPage !== page && PAGE_LOADERS[page]) {
    PAGE_LOADERS[page]();
  }

  currentPage = page;

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set up nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
  });

  // Check existing session
  const token = localStorage.getItem('bbms_token');
  const user = getUser();

  if (token && user) {
    showApp();
  } else {
    showAuth();
  }

  // Set default dates
  const todayVal = today();
  document.querySelectorAll('input[type=date]').forEach(input => {
    if (!input.value) input.value = todayVal;
  });

  // Issue modal default due date
  const iDue = document.getElementById('iDueDateInput');
  if (iDue) iDue.value = daysFromToday(14);
});

window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
