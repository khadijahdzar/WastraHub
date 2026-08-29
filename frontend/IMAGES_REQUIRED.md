# Daftar Gambar yang Diperlukan — WastraHub

Semua path relatif terhadap folder `public/` atau bisa juga diletakkan di `src/assets/images/` lalu di-import.

Saat ini aplikasi menggunakan path `/images/...` (dari folder `public/images/`).

## Struktur Folder yang Disarankan

```
public/
  images/
    hero/
    products/
    regions/
    categories/
    logos/
    patterns/
    icons/
```

---

## Tabel Gambar

| Nama File | Lokasi | Deskripsi |
|-----------|--------|-----------|
| hero-batik.jpg | public/images/hero/ | Model / kain batik premium untuk hero homepage (portrait, ratio ~4:5) |
| parang-tulis-1.jpg | public/images/products/ | Produk Batik Parang Tulis Premium (gambar utama) |
| parang-tulis-2.jpg | public/images/products/ | Produk Batik Parang Tulis — detail motif |
| parang-tulis-3.jpg | public/images/products/ | Produk Batik Parang Tulis — flat lay |
| kawung-cap-1.jpg | public/images/products/ | Produk Batik Kawung Cap Elegan |
| kawung-cap-2.jpg | public/images/products/ | Produk Batik Kawung Cap — detail |
| truntum-1.jpg | public/images/products/ | Produk Batik Truntum Kombinasi |
| truntum-2.jpg | public/images/products/ | Produk Batik Truntum — detail |
| sido-luhur-1.jpg | public/images/products/ | Produk Batik Sido Luhur Printing |
| mega-mendung-1.jpg | public/images/products/ | Produk Batik Mega Mendung Cirebon |
| mega-mendung-2.jpg | public/images/products/ | Produk Batik Mega Mendung — detail |
| lasem-1.jpg | public/images/products/ | Produk Batik Lasem Tulis |
| madura-1.jpg | public/images/products/ | Produk Batik Madura Warna Cerah |
| bakaran-1.jpg | public/images/products/ | Produk Batik Bakaran Tulis |
| placeholder.jpg | public/images/products/ | Placeholder generik jika gambar produk belum ada |
| pekalongan.jpg | public/images/regions/ | Foto / motif khas Pekalongan (untuk region card & pill) |
| lasem.jpg | public/images/regions/ | Foto / motif khas Lasem |
| bakaran.jpg | public/images/regions/ | Foto / motif khas Bakaran |
| yogyakarta.jpg | public/images/regions/ | Foto / motif khas Yogyakarta |
| solo.jpg | public/images/regions/ | Foto / motif khas Solo |
| cirebon.jpg | public/images/regions/ | Foto / motif khas Cirebon |
| madura.jpg | public/images/regions/ | Foto / motif khas Madura |
| placeholder.jpg | public/images/regions/ | Placeholder region |
| tulis.jpg | public/images/categories/ | Representasi kategori Batik Tulis |
| cap.jpg | public/images/categories/ | Representasi kategori Batik Cap |
| kombinasi.jpg | public/images/categories/ | Representasi kategori Batik Kombinasi |
| printing.jpg | public/images/categories/ | Representasi kategori Batik Printing |
| placeholder.jpg | public/images/categories/ | Placeholder kategori |
| logo.png | public/images/logos/ | Logo WastraHub (opsional, saat ini text-based) |
| hero-pattern.png | public/images/patterns/ | Motif batik transparan / pattern background (opsional) |

---

## Catatan

- Format disarankan: JPG/WebP untuk foto, PNG untuk logo & pattern.
- Resolusi minimum produk: 800×1000 px (portrait).
- Region pill: gambar persegi / lingkaran, minimal 200×200 px.
- Hero: minimal 1000×1250 px.
- Jangan gunakan URL eksternal; semua harus lokal.

Setelah gambar diletakkan di folder `public/images/...`, aplikasi akan menampilkannya otomatis.
