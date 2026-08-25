// Dedicated Login & Register Page Controller

document.addEventListener('DOMContentLoaded', () => {
  // If user is already logged in with valid token, redirect to dashboard
  const token = localStorage.getItem('cinedata_jwt');
  if (token) {
    fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.location.href = '/';
        } else {
          localStorage.removeItem('cinedata_jwt');
        }
      })
      .catch(() => {
        localStorage.removeItem('cinedata_jwt');
      });
  }

  let isRegistering = false;

  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('name-group');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  const authToggleMsg = document.getElementById('auth-toggle-msg');

  if (authToggleBtn) {
    authToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isRegistering = !isRegistering;
      if (isRegistering) {
        if (authSubtitle) authSubtitle.textContent = 'Daftarkan akun baru untuk mengelola API Key & Telemetri';
        if (nameGroup) nameGroup.style.display = 'block';
        if (authSubmitBtn) authSubmitBtn.innerHTML = '<i class="fa-solid fa-user-check" style="margin-right: 0.4rem;"></i>Daftar (Sign Up)';
        if (authToggleMsg) authToggleMsg.textContent = 'Sudah memiliki akun?';
        if (authToggleBtn) authToggleBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="margin-right: 0.25rem;"></i>Masuk (Sign In)';
      } else {
        if (authSubtitle) authSubtitle.textContent = 'Akses kredensial API key, sandbox, dan analitik telemetri Anda';
        if (nameGroup) nameGroup.style.display = 'none';
        if (authSubmitBtn) authSubmitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="margin-right: 0.4rem;"></i>Masuk (Sign In)';
        if (authToggleMsg) authToggleMsg.textContent = 'Belum memiliki akun?';
        if (authToggleBtn) authToggleBtn.innerHTML = '<i class="fa-solid fa-user-plus" style="margin-right: 0.25rem;"></i>Buat Akun Baru';
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering ? { name, email, password } : { email, password };

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

      localStorage.setItem('cinedata_jwt', data.data.token);
      
      Swal.fire({
        icon: 'success',
        title: isRegistering ? 'Registrasi Berhasil' : 'Login Berhasil',
        text: isRegistering ? 'Akun developer baru berhasil dibuat.' : 'Selamat datang di CineData Platform.',
        timer: 1200,
        showConfirmButton: false
      }).then(() => {
        window.location.href = '/';
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1200);

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
});
