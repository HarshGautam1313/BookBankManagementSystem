// ═══════════════════════════════════════════════
//  dashboard.js — Dashboard stats & overview
// ═══════════════════════════════════════════════

async function loadDashboard() {
  // Reset stats
  ['dash-total-books', 'dash-total-students', 'dash-issued', 'dash-overdue'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '…';
  });

  try {
    const [booksData, studentsData, issuedData, overdueData] = await Promise.allSettled([
      api.books.getAll(),
      api.students.getAll(),
      api.reports.issued(),
      api.reports.overdue(),
    ]);

    if (booksData.status === 'fulfilled') {
      const books = booksData.value.books || booksData.value || [];
      document.getElementById('dash-total-books').textContent = books.length;
    }

    if (studentsData.status === 'fulfilled') {
      const students = studentsData.value.students || studentsData.value || [];
      document.getElementById('dash-total-students').textContent = students.length;
    }

    if (issuedData.status === 'fulfilled') {
      const issued = issuedData.value.issued || [];
      document.getElementById('dash-issued').textContent = issued.length;
      renderRecentIssued(issued.slice(0, 5));
    }

    if (overdueData.status === 'fulfilled') {
      const overdue = overdueData.value.overdue || [];
      document.getElementById('dash-overdue').textContent = overdue.length;
      renderOverdueAlert(overdue);
    }

  } catch (e) {
    console.error('Dashboard error:', e);
  }
}

function renderRecentIssued(items) {
  const el = document.getElementById('recent-issued-body');
  if (!el) return;

  if (!items.length) {
    el.innerHTML = emptyHTML('No books currently issued.');
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Txn ID</th><th>Book</th><th>Student</th><th>Due Date</th></tr>
      </thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td><span class="id-tag">${i.transactionId || i.id || '—'}</span></td>
            <td>${i.title || i.bookId || i.book_id || '—'}</td>
            <td><span class="id-tag">${i.studentId || i.student_id || '—'}</span></td>
            <td>${formatDate(i.dueDate || i.due_date)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

function renderOverdueAlert(items) {
  const el = document.getElementById('overdue-alert');
  if (!el) return;

  if (!items.length) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'block';
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="color:var(--red);font-weight:600">⚠ ${items.length} Overdue Book${items.length > 1 ? 's' : ''}</span>
      <button class="btn btn-ghost btn-sm" onclick="navigateTo('reports')">View All</button>
    </div>
    ${items.slice(0,3).map(o => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.84rem">
        <span class="id-tag">${o.bookId || o.book_id}</span>
        <span style="color:var(--text-muted)">Student: <span class="id-tag">${o.studentId || o.student_id}</span></span>
        <span class="badge badge-red">${o.daysOverdue} days late</span>
      </div>
    `).join('')}
  `;
}

window.loadDashboard = loadDashboard;
