# WastraHub Frontend — Perbaikan

## Yang sudah dibenahi

1. **Bahasa Indonesia & Inggris** — Switcher ID/EN di navbar (LanguageContext). Teks utama (nav, home, regions, profile, orders, admin) mengikuti bahasa aktif.
2. **Konsistensi bahasa** — Label UI memakai `t()`; mode ID tidak menampilkan string EN tetap (dan sebaliknya) pada halaman yang sudah di-wire.
3. **Profil user** — Ubah nama, email, telepon; **tambah & hapus foto profil** (preview local, disimpan di localStorage bersama user).
4. **Admin dashboard** (`/admin/login`)  
   - Login demo: `admin@batikartisan.com` / `admin123`  
   - Dasbor statistik + grafik  
   - **Produk**: tambah, edit, hapus  
   - **Pesanan**: lihat pembeli + ubah status  
   - **Ulasan**: approve / hapus  
   - **Laporan penjualan**
5. **Detail pesanan user** — `/orders/:id` + tombol Detail di daftar pesanan.
6. **Button responsif** — CSS button menyesuaikan lebar layar kecil (hero actions full-width di mobile).
7. **Hero image** — `object-fit: contain`, tinggi auto agar tidak ter-crop.
8. **Section daerah di Home** — diganti **grid card** (bukan pill scroll).
9. **Page wilayah / detail daerah** — peta OpenStreetMap responsif per daerah.
10. **Hapus label 120+ / 180+ / 150+** pada kartu daerah.

## Cara jalanin

```bash
cd frontend
npm install
npm run dev
```

Admin: buka `/admin/login`
