import { forwardRef } from "react";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/**
 * Layout siap cetak — dipakai bersama window.print()
 * Class .print-only / .no-print diatur di admin.css @media print
 */
const PrintableShippingLabel = forwardRef(function PrintableShippingLabel(
  { order },
  ref
) {
  if (!order) return null;

  const items = order.items || order.order_items || [];
  const orderId = order.id || order.code || order.order_number || "—";
  const date =
    order.date ||
    order.created_at ||
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div ref={ref} className="shipping-label print-only">
      <div className="shipping-label__sheet">
        <header className="shipping-label__head">
          <div>
            <img
              src="/images/logos/wastrahub-logo-nav.png"
              alt="WastraHub"
              className="shipping-label__logo"
            />
            <p className="shipping-label__brand">WastraHub</p>
            <p className="shipping-label__tag">Marketplace Batik Nusantara</p>
          </div>
          <div className="shipping-label__meta">
            <p>
              <strong>No. Order</strong>
              <br />
              {orderId}
            </p>
            <p>
              <strong>Tanggal</strong>
              <br />
              {date}
            </p>
          </div>
        </header>

        <div className="shipping-label__grid">
          <section>
            <h4>Pengirim</h4>
            <p>
              <strong>WastraHub</strong>
              <br />
              Jl. Kebudayaan No. 12, Jakarta Selatan
              <br />
              Telp: +62 812 3456 7890
              <br />
              hello@wastrahub.id
            </p>
          </section>
          <section>
            <h4>Penerima</h4>
            <p>
              <strong>
                {order.customer_name || order.name || order.customer || "—"}
              </strong>
              <br />
              {order.address || order.shipping_address || "—"}
              <br />
              {order.city ? `${order.city}` : ""}
              {order.postal ? ` ${order.postal}` : ""}
              <br />
              Telp: {order.phone || "—"}
            </p>
          </section>
        </div>

        <table className="shipping-label__table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4}>—</td>
              </tr>
            )}
            {items.map((it, i) => {
              const qty = it.qty || it.quantity || 1;
              const price = Number(it.price) || 0;
              return (
                <tr key={i}>
                  <td>
                    {it.name || it.product_name || "Batik"}
                    {it.region ? ` · ${it.region}` : ""}
                    {it.note ? (
                      <>
                        <br />
                        <em>{it.note}</em>
                      </>
                    ) : null}
                  </td>
                  <td>{qty}</td>
                  <td>{formatRupiah(price)}</td>
                  <td>{formatRupiah(price * qty)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <footer className="shipping-label__foot">
          <div>
            <p>
              <strong>Pembayaran:</strong>{" "}
              {order.payment_method || order.paymentMethod || "—"}
            </p>
            <p>
              <strong>Kurir:</strong> {order.courier || "—"}
            </p>
          </div>
          <div className="shipping-label__total">
            <span>Total</span>
            <strong>
              {formatRupiah(order.total || order.total_amount || 0)}
            </strong>
          </div>
        </footer>

        <p className="shipping-label__thanks">
          Terima kasih telah berbelanja di WastraHub. Lestarikan wastra, bangga
          berbudaya.
        </p>
      </div>
    </div>
  );
});

export default PrintableShippingLabel;
