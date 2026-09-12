import { useEffect, useState } from "react";
import { X, Building2, Copy, Check, WalletCards, Banknote } from "lucide-react";
import { BANKS, EWALLETS, PAYMENT_OPTIONS } from "../../config/paymentMethods";
import "./payment-modal.css";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export default function PaymentInstructionModal({
  open,
  order,
  onClose,
  onConfirm,
  loading = false,
}) {
  const [method, setMethod] = useState("transfer");
  const [bank, setBank] = useState("bca");
  const [ewallet, setEwallet] = useState("dana");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod("transfer");
    setBank("bca");
    setEwallet("dana");
    setCopied(false);
  }, [open, order?.id]);

  if (!open || !order) return null;

  const selectedBank = BANKS.find((item) => item.id === bank) || BANKS[0];
  const selectedEwallet = EWALLETS.find((item) => item.id === ewallet) || EWALLETS[0];
  const total = order.total ?? order.total_amount ?? 0;
  const code = order.code || order.order_number || order.id;

  const copyAccount = async () => {
    if (method !== "transfer") return;
    try {
      await navigator.clipboard.writeText(selectedBank.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="pay-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="pay-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-modal-title"
      >
        <div className="pay-modal__head">
          <div>
            <h2 id="pay-modal-title">Instruksi Pembayaran</h2>
            <p className="pay-modal__sub">
              Pesanan <strong>{code}</strong>
            </p>
          </div>
          <button type="button" className="pay-modal__close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="pay-modal__total">
          <span>Total Pembayaran</span>
          <strong>{formatRupiah(total)}</strong>
        </div>

        <p className="pay-modal__label">Pilih metode pembayaran</p>
        <div className="pay-modal__methods">
          {PAYMENT_OPTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`pay-modal__method ${method === m.id ? "is-active" : ""}`}
              onClick={() => setMethod(m.id)}
            >
              {m.type === "transfer" ? <Building2 size={18} /> : m.type === "ewallet" ? <WalletCards size={18} /> : <Banknote size={18} />}
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        <div className="pay-modal__box">
          {method === "transfer" ? (
            <div className="pay-modal__bank">
              <div className="pay-modal__submethods">
                {BANKS.map((item) => (
                  <button key={item.id} type="button" className={bank === item.id ? "is-active" : ""} onClick={() => setBank(item.id)}>
                    <span className="pay-modal__logo" style={{ background: item.color }}>
                      <img src={item.logo} alt="" />
                    </span>{item.name}
                  </button>
                ))}
              </div>
              <div className="pay-modal__selected-provider">
                <img src={selectedBank.logo} alt="" />
                <p className="pay-modal__bank-name">Transfer Bank {selectedBank.name}</p>
              </div>
              <p className="pay-modal__account">
                <span>{selectedBank.account}</span>
                <button type="button" onClick={copyAccount} className="pay-modal__copy">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
              </p>
              <p className="pay-modal__holder">a.n. PT WastraHub Indonesia</p>
              <p className="pay-modal__hint">
                Transfer tepat sesuai nominal. Setelah transfer, klik konfirmasi di bawah
                (simulasi gateway).
              </p>
            </div>
          ) : method === "ewallet" ? (
            <div className="pay-modal__bank">
              <div className="pay-modal__submethods">
                {EWALLETS.map((item) => (
                  <button key={item.id} type="button" className={ewallet === item.id ? "is-active" : ""} onClick={() => setEwallet(item.id)}>
                    <span className="pay-modal__logo" style={{ background: item.color }}>
                      <img src={item.logo} alt="" />
                    </span>{item.name}
                  </button>
                ))}
              </div>
              <div className="pay-modal__selected-provider">
                <img src={selectedEwallet.logo} alt="" />
                <p className="pay-modal__bank-name">{selectedEwallet.name}</p>
              </div>
              <p className="pay-modal__hint">Buka aplikasi {selectedEwallet.name} untuk menyelesaikan pembayaran (simulasi gateway).</p>
            </div>
          ) : (
            <div className="pay-modal__bank">
              <p className="pay-modal__bank-name">Bayar di Tempat (COD)</p>
              <p className="pay-modal__hint">Pembayaran dilakukan saat pesanan diterima.</p>
            </div>
          )}
        </div>

        <div className="pay-modal__actions">
          <button type="button" className="pay-modal__btn pay-modal__btn--ghost" onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button
            type="button"
            className="pay-modal__btn pay-modal__btn--primary"
            onClick={() => onConfirm?.(method === "transfer" ? `transfer_${bank}` : method === "ewallet" ? `ewallet_${ewallet}` : "cod")}
            disabled={loading}
          >
            Konfirmasi Pembayaran / Saya Sudah Bayar
          </button>
        </div>
      </div>
    </div>
  );
}