// script.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const container = document.getElementById('articles-container');
const tabBtns = document.querySelectorAll('.tab-btn');

if (!container) {
  console.error('❌ Container #articles-container tidak ditemukan!');
} else {
  console.log('✅ Container ditemukan.');
}

if (tabBtns.length === 0) {
  console.error('❌ Tombol tab tidak ditemukan!');
} else {
  console.log(`✅ Ditemukan ${tabBtns.length} tombol tab.`);
}

let currentTab = 'ptn';
let articles = [];

async function loadArticles(kategori) {
  if (!container) {
    console.error('❌ Container tidak ada, tidak bisa memuat artikel.');
    return;
  }

  try {
    console.log(`📥 Memuat artikel untuk kategori: ${kategori}`);

    let snapshot;
    let useOrderBy = true;

    try {
      const q = query(
        collection(db, 'artikel'),
        where('kategori', '==', kategori),
        orderBy('tanggal', 'desc')
      );
      snapshot = await getDocs(q);
    } catch (error) {
      if (error.message && error.message.includes('requires an index')) {
        console.warn('⚠️ Indeks belum dibuat, mengambil data tanpa orderBy dan sorting manual.');
        useOrderBy = false;
        const q = query(
          collection(db, 'artikel'),
          where('kategori', '==', kategori)
        );
        snapshot = await getDocs(q);
      } else {
        throw error;
      }
    }

    console.log(`✅ Jumlah dokumen ditemukan: ${snapshot.size}`);

    articles = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.tanggal) {
        data.tanggal = { seconds: Date.now() / 1000 };
      }
      articles.push({ id: doc.id, ...data });
    });

    if (!useOrderBy) {
      articles.sort((a, b) => (b.tanggal?.seconds || 0) - (a.tanggal?.seconds || 0));
    }

    renderArticles(articles);
  } catch (error) {
    console.error('❌ Gagal memuat artikel:', error);
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#dc2626; padding:2rem;">Terjadi kesalahan: ${error.message}</p>`;
  }
}

function renderArticles(data) {
  if (!container) return;
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
      <a href="detail.html?id=${art.id}" class="article-card-link">
        <div class="article-card">
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
      </a>
    `;
  }).join('');
}

if (tabBtns.length > 0) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      loadArticles(currentTab);
    });
  });
} else {
  console.warn('⚠️ Tidak ada tombol tab, tidak bisa pasang event listener.');
}

loadArticles('ptn');
