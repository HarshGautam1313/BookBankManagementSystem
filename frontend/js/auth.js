// ═══════════════════════════════════════════════
//  auth.js — Authentication
// ═══════════════════════════════════════════════

function showAuth() {
  document.getElementById('app-wrapper').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-wrapper').style.display = 'flex';
  updateUserBadge();
  navigateTo('dashboard');
}

function updateUserBadge() {
  const user = getUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avEl = document.getElementById('sidebar-avatar');
  if (nameEl) nameEl.textContent = user.name || user.id || 'User';
  if (roleEl) roleEl.textContent = user.role || '';
  if (avEl) avEl.textContent = (user.name || user.id || 'U')[0].toUpperCase();
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`form-${tab}`).style.display = 'block';
}

async function submitLogin(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Signing in…';

  const payload = {
    id: form.lid.value.trim(),
    password: form.lpass.value,
  };

  try {
    const data = await api.auth.login(payload);
    setSession(data.token, data.user || { id: payload.id, role: data.role || 'Student' });
    toast('Welcome back!', 'success');
    showApp();
  } catch (e) {
    errEl.textContent = e.message || 'Login failed';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Sign In';
  }
}

async function submitRegister(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  const errEl = document.getElementById('reg-error');
  errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Registering…';

  const payload = {
    id: form.rid.value.trim(),
    password: form.rpass.value,
    role: form.rrole.value,
  };

  try {
    await api.auth.register(payload);
    toast('Account created! Please sign in.', 'success');
    form.reset();
    switchAuthTab('login');
  } catch (e) {
    errEl.textContent = e.message || 'Registration failed';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
}

function logout() {
  clearSession();
  toast('Signed out.', 'info');
  showAuth();
}

window.showAuth = showAuth;
window.showApp = showApp;
window.switchAuthTab = switchAuthTab;
window.submitLogin = submitLogin;
window.submitRegister = submitRegister;
window.logout = logout;
