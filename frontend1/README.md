# WastraHub Frontend

Marketplace batik Indonesia + media edukasi wastra Nusantara.

## Tech Stack

- React 19 + Vite
- React Router DOM
- Axios (siap integrasi Laravel REST API)
- CSS Murni (tanpa Tailwind / Bootstrap / UI library)
- Lucide React (icons)
- Font: Poppins

## Menjalankan

```bash
cd frontend
npm install
npm run dev
```

## Struktur

```
src/
  api/           # Axios instance
  assets/
  components/
    card/        # ProductCard, RegionCard
    common/      # Button, Badge, SectionTitle
    layout/      # Navbar, Footer
  context/       # AuthContext, CartContext
  data/          # Dummy products, categories, regions
  layouts/       # MainLayout
  pages/         # Semua halaman
  services/      # productService, authService (siap API)
  styles/        # global.css, variables.css
```

## Halaman

- `/` Home
- `/collections` Collections (filter, search, sort)
- `/product/:id` Detail produk
- `/categories` Grid kategori
- `/regions` Grid daerah
- `/search?q=` Hasil pencarian
- `/cart` Keranjang
- `/checkout` Checkout (protected)
- `/login` `/register`
- `/profile` `/orders` (protected)
- `/about` Tentang Batik

## Integrasi Backend

Ganti implementasi di `src/services/*` dan gunakan `src/api/axios.js`.
Base URL: `VITE_API_URL` (default `http://localhost:8000/api`).

## Gambar

Lihat `IMAGES_REQUIRED.md` untuk daftar lengkap file gambar yang perlu disiapkan.
