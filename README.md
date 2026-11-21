# Beasify — Modul 8 (Web & UI/UX Developer - VINIX7)

**Live Web:** https://beasifyv3.vercel.app  
**Repositori GitHub:** https://github.com/Rere14-seal/Kelompok-35-Beasify.v3

## Ringkasan & Sumber Data
- **Pengelolaan Data:** Menggunakan penyimpanan sisi klien (`localStorage`) dan katalog/data aplikasi tanpa API eksternal maupun file `.env`.
- **Alur Utama:** Pencarian & filter beasiswa, *bookmark*, *detail beasiswa*, *checklist* & unggah berkas, *riwayat apply*, *profil*, serta *login & dashboard mitra*.

## Panduan Uji Coba 
1. Buka langsung **Live Web** (`https://beasifyv3.vercel.app`) atau halaman **Beranda** (`beranda.html`).
2. Coba fitur pencarian kata kunci dan tombol **Filter** (jenjang & tipe pendanaan), lalu uji *empty state* & tombol **Reset**.
3. Uji simpan *bookmark*, buka *detail beasiswa* -> *checklist dokumen*, cek *riwayat apply*, serta uji form *login mitra* dan *tambah/edit program mitra* (termasuk validasi input & *toast* notifikasi).

## Log Prompt AI & Perbaikan Manual
- **Prompt AI:** Digunakan bertahap untuk menyusun logika pencarian/filter, manajemen `localStorage`, validasi form, dan notifikasi *toast* dengan menjaga *class* & tampilan yang sudah ada.
- **Perbaikan Manual:** Merapikan pencocokan multi-jenjang (`S1, S2`), validasi input/berkas & sanitasi HTML, pesan *empty state* dinamis, serta penyesuaian *layout* dan alur Sobat vs Mitra.
- | Tahap / Fitur | Halaman / Modul Terkait | Ringkasan Arahan / Prompt AI | Catatan & Perbaikan Manual |
| :--- | :--- | :--- | :--- |
| **Data Dinamis, Pencarian & Filter** | `beranda.html`, `bookmark.html`, `riwayat.html` (`initScholarshipFilter`, `initBookmarkPage`, `initRiwayatApplyPage`) | Meminta penyusunan logika pencarian kata kunci dan filter multi-kriteria (jenjang, pendanaan, status) sambil mempertahankan *class* dan *layout* yang ada. | Memecah `data-level` per koma (`.split(",")`) agar jenjang `"S1, S2"` cocok saat difilter, serta menyusun pesan *empty state* dinamis dan tombol *reset*. |
| **State Lokal & Bookmark** | `beranda.html`, `bookmark.html`, `detail-beasiswa.html` (`initBerandaBookmarks`, `initBookmarkPage`, `initFocusedDetailPage`) | Meminta penyimpanan dan pembacaan status *bookmark* melalui `localStorage` (`beasify_bookmarks`) beserta sinkronisasi tampilan tombol dan daftar simpanan. | Menggunakan `safeJsonParse` dan `escapeHtml` untuk mencegah *error* JSON dan injeksi tag saat membaca serta merender data. |
| **Checklist Dokumen & Validasi Berkas** | `checklist-dokumen.html` (`initChecklistDokumen`) | Meminta logika daftar dokumen wajib/opsional, validasi unggahan berkas, status kelengkapan, dan alur simulasi pendaftaran. | Membatasi ekstensi & ukuran file maksimal 5 MB, mewajibkan berkas terunggah sebelum item dicentang, dan mengaktifkan tombol *submit* setelah berkas wajib lengkap. |
| **Form Validasi, Sanitasi & Toast UX** | `login-mitra.html`, `dashboard-mitra.html`, `profile.html`, `profile-mitra.html` (`initMitraLoginRedirect`, `initMitraDashboardPage`, `initProfilPage`, `initMitraProfilPage`) | Meminta validasi input form (cegah kosong, `.trim()`, format email/URL/kuota/gambar), pemisahan alur Sobat vs Mitra, dan *toast notification* pengganti `alert()`. | Merapikan validasi *field* di form mitra dan login, menjaga tampilan responsif di *mobile*, serta memastikan alur inisialisasi Sobat dan Mitra tidak bentrok. |
| **Struktur HTML, Aksesibilitas & Git** | Seluruh halaman HTML & repositori GitHub (`Kelompok-35-Beasify.v3`) | Meminta perapihan struktur semantik HTML5, keterikatan `for`/`id`, *sticky header*, *floating search bar*, dan audit validasi/performa. | Melakukan pemeriksaan manual aset/logo, *layout* halaman, riwayat *commit/branch/PR*, serta memastikan tidak ada *secret* atau berkas `.env` yang terekspos di repo publik. |
