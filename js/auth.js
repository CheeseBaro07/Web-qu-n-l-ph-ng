(function () {
'use strict';
const USERS = [
  { username: 'admin',     password: 'admin123', name: 'Quản trị viên', role: 'admin' },
  { username: 'giangvien', password: 'gv123',    name: 'Giảng viên',    role: 'lecturer' },
  { username: 'sinhvien',  password: 'sv123',    name: 'Sinh viên',     role: 'student' }
];
const ROLE_LABEL = { admin: 'Quản trị viên', lecturer: 'Giảng viên', student: 'Sinh viên' };
const PERMS = {
  admin:    { addRoom: 1, editRoom: 1, deleteRoom: 1, register: 1, cancelBooking: 1 },
  lecturer: { register: 1, cancelBooking: 1 },
  student:  {}
};
const ALL_PAGES = ['trangchu', 'phonghoc', 'timkiem', 'lichphong', 'dangky'];
const PAGES = { admin: ALL_PAGES, lecturer: ALL_PAGES, student: ['trangchu', 'timkiem', 'lichphong'] };

const KEY = 'qlphong_session_v1', DENIED = 'qlphong_denied';
const page = location.pathname.split('/').pop().replace('.html', '') || 'trangchu';

function current() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s && USERS.find(u => u.username === s.username) || null;
  } catch (e) { return null; }
}
const user = current();
const Auth = {
  ready: false,
  user: () => user,
  can: p => !!(user && PERMS[user.role][p]),
  login(username, password) {
    const u = USERS.find(x => x.username === username.trim().toLowerCase() && x.password === password);
    if (u) localStorage.setItem(KEY, JSON.stringify({ username: u.username }));
    return !!u;
  },
  logout() { localStorage.removeItem(KEY); location.replace('dangnhap.html'); }
};
window.Auth = Auth;


if (page === 'dangnhap') {
  if (user) { location.replace('trangchu.html'); return; }
  Auth.ready = true;
  document.addEventListener('DOMContentLoaded', initLogin);
  return;
}
if (!user) { location.replace('dangnhap.html'); return; }
if (!PAGES[user.role].includes(page)) {
  sessionStorage.setItem(DENIED, '1');
  location.replace('trangchu.html');
  return;
}
Auth.ready = true;
document.addEventListener('DOMContentLoaded', initChrome);

function initChrome() {
  document.querySelectorAll('nav a').forEach(a => {
    if (!PAGES[user.role].includes(a.getAttribute('href').replace('.html', ''))) a.remove();
  });
  const box = document.createElement('div');
  box.className = 'userbox';
  box.innerHTML = '<span class="who"></span><button type="button" class="logout">Đăng xuất</button>';
  box.querySelector('.who').textContent = `${user.name} (${ROLE_LABEL[user.role]})`;
  box.querySelector('.logout').addEventListener('click', Auth.logout);
  document.querySelector('nav').appendChild(box);
  if (sessionStorage.getItem(DENIED)) {
    sessionStorage.removeItem(DENIED);
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'alert');
    t.textContent = 'Tài khoản của bạn không có quyền vào trang đó.';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
}

function initLogin() {
  const form = document.getElementById('loginForm'), msg = document.getElementById('loginMessage');
  const u = document.getElementById('username'), p = document.getElementById('password');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (Auth.login(u.value, p.value)) { location.replace('trangchu.html'); return; }
    msg.textContent = 'Sai tên đăng nhập hoặc mật khẩu. Hãy kiểm tra lại hoặc chọn một tài khoản mẫu bên dưới.';
    p.value = ''; p.focus();
  });
  document.getElementById('showPass').addEventListener('change', e => { p.type = e.target.checked ? 'text' : 'password'; });
  document.querySelectorAll('[data-user]').forEach(b => b.addEventListener('click', () => {
    u.value = b.dataset.user; p.value = b.dataset.pass; msg.textContent = ''; form.requestSubmit();
  }));
}
})();
