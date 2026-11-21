# Beasify — Modul 8 (Web & UI/UX Developer - VINIX7)

**Live Web:** https://beasifyv3.vercel.app  
**Repositori GitHub:** https://github.com/Rere14-seal/Kelompok-35-Beasify.v3

## Ringkasan & Sumber Data

- **Pengelolaan Data:** Menggunakan penyimpanan sisi klien (`localStorage`) dan katalog/data aplikasi tanpa API eksternal maupun file `.env`.
- **Alur Utama:** Pencarian & filter beasiswa, _bookmark_, _detail beasiswa_, _checklist_ & unggah berkas, _riwayat apply_, _profil_, serta _login & dashboard mitra_.

## Panduan Cepat Uji Coba untuk Mentor

1. Buka langsung **Live Web** (`https://beasifyv3.vercel.app`) atau halaman **Beranda** (`beranda.html`).
2. Coba fitur pencarian kata kunci dan tombol **Filter** (jenjang & tipe pendanaan), lalu uji _empty state_ & tombol **Reset**.
3. Uji simpan _bookmark_, buka _detail beasiswa_ -> _checklist dokumen_, cek _riwayat apply_, serta uji form _login mitra_ dan _tambah/edit program mitra_ (termasuk validasi input & _toast_ notifikasi).

### Log Prompt AI & Perbaikan Manual

- **Beranda & Katalog Beasiswa (`beranda.html` & `main.js`)**
  - Arahan prompt: Menyusun logika pencarian kata kunci dan filter multi-kriteria (jenjang pendidikan & tipe pendanaan) dengan tetap mempertahankan class dan layout yang sudah ada.
  - Perbaikan manual: Memecah `data-level` berdasarkan koma (`.split(",")`) agar jenjang gabungan seperti `"S1, S2"` tetap terbaca saat difilter, serta menampilkan pesan empty state dan tombol reset ketika hasil kosong.

- **Bookmark List (`bookmark.html` & `main.js`)**
  - Arahan prompt: Menyimpan dan membaca daftar bookmark lewat `localStorage` (`beasify_bookmarks`), menyaring daftar simpanan, serta membedakan pesan empty state saat belum ada simpanan vs saat hasil filter kosong.
  - Perbaikan manual: Memakai `safeJsonParse` dan `escapeHtml` saat membaca data dan me-render kartu agar aman dari error maupun injeksi tag.

- **Detail Beasiswa & Checklist Dokumen (`detail-beasiswa.html`, `checklist-dokumen.html` & `main.js`)**
  - Arahan prompt: Memuat detail program sesuai parameter URL (`?id=`), tombol bookmark, daftar dokumen wajib/opsional, validasi unggahan berkas, dan alur simulasi pendaftaran.
  - Perbaikan manual: Membatasi ekstensi serta ukuran berkas maksimal 5 MB, mewajibkan berkas terunggah sebelum item dicentang, dan mengaktifkan tombol submit setelah berkas wajib lengkap.

- **Riwayat Apply (`riwayat.html` & `main.js`)**
  - Arahan prompt: Menggabungkan data riwayat dengan data yang tersimpan di `localStorage` (`beasify_applied_scholarships`), lalu menyediakan filter status (pill) dan pencarian kata kunci.
  - Perbaikan manual: Merapikan tampilan badge status, jumlah berkas terunggah, dan tombol reset saat hasil pencarian/filter tidak ditemukan.

- **Profil Sobat (`profile.html` & `main.js`)**
  - Arahan prompt: Membaca/menyimpan profil pengguna ke `localStorage` (`beasify_profile`) dengan mode baca/edit, tombol edit, simpan, dan batal, serta notifikasi toast.
  - Perbaikan manual: Merapikan pembersihan spasi (`.trim()`) dan mengembalikan input ke mode `readonly` setelah disimpan atau dibatalkan.

- **Login, Dashboard & Form Publikasi Mitra (`login-mitra.html`, `dashboard-mitra.html`, `profile-mitra.html` & `main.js`)**
  - Arahan prompt: Memisahkan alur Mitra, memvalidasi form login dan form tambah/edit program (nama, jenjang, pendanaan, deskripsi, deadline, wilayah, IPK, benefit, kuota, URL, dan gambar banner), mengelola CRUD/sudahi/hapus program di `localStorage`, serta memakai toast pengganti `alert()`.
  - Perbaikan manual: Memastikan alur Sobat dan Mitra tidak saling bentrok, melengkapi validasi input/format URL/gambar, serta menjaga tampilan responsif di layar HP.

- **Struktur HTML & Repositori GitHub**
  - Arahan prompt: Menjaga struktur semantik HTML5, keterikatan `for`/`id`, sticky header, floating search bar, dan toast tanpa merusak gaya visual.
  - Perbaikan manual: Mengecek ulang aset/logo, layout halaman, alur branch/commit/PR, serta memastikan tidak ada secret atau berkas `.env` yang ikut ter-upload ke repositori publik.
