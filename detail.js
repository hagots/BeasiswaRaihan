// detail.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const detailContent = document.getElementById('detailContent');

if (!detailContent) {
  console.error('❌ Elemen #detailContent tidak ditemukan!');
} else {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    detailContent.innerHTML = `<div class="not-found">⚠️ Artikel tidak ditemukan (ID tidak ada).</div>`;
  } else {
    loadArticleDetail(articleId);
  }
}

async function loadArticleDetail(id) {
  try {
    detailContent.innerHTML = `<div class="loading-spinner">⏳ Memuat artikel...</div>`;

    const q = query(collection(db, 'artikel'), where('__name__', '==', id));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      detailContent.innerHTML = `<div class="not-found">❌ Artikel tidak ditemukan.</div>`;
      return;
    }

    let data = null;
    snapshot.forEach(doc => {
      data = { id: doc.id, ...doc.data() };
    });

    if (!data) {
      detailContent.innerHTML = `<div class="not-found">❌ Artikel tidak ditemukan.</div>`;
      return;
    }

    const imageUrl = data.gambar || 'https://via.placeholder.com/800x400?text=No+Image';
    const tanggal = data.tanggal?.seconds
      ? new Date(data.tanggal.seconds * 1000).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })
      : 'Tanpa tanggal';

    // === GAMBAR MENGGUNAKAN CLASS .detail-image ===
    detailContent.innerHTML = `
      <h1 style="font-size:2rem; font-weight:700; margin-bottom:0.5rem; color:#0f172a;">${data.judul}</h1>
      <div class="detail-meta">
        ✍️ ${data.penulis || 'Admin'} &nbsp;•&nbsp; 📅 ${tanggal}
      </div>
      <img class="detail-image" src="${imageUrl}" alt="${data.judul}" onerror="this.src='https://via.placeholder.com/800x400?text=Gambar+Error'" />
      <div class="detail-body">${data.konten}</div>
    `;

  } catch (error) {
    console.error('❌ Gagal memuat detail artikel:', error);
    detailContent.innerHTML = `<div class="not-found">❌ Terjadi kesalahan: ${error.message}</div>`;
  }
}
