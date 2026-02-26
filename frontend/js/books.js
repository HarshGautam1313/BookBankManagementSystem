// ═══════════════════════════════════════════════
//  books.js — Books page
// ═══════════════════════════════════════════════

let allBooks = [];

async function loadBooks() {
  const tbody = document.getElementById('books-tbody');
  tbody.innerHTML = `<tr><td colspan="8">${loadingHTML()}</td></tr>`;

  try {
    const data = await api.books.getAll();
    allBooks = data.books || data || [];
    renderBooks(allBooks);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyHTML('Failed to load books: ' + e.message)}</td></tr>`;
  }
}

function renderBooks(books) {
  const tbody = document.getElementById('books-tbody');
  const count = document.getElementById('books-count');
  if (count) count.textContent = books.length;

  if (!books.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyHTML('No books found. Add your first book!')}</td></tr>`;
    return;
  }

  tbody.innerHTML = books.map(b => `
    <tr>
      <td><span class="id-tag">${b.id || b.bookId || '—'}</span></td>
      <td style="font-weight:500;color:var(--text)">${b.title || '—'}</td>
      <td>${b.author || '—'}</td>
      <td>${b.subject || b.category || '—'}</td>
      <td>${b.edition ? `Ed. ${b.edition}` : '—'}</td>
      <td>${b.publisher || '—'}</td>
      <td>${availBar(b.available_copies ?? b.copiesAvailable ?? b.total_copies, b.total_copies ?? b.copiesTotal)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="viewBook('${b.id || b.bookId}')">View</button>
      </td>
    </tr>
  `).join('');
}

function filterBooks() {
  const q = document.getElementById('books-search').value.toLowerCase();
  const filtered = allBooks.filter(b =>
    (b.title || '').toLowerCase().includes(q) ||
    (b.author || '').toLowerCase().includes(q) ||
    (b.subject || b.category || '').toLowerCase().includes(q) ||
    (b.id || b.bookId || '').toLowerCase().includes(q)
  );
  renderBooks(filtered);
}

async function viewBook(id) {
  const modal = document.getElementById('book-detail-modal');
  const body = document.getElementById('book-detail-body');
  body.innerHTML = loadingHTML();
  openModal('book-detail-modal');

  try {
    const data = await api.books.getOne(id);
    const b = data.book || data;
    const avail = b.available_copies ?? b.copiesAvailable ?? '—';
    const total = b.total_copies ?? b.copiesTotal ?? '—';

    body.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><label>Book ID</label><span class="id-tag">${b.id || b.bookId}</span></div>
        <div class="detail-item"><label>Title</label><span>${b.title}</span></div>
        <div class="detail-item"><label>Author</label><span>${b.author || '—'}</span></div>
        <div class="detail-item"><label>Subject</label><span>${b.subject || b.category || '—'}</span></div>
        <div class="detail-item"><label>Edition</label><span>${b.edition || '—'}</span></div>
        <div class="detail-item"><label>Publisher</label><span>${b.publisher || '—'}</span></div>
        <div class="detail-item"><label>Year</label><span>${b.year_of_publication || '—'}</span></div>
        <div class="detail-item"><label>Total Copies</label><span>${total}</span></div>
        <div class="detail-item"><label>Available</label><span style="color:var(--green)">${avail}</span></div>
        <div class="detail-item"><label>Added</label><span>${formatDate(b.createdAt)}</span></div>
      </div>
    `;
  } catch (e) {
    body.innerHTML = `<div class="alert alert-error">Failed to load: ${e.message}</div>`;
  }
}

async function submitAddBook(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Adding…';

  const payload = {
    id: form.bid.value.trim(),
    title: form.btitle.value.trim(),
    author: form.bauthor.value.trim(),
    subject: form.bsubject.value.trim(),
    edition: parseInt(form.bedition.value) || undefined,
    publisher: form.bpublisher.value.trim(),
    year_of_publication: parseInt(form.byear.value) || undefined,
    total_copies: parseInt(form.bcopies.value),
  };

  try {
    await api.books.add(payload);
    toast('Book added successfully!', 'success');
    closeModal('add-book-modal');
    form.reset();
    await loadBooks();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Book';
  }
}

window.loadBooks = loadBooks;
window.filterBooks = filterBooks;
window.viewBook = viewBook;
window.submitAddBook = submitAddBook;
