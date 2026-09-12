<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Product;

class AiChatController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role' => ['required', 'string', 'in:user,model'],
            'messages.*.text' => ['required', 'string', 'min:1', 'max:4000'],
        ]);

        $apiKey = (string) config('services.gemini.key');
        $model = (string) (config('services.gemini.model') ?: 'gemini-2.0-flash');

        if ($apiKey === '') {
            return response()->json([
                'message' => 'Fitur AI belum dikonfigurasi di server.',
            ], 503);
        }

        $contents = collect($data['messages'])->map(fn (array $message) => [
            'role' => $message['role'],
            'parts' => [['text' => $message['text']]],
        ])->values()->all();

        $catalog = Product::with(['category', 'region'])
            ->where('status', 'active')
            ->latest()
            ->limit(40)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'category' => $product->category?->name,
                'region' => $product->region?->name,
            ]);
        $catalogText = $catalog->map(fn (array $product) => sprintf(
            '- ID %s | %s | %s | %s',
            $product['id'],
            $product['name'],
            $product['category'] ?: 'Batik',
            $product['region'] ?: 'Indonesia'
        ))->implode("\n");

        try {
            $http = Http::timeout(30)
                ->acceptJson()
                ->withQueryParameters(['key' => $apiKey]);
            $caBundle = config('services.gemini.ca_bundle');
            if (is_string($caBundle) && $caBundle !== '' && is_file($caBundle)) {
                $http = $http->withOptions(['verify' => $caBundle]);
            }
            $response = $http->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent",
                    [
                        'system_instruction' => [
                            'parts' => [[
                                'text' => "Kamu adalah WastraChat, asisten WastraHub. Jawab dalam bahasa pengguna, bantu tentang batik, wastra Nusantara, produk, pesanan, dan belanja. Jangan mengarang status pesanan atau data akun. Jangan gunakan markdown, tanda bintang, atau format **tebal** dalam jawaban. Jika merekomendasikan produk, hanya gunakan produk dari katalog berikut dan tulis nama produk persis seperti katalog agar bisa ditautkan oleh aplikasi:\n{$catalogText}",
                            ]],
                        ],
                        'contents' => $contents,
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'maxOutputTokens' => 800,
                        ],
                    ]
                );
        } catch (ConnectionException $exception) {
            $safeError = preg_replace('/([?&]key=)[^&\s]+/', '$1[redacted]', $exception->getMessage());
            Log::warning('Gemini connection failed', ['error' => $safeError]);
            return response()->json(['message' => 'Layanan AI sedang tidak dapat dihubungi.'], 502);
        }

        if ($response->status() === 400 || $response->status() === 401 || $response->status() === 403) {
            Log::error('Gemini authentication or request error', ['status' => $response->status()]);
            return response()->json(['message' => 'Konfigurasi API AI tidak valid.'], 502);
        }

        if ($response->status() === 429) {
            return response()->json(['message' => 'Batas penggunaan AI tercapai. Coba lagi sebentar.'], 429);
        }

        if ($response->status() === 404) {
            Log::error('Gemini model not found', ['model' => $model]);
            return response()->json(['message' => 'Model AI tidak tersedia. Periksa GEMINI_MODEL di server.'], 502);
        }

        if ($response->failed()) {
            Log::error('Gemini provider error', ['status' => $response->status()]);
            return response()->json(['message' => 'Layanan AI sedang mengalami gangguan.'], 502);
        }

        $text = $response->json('candidates.0.content.parts.0.text');
        if (!is_string($text) || trim($text) === '') {
            return response()->json(['message' => 'AI tidak memberikan jawaban.'], 502);
        }

        $mentionedProducts = $catalog->filter(
            fn (array $product) => str_contains(mb_strtolower($text), mb_strtolower($product['name']))
        )->values()->all();

        return response()->json([
            'message' => trim($text),
            'products' => $mentionedProducts,
        ]);
    }
}