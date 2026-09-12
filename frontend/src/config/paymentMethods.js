export const EWALLETS = [
  { id: "dana", name: "DANA", color: "#118EE9", logo: "/images/payment/dana.png" },
  { id: "gopay", name: "GoPay", color: "#00AED6", logo: "/images/payment/gopay.png" },
  { id: "ovo", name: "OVO", color: "#4C3494", logo: "/images/payment/ovo.jpg" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D", logo: "/images/payment/shopeepay.png" },
  { id: "brimo", name: "BRImo", color: "#0057A0", logo: "/images/payment/brimo.jpg" },
];

export const BANKS = [
  { id: "bca", name: "BCA", color: "#0060AF", logo: "/images/payment/bca.png", account: "1234567890" },
  { id: "bni", name: "BNI", color: "#F15A22", logo: "/images/payment/bni.png", account: "0987654321" },
  { id: "mandiri", name: "Mandiri", color: "#003D79", logo: "/images/payment/mandiri.png", account: "1122334455" },
  { id: "bri", name: "BRI", color: "#0057A0", logo: "/images/payment/bri.png", account: "5566778899" },
  { id: "cimb", name: "CIMB Niaga", color: "#EE1C25", logo: "/images/payment/cimbniaga.png", account: "6677889900" },
];

export const PAYMENT_OPTIONS = [
  { id: "transfer", name: "Transfer Bank", type: "transfer" },
  { id: "ewallet", name: "E-Wallet", type: "ewallet" },
  { id: "cod", name: "Bayar di Tempat (COD)", type: "cod" },
];
