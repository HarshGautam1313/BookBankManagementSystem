// ═══════════════════════════════════════════════
//  reports.js — Reports page
// ═══════════════════════════════════════════════

async function loadReports() {
  await Promise.all([
    loadOverdue(),
    loadIssued(),
    loadAvailable(),
  ]);
}

async function loadOverdue() {
  const el = document.getElementById('overdue-body');
  el.innerHTML = loadingHTML();

  try {
    const data = await api.reports.overdue();
    const items = data.overdue || [];
    document.getElementById('overdue-count').textContent = items.length;

    if (!items.length) {
      el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--green)">✓ No overdue books!</div>`;
      return;
    }

    el.innerHTML = `
      <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Txn ID</th>
            <th>Book ID</th>
            <th>Student ID</th>
            <th>Due Date</th>
            <th>Days Overdue</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(o => `
            <tr>
              <td><span class="id-tag">${o.transactionId || o.id || '—'}</span></td>
              <td><span class="id-tag">${o.bookId || o.book_id || '—'}</span></td>
              <td><span class="id-tag">${o.studentId || o.student_id || '—'}</span></td>
              <td style="color:var(--red)">${formatDate(o.dueDate || o.due_date)}</td>
              <td><span class="badge badge-red">${o.daysOverdue || '—'} days</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-error">Failed: ${e.message}</div>`;
  }
}

async function loadIssued() {
  const el = document.getElementById('issued-body');
  el.innerHTML = loadingHTML();

  try {
    const data = await api.reports.issued();
    const items = data.issued || [];
    document.getElementById('issued-count').textContent = items.length;

    if (!items.length) {
      el.innerHTML = emptyHTML('No books are currently issued.');
      return;
    }

    el.innerHTML = `
      <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Txn ID</th>
            <th>Book</th>
            <th>Student ID</th>
            <th>Issue Date</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td><span class="id-tag">${i.transactionId || i.id || '—'}</span></td>
              <td>
                <div style="font-weight:500;color:var(--text)">${i.title || '—'}</div>
                <div class="id-tag" style="margin-top:3px">${i.bookId || i.book_id || '—'}</div>
              </td>
              <td><span class="id-tag">${i.studentId || i.student_id || '—'}</span></td>
              <td>${formatDate(i.issueDate || i.issue_date)}</td>
              <td>${formatDate(i.dueDate || i.due_date)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-error">Failed: ${e.message}</div>`;
  }
}

async function loadAvailable() {
  const el = document.getElementById('available-body');
  el.innerHTML = loadingHTML();

  try {
    const data = await api.reports.available();
    const items = data.available || data.books || [];
    document.getElementById('available-count').textContent = items.length;

    if (!items.length) {
      el.innerHTML = emptyHTML('No books available right now.');
      return;
    }

    el.innerHTML = `
      <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Subject</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(b => `
            <tr>
              <td><span class="id-tag">${b.bookId || b.id || '—'}</span></td>
              <td style="color:var(--text);font-weight:500">${b.title || '—'}</td>
              <td>${b.author || '—'}</td>
              <td>${b.subject || '—'}</td>
              <td>${availBar(b.copiesAvailable ?? b.available_copies, b.copiesTotal ?? b.total_copies)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-error">Failed: ${e.message}</div>`;
  }
}

window.loadReports = loadReports;
window.loadOverdue = loadOverdue;
window.loadIssued = loadIssued;
window.loadAvailable = loadAvailable;
