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
    showAuthScreen();
  }
});

function setupEventListeners() {
  authToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    state.isRegistering = !state.isRegistering;
    if (state.isRegistering) {
      authTitle.textContent = 'Create an Account';
      authSubtitle.textContent = 'Sign up for a CineData developer account';
      nameGroup.style.display = 'block';
      authSubmitBtn.textContent = 'Sign Up';
      authToggleMsg.textContent = 'Already have an account?';
      authToggleBtn.textContent = 'Sign In';
    } else {
      authTitle.textContent = 'Welcome Back';
      authSubtitle.textContent = 'Log in to manage your API keys and analytics';
      nameGroup.style.display = 'none';
      authSubmitBtn.textContent = 'Sign In';
      authToggleMsg.textContent = "Don't have an account?";
      authToggleBtn.textContent = 'Sign Up';
    }
  });

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
        alert(data.error?.message || 'Authentication failed');
        return;
      }

      state.token = data.data.token;
      state.user = data.data.user;
      localStorage.setItem('cinedata_jwt', state.token);
      showAppScreen();
    } catch (err) {
      alert('Network error. Please try again.');
    }
  });

  logoutBtn.addEventListener('click', () => {
    state.token = null;
    state.user = null;
    localStorage.removeItem('cinedata_jwt');
    showAuthScreen();
  });

  // Tab Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Keys Modal
  document.getElementById('open-create-key-modal').addEventListener('click', () => {
    document.getElementById('create-key-modal').classList.add('active');
    document.getElementById('key-created-alert').style.display = 'none';
    document.getElementById('create-key-form').reset();
  });

  document.getElementById('create-key-form').addEventListener('submit', async (e) => {
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
        alert(data.error?.message || 'Failed to create key');
        return;
      }

      document.getElementById('new-key-secret').value = data.data.api_key;
      document.getElementById('key-created-alert').style.display = 'block';
      loadKeys();
    } catch (err) {
      alert('Error creating API key');
    }
  });

  // Try API Runner
  document.getElementById('try-api-form').addEventListener('submit', async (e) => {
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

      document.getElementById('try-response-section').style.display = 'block';
      const statusBadge = document.getElementById('try-status-badge');
      statusBadge.textContent = `HTTP ${res.status} ${res.ok ? 'OK' : 'ERROR'}`;
      statusBadge.className = `badge ${res.ok ? 'badge-success' : 'badge-danger'}`;
      document.getElementById('try-time').textContent = `Time: ${responseTime} ms`;
      document.getElementById('try-response-code').textContent = JSON.stringify(json, null, 2);

      // Refresh overview stats
      loadOverviewStats();
    } catch (err) {
      alert('Error connecting to API');
    }
  });
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
  authScreen.style.display = 'flex';
  appScreen.style.display = 'none';
}

function showAppScreen() {
  authScreen.style.display = 'none';
  appScreen.style.display = 'flex';

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
        <td>
          ${k.is_active ? `<button class="btn btn-danger" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="revokeKey(${k.id})">Revoke</button>` : ''}
          <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="deleteKey(${k.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading keys:', err);
  }
}

async function revokeKey(keyId) {
  if (!confirm('Are you sure you want to revoke this API Key? Applications using it will lose access.')) return;
  try {
    const res = await fetch(`/api/keys/${keyId}/revoke`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) loadKeys();
  } catch (err) {
    alert('Error revoking key');
  }
}

async function deleteKey(keyId) {
  if (!confirm('Permanently delete this API Key?')) return;
  try {
    const res = await fetch(`/api/keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (res.ok) loadKeys();
  } catch (err) {
    alert('Error deleting key');
  }
}

function closeKeyModal() {
  document.getElementById('create-key-modal').classList.remove('active');
}

function copyNewKeySecret() {
  const secretInput = document.getElementById('new-key-secret');
  secretInput.select();
  document.execCommand('copy');
  alert('API Key secret copied to clipboard!');
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
