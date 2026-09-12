/**
 * Cetak struk TANPA window.open (anti popup blocker).
 * Metode: iframe tersembunyi → contentWindow.print()
 */

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

function buildLabelHtml(order) {
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
  const customer =
    order.customer_name || order.name || order.customer || "—";
  const address = order.address || order.shipping_address || "—";
  const phone = order.phone || "—";
  const payment = order.payment_method || order.paymentMethod || "—";
  const courier = order.courier || "—";
  const total = order.total || order.total_amount || 0;

  const rows = items
    .map((it) => {
      const qty = it.qty || it.quantity || 1;
      const price = Number(it.price) || 0;
      const name = it.name || it.product_name || "Batik";
      const region = it.region ? ` · ${it.region}` : "";
      const note = it.note ? `<br/><em>${it.note}</em>` : "";
      return `<tr>
        <td>${name}${region}${note}</td>
        <td style="text-align:center">${qty}</td>
        <td style="text-align:right">${formatRupiah(price)}</td>
        <td style="text-align:right">${formatRupiah(price * qty)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<title>Struk ${orderId}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, sans-serif;
    color: #1a1a1a;
    margin: 0;
    padding: 20px;
    background: #fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .sheet {
    max-width: 800px;
    margin: 0 auto;
    border: 2px solid #432818;
    padding: 24px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 2px solid #432818;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .brand { font-size: 22px; font-weight: 800; color: #432818; margin: 0; }
  .tag { font-size: 11px; color: #6b5e54; margin: 4px 0 0; }
  .meta { text-align: right; font-size: 13px; line-height: 1.5; }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .grid h4 {
    margin: 0 0 6px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #795830;
  }
  .grid p { margin: 0; font-size: 13px; line-height: 1.55; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
  th, td { border: 1px solid #d2c4bc; padding: 8px 10px; text-align: left; }
  th {
    background: #f3e9dc !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .total strong { display: block; font-size: 18px; color: #432818; }
  .thanks {
    font-size: 11px;
    color: #6b5e54;
    text-align: center;
    border-top: 1px dashed #d2c4bc;
    padding-top: 12px;
    margin: 0;
  }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div>
        <p class="brand">WastraHub</p>
        <p class="tag">Marketplace Batik Nusantara</p>
      </div>
      <div class="meta">
        <div><strong>No. Order</strong><br/>${orderId}</div>
        <div style="margin-top:8px"><strong>Tanggal</strong><br/>${date}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <h4>Pengirim</h4>
        <p>
          <strong>WastraHub</strong><br/>
          Jl. Kebudayaan No. 12, Jakarta Selatan<br/>
          Telp: +62 812 3456 7890<br/>
          hello@wastrahub.id
        </p>
      </div>
      <div>
        <h4>Penerima</h4>
        <p>
          <strong>${customer}</strong><br/>
          ${address}<br/>
          ${order.city || ""} ${order.postal || ""}<br/>
          Telp: ${phone}
        </p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Produk</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Harga</th>
          <th style="text-align:right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="4">—</td></tr>'}
      </tbody>
    </table>
    <div class="foot">
      <div>
        <p><strong>Pembayaran:</strong> ${payment}</p>
        <p><strong>Kurir:</strong> ${courier}</p>
      </div>
      <div class="total">
        <span>Total</span>
        <strong>${formatRupiah(total)}</strong>
      </div>
    </div>
    <p class="thanks">
      Terima kasih telah berbelanja di WastraHub. Lestarikan wastra, bangga berbudaya.
    </p>
  </div>
</body>
</html>`;
}

export function printShippingLabel(order) {
  if (!order) return;

  const html = buildLabelHtml(order);
  const old = document.getElementById("wastrahub-print-frame");
  if (old) old.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "wastrahub-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const doPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error("[print]", e);
    }
    setTimeout(() => {
      try {
        iframe.remove();
      } catch {}
    }, 1000);
  };

  if (iframe.contentWindow?.document?.readyState === "complete") {
    setTimeout(doPrint, 200);
  } else {
    iframe.onload = () => setTimeout(doPrint, 200);
  }
}

export default printShippingLabel;