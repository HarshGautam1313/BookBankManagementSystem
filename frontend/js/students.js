// ═══════════════════════════════════════════════
//  students.js — Students page
// ═══════════════════════════════════════════════

let allStudents = [];

async function loadStudents() {
  const tbody = document.getElementById('students-tbody');
  tbody.innerHTML = `<tr><td colspan="7">${loadingHTML()}</td></tr>`;

  try {
    const data = await api.students.getAll();
    allStudents = data.students || data || [];
    renderStudents(allStudents);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyHTML('Failed to load students: ' + e.message)}</td></tr>`;
  }
}

function renderStudents(students) {
  const tbody = document.getElementById('students-tbody');
  const count = document.getElementById('students-count');
  if (count) count.textContent = students.length;

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyHTML('No students registered yet.')}</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td><span class="id-tag">${s.id || s.studentId || '—'}</span></td>
      <td style="font-weight:500;color:var(--text)">${s.name || '—'}</td>
      <td>${s.email || '—'}</td>
      <td>${s.branch || s.department || '—'}</td>
      <td>Year ${s.year || '—'}</td>
      <td>Sem ${s.semester || '—'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="viewStudent('${s.id || s.studentId}')">View</button>
        <button class="btn btn-ghost btn-sm" onclick="viewStudentTxns('${s.id || s.studentId}')">Txns</button>
      </td>
    </tr>
  `).join('');
}

function filterStudents() {
  const q = document.getElementById('students-search').value.toLowerCase();
  const filtered = allStudents.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.email || '').toLowerCase().includes(q) ||
    (s.branch || s.department || '').toLowerCase().includes(q) ||
    (s.id || s.studentId || '').toLowerCase().includes(q)
  );
  renderStudents(filtered);
}

async function viewStudent(id) {
  const body = document.getElementById('student-detail-body');
  body.innerHTML = loadingHTML();
  openModal('student-detail-modal');

  try {
    const data = await api.students.getOne(id);
    const s = data.student || data;
    body.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><label>Student ID</label><span class="id-tag">${s.id || s.studentId}</span></div>
        <div class="detail-item"><label>User ID</label><span class="id-tag">${s.user_id || '—'}</span></div>
        <div class="detail-item"><label>Name</label><span>${s.name || '—'}</span></div>
        <div class="detail-item"><label>Email</label><span>${s.email || '—'}</span></div>
        <div class="detail-item"><label>Branch</label><span>${s.branch || s.department || '—'}</span></div>
        <div class="detail-item"><label>Year</label><span>${s.year || '—'}</span></div>
        <div class="detail-item"><label>Semester</label><span>${s.semester || '—'}</span></div>
        <div class="detail-item"><label>Joined</label><span>${formatDate(s.createdAt)}</span></div>
      </div>
      <div class="divider"></div>
      <button class="btn btn-ghost btn-sm" onclick="closeModal('student-detail-modal'); viewStudentTxns('${s.id || s.studentId}')">
        View Transactions →
      </button>
    `;
  } catch (e) {
    body.innerHTML = `<div class="alert alert-error">Failed to load: ${e.message}</div>`;
  }
}

async function viewStudentTxns(sid) {
  navigateTo('transactions');
  document.getElementById('txn-search').value = sid;
  await loadTransactions(sid);
}

async function submitAddStudent(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true; btn.textContent = 'Adding…';

  const payload = {
    id: form.sid.value.trim(),
    user_id: form.suid.value.trim(),
    name: form.sname.value.trim(),
    email: form.semail.value.trim(),
    branch: form.sbranch.value.trim(),
    year: parseInt(form.syear.value),
    semester: parseInt(form.ssem.value),
  };

  try {
    await api.students.add(payload);
    toast('Student added successfully!', 'success');
    closeModal('add-student-modal');
    form.reset();
    await loadStudents();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Add Student';
  }
}

window.loadStudents = loadStudents;
window.filterStudents = filterStudents;
window.viewStudent = viewStudent;
window.viewStudentTxns = viewStudentTxns;
window.submitAddStudent = submitAddStudent;
