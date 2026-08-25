// CineData API Frontend Application Logic

let state = {
  token: localStorage.getItem('cinedata_jwt') || null,
  user: null,
  isRegistering: false
};

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const nameGroup = document.getElementById('name-group');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authToggleMsg = document.getElementById('auth-toggle-msg');
const logoutBtn = document.getElementById('logout-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  if (state.token) {
    verifySession();
  } else {
    window.location.href = '/login';
  }
});

function setupEventListeners() {
  if (authToggleBtn) {
    authToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.isRegistering = !state.isRegistering;
      if (state.isRegistering) {
        if (authTitle) authTitle.textContent = 'Create an Account';
        if (authSubtitle) authSubtitle.textContent = 'Sign up for a CineData developer account';
        if (nameGroup) nameGroup.style.display = 'block';
        if (authSubmitBtn) authSubmitBtn.textContent = 'Sign Up';
        if (authToggleMsg) authToggleMsg.textContent = 'Already have an account?';
        if (authToggleBtn) authToggleBtn.textContent = 'Sign In';
      } else {
        if (authTitle) authTitle.textContent = 'Welcome Back';
        if (authSubtitle) authSubtitle.textContent = 'Log in to manage your API keys and analytics';
        if (nameGroup) nameGroup.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.textContent = 'Sign In';
        if (authToggleMsg) authToggleMsg.textContent = "Don't have an account?";
        if (authToggleBtn) authToggleBtn.textContent = 'Sign Up';
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name').value;

      const endpoint = state.isRegistering ? '/api/auth/register' : '/api/auth/login';
      const body = state.isRegistering ? { name, email, password } : { email, password };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          Swal.fire({
            icon: 'error',
            title: 'Autentikasi Gagal',
            text: data.error?.message || 'Login / Registrasi gagal. Silakan periksa kembali data Anda.',
            confirmButtonColor: '#171717'
          });
          return;
        }

        state.token = data.data.token;
        state.user = data.data.user;
        localStorage.setItem('cinedata_jwt', state.token);
        
        Swal.fire({
          icon: 'success',
          title: state.isRegistering ? 'Registrasi Berhasil' : 'Login Berhasil',
          text: state.isRegistering ? 'Akun developer baru berhasil dibuat.' : 'Selamat datang kembali di CineData Platform.',
          timer: 1500,
          showConfirmButton: false
        });

        showAppScreen();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Koneksi Terputus',
          text: 'Terjadi kesalahan jaringan. Silakan periksa koneksi internet Anda.',
          confirmButtonColor: '#171717'
        });
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('cinedata_jwt');
      showAuthScreen();
    });
  }

  // Tab Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Keys Modal
  const openKeyBtn = document.getElementById('open-create-key-modal');
  if (openKeyBtn) {
    openKeyBtn.addEventListener('click', () => {
      const modal = document.getElementById('create-key-modal');
      const alertBox = document.getElementById('key-created-alert');
      const form = document.getElementById('create-key-form');
      if (modal) modal.classList.add('active');
      if (alertBox) alertBox.style.display = 'none';
      if (form) form.reset();
    });
  }

  const createKeyForm = document.getElementById('create-key-form');
  if (createKeyForm) {
    createKeyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('key-name-input').value;
      const environment = document.getElementById('key-env-input').value;

      try {
        const res = await fetch('/api/keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({ name, environment })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Membuat Key',
            text: data.error?.message || 'Gagal membuat API Key baru.',
            confirmButtonColor: '#171717'
          });
          return;
        }

        const secretInput = document.getElementById('new-key-secret');
        const alertBox = document.getElementById('key-created-alert');
        if (secretInput) secretInput.value = data.data.api_key;
        if (alertBox) alertBox.style.display = 'block';

        try {
          const keyVault = JSON.parse(localStorage.getItem('cinedata_key_vault') || '{}');
          keyVault[data.data.id] = data.data.api_key;
          localStorage.setItem('cinedata_key_vault', JSON.stringify(keyVault));
        } catch (e) {}

        Swal.fire({
          icon: 'success',
          title: 'API Key Berhasil Dibuat',
          text: 'Salin kunci rahasia Anda dan simpan di tempat aman.',
          timer: 2000,
          showConfirmButton: false
        });

        loadKeys();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Membuat Key',
          text: 'Terjadi kesalahan sistem saat membuat API key.',
          confirmButtonColor: '#171717'
        });
      }
    });
  }

  // Try API Runner
  const tryApiForm = document.getElementById('try-api-form');
  if (tryApiForm) {
    tryApiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const apiKey = document.getElementById('try-api-key').value;
      const endpoint = document.getElementById('try-endpoint').value;
      const queryParams = document.getElementById('try-query-params').value;

      let fullUrl = endpoint;
      if (queryParams) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams;
      }

      const startTime = performance.now();
      try {
        const res = await fetch(fullUrl, {
          headers: { 'x-api-key': apiKey }
        });
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        const json = await res.json();

        const section = document.getElementById('try-response-section');
        if (section) section.style.display = 'block';
        const statusBadge = document.getElementById('try-status-badge');
        if (statusBadge) {
          statusBadge.textContent = `HTTP ${res.status} ${res.ok ? 'OK' : 'ERROR'}`;
          statusBadge.className = `badge ${res.ok ? 'badge-success' : 'badge-danger'}`;
        }
        const timeLabel = document.getElementById('try-time');
        if (timeLabel) timeLabel.textContent = `Time: ${responseTime} ms`;
        const codeBox = document.getElementById('try-response-code');
        if (codeBox) codeBox.textContent = JSON.stringify(json, null, 2);

        loadOverviewStats();
      } catch (err) {
        alert('Error connecting to API');
      }
    });
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');

  const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeNav) activeNav.classList.add('active');

  const activePane = document.getElementById(tabId);
  if (activePane) activePane.style.display = 'block';

  if (tabId === 'tab-overview') loadOverviewStats();
  if (tabId === 'tab-keys') loadKeys();
  if (tabId === 'tab-catalog') renderCatalog();
  if (tabId === 'tab-profile') renderProfile();
}

async function verifySession() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      state.token = null;
      localStorage.removeItem('cinedata_jwt');
      showAuthScreen();
      return;
    }

    state.user = data.data.user;
    showAppScreen();
  } catch (err) {
    showAuthScreen();
  }
}

let realTimeInterval = null;

function startRealTimePolling() {
  if (realTimeInterval) clearInterval(realTimeInterval);
  realTimeInterval = setInterval(() => {
    const overviewTab = document.getElementById('tab-overview');
    if (state.token && overviewTab && overviewTab.style.display !== 'none') {
      loadOverviewStats();
    }
  }, 3000);
}

function stopRealTimePolling() {
  if (realTimeInterval) {
    clearInterval(realTimeInterval);
    realTimeInterval = null;
  }
}

function showAuthScreen() {
  stopRealTimePolling();
  window.location.href = '/login';
}

function showAppScreen() {
  if (authScreen) authScreen.style.display = 'none';
  if (appScreen) appScreen.style.display = 'flex';

  if (state.user) {
    document.getElementById('user-avatar').textContent = state.user.name.charAt(0).toUpperCase();
    document.getElementById('user-display-name').textContent = state.user.name;
    document.getElementById('user-display-email').textContent = state.user.email;
  }

  loadOverviewStats();
  startRealTimePolling();
}

async function loadOverviewStats() {
  try {
    const [statsRes, logsRes] = await Promise.all([
      fetch('/api/usage/stats', { headers: { 'Authorization': `Bearer ${state.token}` } }),
      fetch('/api/usage?limit=10', { headers: { 'Authorization': `Bearer ${state.token}` } })
    ]);

    const statsData = await statsRes.json();
    const logsData = await logsRes.json();

    if (statsData.success) {
      const s = statsData.data;
      document.getElementById('stat-total-requests').textContent = s.total_requests;
      document.getElementById('stat-active-keys').textContent = s.active_api_keys;
      document.getElementById('stat-success-rate').textContent = s.success_rate;
      document.getElementById('stat-avg-time').textContent = s.average_response_time;
    }

    if (logsData.success) {
      renderOverviewLogs(logsData.data);
    }
  } catch (err) {
    console.error('Error loading overview stats:', err);
  }
}

function renderOverviewLogs(logs) {
  const tbody = document.getElementById('overview-usage-tbody');
  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No API requests logged yet.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td><span class="code-badge">${l.method}</span></td>
      <td><code style="color: var(--color-accent-cobalt); font-weight: 600;">${l.endpoint}</code></td>
      <td><span class="badge ${l.status_code < 400 ? 'badge-success' : 'badge-danger'}">${l.status_code}</span></td>
      <td>${l.response_time} ms</td>
      <td><span class="code-badge">${l.key_prefix || 'cd_live_'}***</span></td>
      <td style="color: var(--color-text-dim); font-size: 0.8rem; font-family: var(--font-mono);">${new Date(l.requested_at).toLocaleString()}</td>
    </tr>
  `).join('');
}

async function loadKeys() {
  try {
    const res = await fetch('/api/keys', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    const tbody = document.getElementById('keys-tbody');
    if (!data.success || !data.data || data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No API keys generated yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.data.map(k => `
      <tr>
        <td><strong>${k.name}</strong></td>
        <td><span class="code-badge">${k.key_prefix}...</span></td>
        <td><span class="badge badge-amber">${k.environment}</span></td>
        <td><span class="badge ${k.is_active ? 'badge-success' : 'badge-danger'}">${k.is_active ? 'ACTIVE' : 'REVOKED'}</span></td>
        <td style="font-size:0.8rem; color:var(--text-dim);">${k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}</td>
        <td style="font-size:0.8rem; color:var(--text-dim);">${k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}</td>
        <td style="display: flex; gap: 0.35rem; align-items: center;">
          <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="viewOrCopyKey('${k.id}', '${k.name.replace(/'/g, "\\'")}', '${k.key_prefix}')"><i class="fa-solid fa-copy" style="margin-right: 0.25rem;"></i>Copy Key</button>
          ${k.is_active ? `<button class="btn btn-danger" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="revokeKey(${k.id})"><i class="fa-solid fa-ban" style="margin-right: 0.25rem;"></i>Revoke</button>` : ''}
          <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="deleteKey(${k.id})"><i class="fa-solid fa-trash" style="margin-right: 0.25rem;"></i>Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading keys:', err);
  }
}

function viewOrCopyKey(keyId, keyName, keyPrefix) {
  let fullKey = null;
  try {
    const keyVault = JSON.parse(localStorage.getItem('cinedata_key_vault') || '{}');
    fullKey = keyVault[keyId];
  } catch (e) {}

  // Fallback demo key for ID 1 or demo key
  if (!fullKey && (keyId == 1 || keyPrefix === 'cd_live_')) {
    fullKey = 'cd_live_c85f1777b75e462225e4eb4a80eb8663';
  }

  if (fullKey) {
    Swal.fire({
      title: `${keyName}`,
      html: `
        <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.75rem;">Berikut adalah API Key rahasia Anda:</p>
        <input type="text" id="swal-key-value" class="form-input" value="${fullKey}" readonly style="font-family: var(--font-mono); font-size: 0.9rem; text-align: center; color: var(--color-accent-cobalt); margin-bottom: 0.5rem; width: 100%;">
      `,
      showCancelButton: true,
      confirmButtonText: 'Copy Secret Key',
      cancelButtonText: 'Tutup',
      confirmButtonColor: '#171717'
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(fullKey);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'API Key berhasil disalin ke clipboard!',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  } else {
    Swal.fire({
      title: `API Key Prefix: ${keyPrefix}...`,
      html: `<p style="font-size:0.85rem; color:#666;">Demi standar keamanan <strong>SHA-256 Hashed</strong>, kunci rahasia disimpan dalam bentuk hash di database. Jika Anda lupa menyalinnya, Anda dapat dengan mudah membuat API key baru kapan saja.</p>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Buat Key Baru',
      cancelButtonText: 'Tutup',
      confirmButtonColor: '#171717'
    }).then((res) => {
      if (res.isConfirmed) {
        document.getElementById('open-create-key-modal').click();
      }
    });
  }
}

async function revokeKey(keyId) {
  const result = await Swal.fire({
    title: 'Revoke API Key?',
    text: 'Aplikasi yang menggunakan key ini akan kehilangan akses secara langsung.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#666',
    confirmButtonText: 'Ya, Revoke Key',
    cancelButtonText: 'Batal'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`/api/keys/${keyId}/revoke`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'API Key Direvoke', timer: 1500, showConfirmButton: false });
      loadKeys();
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal Revoke Key', text: 'Terjadi kesalahan saat mencabut akses key.' });
  }
}

async function deleteKey(keyId) {
  const result = await Swal.fire({
    title: 'Hapus API Key?',
    text: 'Tindakan ini permanen. Catatan API Key akan dihapus dari sistem.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#666',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`/api/keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'API Key Dihapus', timer: 1500, showConfirmButton: false });
      loadKeys();
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal Hapus Key', text: 'Terjadi kesalahan saat menghapus key.' });
  }
}

function closeKeyModal() {
  document.getElementById('create-key-modal').classList.remove('active');
}

function copyNewKeySecret() {
  const secretInput = document.getElementById('new-key-secret');
  secretInput.select();
  document.execCommand('copy');
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'API Secret tersalin ke clipboard!',
    showConfirmButton: false,
    timer: 2000
  });
}

function renderCatalog() {
  const catalogList = document.getElementById('catalog-list');
  const catalogItems = [
    { method: 'GET', path: '/api/v1/movies', params: '?search=nolan&genre=action&sort=-rating&page=1', desc: 'List all movies with filtering (search, genre, year, rating_min), sorting (-rating, popularity), and pagination.' },
    { method: 'GET', path: '/api/v1/movies/:id', params: 'id: integer (e.g. 1)', desc: 'Get detailed information for a specific movie including genres, cast, and production companies.' },
    { method: 'GET', path: '/api/v1/movies/slug/:slug', params: 'slug: string (e.g. inception)', desc: 'Retrieve movie data by SEO-friendly URL slug.' },
    { method: 'GET', path: '/api/v1/genres', params: 'none', desc: 'Retrieve the complete list of 23 movie genres with slugs.' },
    { method: 'GET', path: '/api/v1/genres/:id', params: 'id: integer (e.g. 18)', desc: 'Get single genre info along with total movie count.' },
    { method: 'GET', path: '/api/v1/people', params: '?search=nolan&page=1', desc: 'Get directors and cast members with pagination and search.' },
    { method: 'GET', path: '/api/v1/companies', params: '?search=warner', desc: 'Get major production companies (A24, Warner Bros, Universal, etc.).' },
    { method: 'GET', path: '/api/v1/movies/:id/cast', params: 'id: integer', desc: 'Get cast members and character roles for a movie.' },
    { method: 'GET', path: '/api/v1/movies/:id/reviews', params: 'id: integer', desc: 'Get critic reviews and audience ratings for a movie.' }
  ];

  catalogList.innerHTML = catalogItems.map(item => `
    <div style="padding: 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-paper-0);">
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.4rem;">
        <span class="badge badge-success" style="font-weight: 700;">${item.method}</span>
        <code style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-main); font-family: var(--font-mono);">${item.path}</code>
      </div>
      <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">${item.desc}</p>
      <div style="font-size: 0.75rem; color: var(--color-text-dim); font-family: var(--font-mono);">
        <span style="color: var(--color-accent-cobalt); font-weight: 600;">Params:</span> ${item.params}
      </div>
    </div>
  `).join('');
}

function renderProfile() {
  if (state.user) {
    document.getElementById('profile-name').value = state.user.name;
    document.getElementById('profile-email').value = state.user.email;
    document.getElementById('profile-joined').value = new Date(state.user.created_at || Date.now()).toLocaleDateString();
  }
}
