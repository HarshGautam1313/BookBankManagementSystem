// ═══════════════════════════════════════════════
//  transactions.js — Transactions page
// ═══════════════════════════════════════════════

let allTransactions = [];

async function loadTransactions(studentFilter = null) {
  const tbody = document.getElementById('txn-tbody');
  tbody.innerHTML = `<tr><td colspan="8">${loadingHTML()}</td></tr>`;

  try {
    let data;
    if (studentFilter) {
      data = await api.transactions.byStudent(studentFilter);
      allTransactions = data.transactions || [];
    } else {
      data = await api.transactions.getAll();
      allTransactions = data.transactions || data || [];
    }
    renderTransactions(allTransactions);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyHTML('Failed: ' + e.message)}</td></tr>`;
  }
}

function renderTransactions(txns) {
  const tbody = document.getElementById('txn-tbody');
  const count = document.getElementById('txn-count');
  if (count) count.textContent = txns.length;

  if (!txns.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyHTML('No transactions found.')}</td></tr>`;
    return;
  }

  tbody.innerHTML = txns.map(t => `
    <tr>
      <td><span class="id-tag">${t.id || t.transactionId || '—'}</span></td>
      <td><span class="id-tag">${t.student_id || t.studentId || '—'}</span></td>
      <td><span class="id-tag">${t.book_id || t.bookId || '—'}</span></td>
      <td>${statusBadge(t.status)}</td>
      <td>${formatDate(t.issue_date || t.issueDate)}</td>
      <td>${formatDate(t.due_date || t.dueDate)}</td>
      <td>${t.return_date || t.returnDate ? formatDate(t.return_date || t.returnDate) : '<span style="color:var(--text-dim)">—</span>'}</td>
      <td>
        ${(t.status === 'issue' || t.status === 'OPEN') ? `
          <button class="btn btn-ghost btn-sm" onclick="quickReturn('${t.id || t.transactionId}')">Return</button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

function filterTransactions() {
  const q = document.getElementById('txn-search').value.toLowerCase();
  const status = document.getElementById('txn-status-filter').value;
  const filtered = allTransactions.filter(t => {
    const matchQ = !q ||
      (t.id || t.transactionId || '').toLowerCase().includes(q) ||
      (t.student_id || t.studentId || '').toLowerCase().includes(q) ||
      (t.book_id || t.bookId || '').toLowerCase().includes(q);
    const matchStatus = !status || (t.status || '').toLowerCase() === status.toLowerCase();
    return matchQ && matchStatus;
  });
  renderTransactions(filtered);
}

async function quickReturn(txnId) {
  if (!confirm(`Return transaction ${txnId}?`)) return;
  try {
    await api.transactions.returnBook({ txnId });
    toast('Book returned successfully!', 'success');
    await loadTransactions();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

async function submitIssueBook(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Issuing…';

  const payload = {
    txnId: form.txnId.value.trim(),
    studentId: form.iStudentId.value.trim(),
    bookId: form.iBookId.value.trim(),
    dueDate: form.iDueDate.value,
  };

  try {
    await api.transactions.issue(payload);
    toast('Book issued successfully!', 'success');
    closeModal('issue-modal');
    form.reset();
    await loadTransactions();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Issue Book';
  }
}

async function submitReturnBook(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Returning…';

  const payload = {
    txnId: form.rTxnId.value.trim(),
  };

  try {
    await api.transactions.returnBook(payload);
    toast('Book returned successfully!', 'success');
    closeModal('return-modal');
    form.reset();
    await loadTransactions();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Return Book';
  }
}

// Pre-fill default due date (14 days from today)
function initIssueForm() {
  const dd = document.getElementById('iDueDateInput');
  if (dd) dd.value = daysFromToday(14);
}

window.loadTransactions = loadTransactions;
window.filterTransactions = filterTransactions;
window.quickReturn = quickReturn;
window.submitIssueBook = submitIssueBook;
window.submitReturnBook = submitReturnBook;
window.initIssueForm = initIssueForm;
