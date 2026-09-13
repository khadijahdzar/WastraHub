import { useState } from "react";
import { Bot, LoaderCircle, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { sendAiMessage } from "../../services/aiService";
import "./wastra-chat.css";

const initialMessage = {
  role: "model",
  text: "Halo, saya WastraChat. Saya bisa membantu tentang batik, produk, dan belanja di WastraHub.",
  products: [],
};

const fallbackProductsDatabase = [
  { id: 1, name: "Batik Tulis Mega Mendung Eksklusif", category: "Kain Batik", price: 350000 },
  { id: 2, name: "Kemeja Batik Pria Parang Sido Luhur", category: "Pakaian Pria", price: 225000 },
  { id: 3, name: "Blouse Batik Wanita Sekar Jagad", category: "Pakaian Wanita", price: 185000 },
];

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function renderText(text) {
  return text.split(/\n+/).filter(Boolean).map((line, index) => (
    <span key={`${line}-${index}`}>{line.replace(/^\s*[*#-]+\s*/, "").replace(/\*+/g, "")}<br /></span>
  ));
}

export default function WastraChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      let answer = null;
      
      try {
        answer = await sendAiMessage(nextMessages.slice(-20));
      } catch (backendErr) {
        console.warn("Backend AI service error, switching to smart fallback mode:", backendErr);
      }

      if (!answer || !answer.message) {
        const lower = text.toLowerCase();
        let fallbackText = "";
        let recommendedProducts = [];

        const isGreeting = ["halo", "hai", "p", "hei", "hallo", "selamat"].some(g => lower === g || lower.startsWith(g + " "));

        if (isGreeting) {
          fallbackText = "Halo juga, bro! Ada yang bisa kubantu seputar koleksi batik WastraHub hari ini?";
          recommendedProducts = [];
        } else if (lower.includes("kondangan") || lower.includes("acara") || lower.includes("pesta")) {
          fallbackText = "Untuk acara formal atau kondangan, motif klasik dengan sentuhan elegan pas banget buat kamu. Ini rekomendasinya:";
          recommendedProducts = [fallbackProductsDatabase[0], fallbackProductsDatabase[1]];
        } else if (lower.includes("casual") || lower.includes("santai") || lower.includes("kerja") || lower.includes("rekomendasi")) {
          fallbackText = "Tentu, ini beberapa pilihan koleksi batik favorit yang cocok buat kamu:";
          recommendedProducts = fallbackProductsDatabase;
        } else {
          fallbackText = `WastraHub punya banyak pilihan batik berkualitas tinggi. Kamu bisa cek menu Katalog atau tanyakan jenis batik yang kamu cari ya!`;
          recommendedProducts = [fallbackProductsDatabase[0]];
        }

        answer = {
          message: fallbackText,
          products: recommendedProducts
        };
      }

      setMessages((current) => [...current, { role: "model", text: answer.message, products: answer.products || [] }]);
    } catch (requestError) {
      setError("Gagal memproses pesan. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([initialMessage]);
    setError("");
    setInput("");
  };

  return (
    <div className="wastra-chat fixed bottom-4 right-4 z-50">
      {open && (
        <section 
          className="wastra-chat__panel fixed bottom-20 right-4 left-4 sm:left-auto sm:right-4 w-auto sm:w-[380px] max-w-[95vw] h-[480px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-amber-100 flex flex-col overflow-hidden transition-all duration-300 z-50" 
          aria-label="WastraChat"
        >
          <header className="wastra-chat__header bg-amber-900 text-white p-4 flex items-center justify-between shrink-0">
            <div>
              <strong className="block font-semibold">WastraChat</strong>
              <span className="text-xs text-amber-200">Asisten batik WastraHub</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Tutup chat" className="text-amber-200 hover:text-white p-1 rounded-lg">
              <X size={18} />
            </button>
          </header>

          <div className="wastra-chat__messages flex-1 p-4 overflow-y-auto space-y-3 bg-amber-50/30 text-sm" aria-live="polite">
            {messages.map((message, index) => (
              <div 
                key={`${message.role}-${index}`} 
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <p className={`wastra-chat__message wastra-chat__message--${message.role} max-w-[85%] p-3 rounded-xl ${
                  message.role === "user" 
                    ? "bg-amber-800 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border border-amber-100 rounded-tl-none shadow-sm"
                }`}>
                  {renderText(message.text)}
                </p>
                {message.products?.length > 0 && (
                  <div className="wastra-chat__products mt-2 space-y-1.5 w-full">
                    {message.products.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`} 
                        className="wastra-chat__product block bg-amber-50 hover:bg-amber-100 border border-amber-200 p-2 rounded-lg transition-colors" 
                        onClick={() => setOpen(false)}
                      >
                        <span className="wastra-chat__product-name block font-medium text-amber-900 text-xs">{product.name}</span>
                        <span className="wastra-chat__product-meta block text-[11px] text-gray-600">{product.category || "Batik"} · {formatPrice(product.price)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="wastra-chat__loading flex items-center gap-2 text-xs text-amber-800"><LoaderCircle size={16} className="animate-spin" /> Sedang mengetik...</p>}
            {error && <p className="wastra-chat__error text-xs text-red-600">{error}</p>}
          </div>

          <form className="wastra-chat__form p-3 bg-white border-t border-amber-100 flex items-center space-x-2 shrink-0" onSubmit={submit}>
            <input 
              value={input} 
              onChange={(event) => setInput(event.target.value)} 
              placeholder="Tulis pertanyaan..." 
              maxLength={4000} 
              disabled={loading} 
              className="flex-1 bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
            <button 
              type="submit" 
              className="wastra-chat__send bg-amber-800 hover:bg-amber-900 text-white p-2.5 rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-50" 
              disabled={loading || !input.trim()} 
              aria-label="Kirim pesan" 
              title="Kirim pesan"
            >
              <Send size={18} />
            </button>
          </form>

          <button 
            type="button" 
            className="wastra-chat__reset py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium border-t border-gray-200 shrink-0 transition-colors" 
            onClick={reset}
          >
            Mulai percakapan baru
          </button>
        </section>
      )}

      <button
        type="button"
        className={`wastra-chat__toggle bg-amber-800 hover:bg-amber-900 text-white p-3.5 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${open ? "wastra-chat__toggle--open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Tutup WastraChat" : "Buka WastraChat"}
        title={open ? "Tutup WastraChat" : "Buka WastraChat"}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>
    </div>
  );
}