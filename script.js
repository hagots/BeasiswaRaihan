// script.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let currentTab = 'ptn';
let articles = [];

// Elemen
const container = document.getElementById('articles-container');
const tabBtns = document.querySelectorAll('.tab-btn');
const modal = document.getElementById('detail-modal');
const modalTitle = document.getElementById('detail-title');
const modalBody = document.getElementById('detail-body');
const closeModal = document.querySelector('.close-modal');

// Fungsi ambil data dari Firestore
async function loadArticles(kategori) {
  const q = query(
    collection(db, 'artikel'),
    where('kategori', '==', kategori),
    orderBy('tanggal', 'desc')
  );
  const snapshot = await getDocs(q);
  articles = [];
  snapshot.forEach(doc => {
    articles.push({ id: doc.id, ...doc.data() });
  });
  renderArticles(articles);
}

// Render kartu artikel
function renderArticles(data) {
  if (data.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#888;">Belum ada artikel untuk kategori ini.</p>`;
    return;
  }
  container.innerHTML = data.map(art => `
    <div class="article-card" data-id="${art.id}">
      <h3>${art.judul}</h3>
      <div class="meta">📅 ${new Date(art.tanggal?.seconds * 1000).toLocaleDateString('id-ID') || 'Tanpa tanggal'}</div>
      <div class="summary">${art.ringkasan || art.konten.substring(0, 120) + '...'}</div>
    </div>
  `).join('');

  // Event klik kartu
  document.querySelectorAll('.article-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const artikel = articles.find(a => a.id === id);
      if (artikel) showDetail(artikel);
    });
  });
}

// Tampilkan modal detail
function showDetail(artikel) {
  modalTitle.textContent = artikel.judul;
  modalBody.textContent = artikel.konten;
  modal.classList.add('show');
}

// Tutup modal
closeModal.addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('show');
});

// Event tab
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    loadArticles(currentTab);
  });
});

// Muat awal
loadArticles('ptn');