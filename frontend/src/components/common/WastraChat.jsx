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
      const answer = await sendAiMessage(nextMessages.slice(-20));
      setMessages((current) => [...current, { role: "model", text: answer.message, products: answer.products }]);
    } catch (requestError) {
      setError(requestError.message);
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
    <div className="wastra-chat">
      {open && (
        <section className="wastra-chat__panel" aria-label="WastraChat">
          <header className="wastra-chat__header">
            <div>
              <strong>WastraChat</strong>
              <span>Asisten batik WastraHub</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Tutup chat">
              <X size={18} />
            </button>
          </header>
          <div className="wastra-chat__messages" aria-live="polite">
            {messages.map((message, index) => (
              <p key={`${message.role}-${index}`} className={`wastra-chat__message wastra-chat__message--${message.role}`}>
                {renderText(message.text)}
                {message.products?.length > 0 && (
                  <div className="wastra-chat__products">
                    {message.products.map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="wastra-chat__product" onClick={() => setOpen(false)}>
                        <span className="wastra-chat__product-name">{product.name}</span>
                        <span className="wastra-chat__product-meta">{product.category || "Batik"} · {formatPrice(product.price)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </p>
            ))}
            {loading && <p className="wastra-chat__loading"><LoaderCircle size={16} /> Sedang mengetik...</p>}
            {error && <p className="wastra-chat__error">{error}</p>}
          </div>
          <form className="wastra-chat__form" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaan..." maxLength={4000} disabled={loading} />
            <button type="submit" className="wastra-chat__send" disabled={loading || !input.trim()} aria-label="Kirim pesan" title="Kirim pesan"><Send size={18} /></button>
          </form>
          <button type="button" className="wastra-chat__reset" onClick={reset}>Mulai percakapan baru</button>
        </section>
      )}
      <button
        type="button"
        className={`wastra-chat__toggle ${open ? "wastra-chat__toggle--open" : ""}`}
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