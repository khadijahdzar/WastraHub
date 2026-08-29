# WastraHub Backend (Laravel 12 + Sanctum)

API e-commerce batik untuk frontend React (Vite) WastraHub.

## Persyaratan

- PHP 8.2+
- Composer
- MySQL 8 (atau MariaDB)
- Node (opsional, hanya jika build asset)

## Setup cepat

```bash
# 1. Extract
unzip wastrahub-backend-fixed.zip
cd backend

# 2. Install dependency (kalau vendor belum ada)
composer install

# 3. Environment
cp .env.example .env
php artisan key:generate

# 4. Edit .env — sesuaikan database
# DB_DATABASE=wastrahub
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Buat database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS wastrahub;"

# 6. Migrate + seed
php artisan migrate --seed

# 7. Jalankan server
php artisan serve
# → http://localhost:8000
```

## Akun demo

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@wastrahub.com     | admin123  |
| Admin | admin@batikartisan.com  | admin123  |
| User  | user@wastrahub.com      | user123   |

## Endpoint penting

### Public
- `GET  /api/products`
- `GET  /api/products/{id}`
- `GET  /api/categories`
- `GET  /api/regions`
- `POST /api/register`
- `POST /api/login`
- `POST /api/ai/chat` (WastraChat)

### User (Bearer token)
- `GET  /api/user`
- `POST /api/logout`
- `GET  /api/cart` | `POST /api/cart/add` | `DELETE /api/cart/item/{id}`
- `GET  /api/orders` | `POST /api/orders/checkout` | `GET /api/orders/{id}`
- `POST /api/reviews`

### Admin (Bearer + role admin)
- `GET  /api/admin/dashboard`
- `GET|POST|PUT|DELETE /api/admin/products`
- `GET  /api/admin/orders` | `PATCH /api/admin/orders/{id}/status`
- `GET  /api/admin/customers`
- `GET  /api/admin/reviews`
- `GET  /api/admin/reports`

## Sambungkan ke Frontend

Di project frontend (Vite):

```env
# .env
VITE_API_URL=http://localhost:8000/api
```

Contoh axios interceptor (Bearer):

```js
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Login response shape:

```json
{
  "user": { "id": 1, "name": "...", "email": "...", "role": "admin|user" },
  "token": "1|xxxxxxxx"
}
```

Simpan `token` ke localStorage, lalu setiap request pakai header di atas.

## CORS & Sanctum

Sudah dikonfigurasi untuk `http://localhost:5173` dan `http://127.0.0.1:5173`.
Kalau frontend jalan di port lain, tambahkan di:

- `config/cors.php` → `allowed_origins`
- `.env` → `SANCTUM_STATEFUL_DOMAINS`

## WastraChat (Gemini)

Isi `GEMINI_API_KEY` di `.env` supaya endpoint `/api/ai/chat` hidup.
Tanpa key, endpoint akan error (silakan handle di frontend).

## Catatan perbaikan di versi ini

- Route `POST /api/orders/checkout` sekarang match method `checkout`
- Admin Product CRUD lengkap (`Admin\ProductController`)
- Relasi Order: `details()` + `orderDetails()` (kompatibel user & admin)
- Category CRUD hanya untuk admin
- Public products hanya menampilkan status `active` + filter opsional
- Seeder: admin@wastrahub.com / admin123 (+ alias batikartisan)
- AdminMiddleware null-safe
- `.env` dibersihkan (API key tidak ikut di-commit)
