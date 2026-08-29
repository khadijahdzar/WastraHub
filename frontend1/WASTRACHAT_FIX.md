# WastraChat — perbaikan error Gemini

Error terakhir: route OK, tapi Gemini gagal → cek log:

```bash
cd c:\xampp\htdocs\WastraHub\backend
powershell -Command "Get-Content storage\logs\laravel.log -Tail 50"
```

## AIService.php — pastikan pakai header (bukan ?key=)

```php
$url = "{$this->baseUrl}/models/{$this->model}:generateContent";

$response = Http::timeout(30)
    ->withHeaders([
        'Content-Type'   => 'application/json',
        'x-goog-api-key' => $this->apiKey,
    ])
    ->post($url, $payload);
```

## .env

```env
GEMINI_API_KEY=AQ....
GEMINI_MODEL=gemini-2.0-flash
# Jika model tidak tersedia, coba:
# GEMINI_MODEL=gemini-2.0-flash-001
# GEMINI_MODEL=gemini-1.5-flash
```

## MySQL harus nyala (XAMPP) jika CACHE_STORE=database

Atau sementara:

```env
CACHE_STORE=file
```

Lalu `php artisan config:clear`.

## System prompt — tambahkan pengetahuan Bakaran

Di `getSystemPrompt()` tambahkan:

- Batik Bakaran berasal dari Desa Bakaran, Juwana, Kabupaten Pati, Jawa Tengah
- Motif khas: Gandrung, Padas Gempal, Magel Ati, Mina Tani, Kedelai Kecer, Manggaran, Sidomukti, Merak Ngigel, Pring Sedapur, Rujak Sente, Ungker Cantel, Udan Liris, Bregrat Ireng
