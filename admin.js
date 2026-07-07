// admin.js
import { db, auth } from './firebase-config.js';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Elemen
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginStatus = document.getElementById('loginStatus');

const form = document.getElementById('articleForm');
const editId = document.getElementById('editId');
const judul = document.getElementById('judul');
const kategori = document.getElementById('kategori');
const ringkasan = document.getElementById('ringkasan');
const konten = document.getElementById('konten');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formStatus = document.getElementById('formStatus');
const articleListContainer = document.getElementById('articleListContainer');

let currentUser = null;

// --- AUTH ---
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    loadArticles();
  } else {
    currentUser = null;
    loginSection.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
});

loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const pass = loginPassword.value.trim();
  if (!email || !pass) {
    showLoginStatus('Harap isi email dan password.', 'error');
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showLoginStatus('Login berhasil!', 'success');
  } catch (err) {
    showLoginStatus('Login gagal: ' + err.message, 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

function showLoginStatus(msg, type) {
  loginStatus.textContent = msg;
  loginStatus.className = 'status-msg ' + type;
}

// --- CRUD ---
async function loadArticles() {
  try {
    const q = query(collection(db, 'artikel'), orderBy('tanggal', 'desc'));
    const snapshot = await getDocs(q);
    let html = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const tanggal = data.tanggal ? new Date(data.tanggal.seconds * 1000).toLocaleDateString('id-ID') : '-';
      html += `
        <div class="article-item">
          <div class="info">
            <strong>${data.judul}</strong>
            <small>${data.kategori === 'ptn' ? '🏛 PTN' : '🎓 Beasiswa'} | ${tanggal}</small>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" data-id="${doc.id}" data-action="edit">✏️ Edit</button>
            <button class="btn btn-danger" data-id="${doc.id}" data-action="delete">🗑 Hapus</button>
          </div>
        </div>
      `;
    });
    articleListContainer.innerHTML = html || '<p style="color:#888;">Belum ada artikel.</p>';

    // Event listener untuk tombol edit & hapus
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => editArticle(btn.dataset.id));
    });
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => deleteArticle(btn.dataset.id));
    });
  } catch (err) {
    console.error('Gagal load artikel:', err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editId.value;
  const data = {
    judul: judul.value.trim(),
    kategori: kategori.value,
    ringkasan: ringkasan.value.trim(),
    konten: konten.value.trim(),
  };

  if (!data.judul || !data.konten) {
    showFormStatus('Judul dan konten wajib diisi!', 'error');
    return;
  }

  try {
    if (id) {
      // Update
      await updateDoc(doc(db, 'artikel', id), data);
      showFormStatus('Artikel berhasil diperbarui!', 'success');
    } else {
      // Tambah baru
      await addDoc(collection(db, 'artikel'), {
        ...data,
        tanggal: serverTimestamp()
      });
      showFormStatus('Artikel berhasil ditambahkan!', 'success');
    }
    resetForm();
    loadArticles();
  } catch (err) {
    showFormStatus('Gagal menyimpan: ' + err.message, 'error');
  }
});

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  editId.value = '';
  judul.value = '';
  kategori.value = 'ptn';
  ringkasan.value = '';
  konten.value = '';
  submitBtn.textContent = 'Simpan Artikel';
  formStatus.className = 'status-msg';
  formStatus.textContent = '';
}

async function editArticle(id) {
  try {
    const docSnap = await getDocs(query(collection(db, 'artikel')));
    let data = null;
    docSnap.forEach(d => {
      if (d.id === id) { data = { id: d.id, ...d.data() }; }
    });
    if (!data) return;
    editId.value = data.id;
    judul.value = data.judul;
    kategori.value = data.kategori;
    ringkasan.value = data.ringkasan || '';
    konten.value = data.konten;
    submitBtn.textContent = 'Update Artikel';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Gagal mengambil data artikel.');
  }
}

async function deleteArticle(id) {
  if (!confirm('Yakin hapus artikel ini?')) return;
  try {
    await deleteDoc(doc(db, 'artikel', id));
    showFormStatus('Artikel dihapus!', 'success');
    loadArticles();
  } catch (err) {
    alert('Gagal hapus: ' + err.message);
  }
}

function showFormStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = 'status-msg ' + type;
  setTimeout(() => {
    formStatus.className = 'status-msg';
    formStatus.textContent = '';
  }, 4000);
}