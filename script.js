// script.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let currentTab = 'ptn';
let articles = [];

const container = document.getElementById('articles-container');
const tabBtns = document.querySelectorAll('.tab-btn');
const modal = document.getElementById('detail-modal');
const modalTitle = document.getElementById('detail-title');
const modalMeta = document.getElementById('detail-meta');
const modalImage = document.getElementById('detail-image');
const modalBody = document.getElementById('detail-body');
const closeModal = document.querySelector('.close-modal');

// Fungsi ambil data dengan error handling
async function loadArticles(kategori) {
  try {
    console.log(`📥 Memuat artikel untuk kategori: ${kategori}`);

    // Coba pakai orderBy tanggal, jika gagal, pakai tanpa orderBy
    let q;
    try {
      q = query(
        collection(db, 'artikel'),
        where('kategori', '==', kategori),
        orderBy('tanggal', 'desc')
      );
    } catch (err) {
      console.warn('⚠️ Field tanggal mungkin belum ada, menggunakan urutan default.');
      q = query(
        collection(db, 'artikel'),
        where('kategori', '==', kategori)
      );
    }

    const snapshot = await getDocs(q);
    console.log(`✅ Jumlah dokumen ditemukan: ${snapshot.size}`);

    articles = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Jika tidak ada tanggal, tambahkan default
      if (!data.tanggal) {
        data.tanggal = { seconds: Date.now() / 1000 };
      }
      articles.push({ id: doc.id, ...data });
    });

    if (articles.length === 0) {
      console.warn('⚠️ Tidak ada artikel untuk kategori ini.');
    }

    renderArticles(articles);
  } catch (error) {
    console.error('❌ Gagal memuat artikel:', error);
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#dc2626; padding:2rem;">Terjadi kesalahan: ${error.message}</p>`;
  }
}

// Render kartu artikel
function renderArticles(data) {
  if (data.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:3rem;">Belum ada artikel untuk kategori ini.</p>`;
    return;
  }

  container.innerHTML = data.map(art => {
    const imageUrl = art.gambar || 'https://via.placeholder.com/400x200?text=No+Image';
    const tanggal = art.tanggal?.seconds
      ? new Date(art.tanggal.seconds * 1000).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
      : 'Tanpa tanggal';
    return `
      <div class="article-card" data-id="${art.id}">
        <img class="card-image" src="${imageUrl}" alt="${art.judul}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Gambar+Error'" />
        <div class="card-content">
          <h3>${art.judul}</h3>
          <div class="meta">
            <span class="author">✍️ ${art.penulis || 'Admin'}</span>
            <span>📅 ${tanggal}</span>
          </div>
          <div class="summary">${art.ringkasan || art.konten.substring(0, 120) + '...'}</div>
          <div class="read-more">Baca Selengkapnya →</div>
        </div>
      </div>
    `;
  }).join('');

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
  const tanggal = artikel.tanggal?.seconds
    ? new Date(artikel.tanggal.seconds * 1000).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
    : 'Tanpa tanggal';
  modalMeta.innerHTML = `✍️ ${artikel.penulis || 'Admin'} &nbsp;•&nbsp; 📅 ${tanggal}`;
  modalImage.src = artikel.gambar || 'https://via.placeholder.com/800x400?text=No+Image';
  modalImage.alt = artikel.judul;
  modalImage.onerror = function() { this.src = 'https://via.placeholder.com/800x400?text=Gambar+Error'; };
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
