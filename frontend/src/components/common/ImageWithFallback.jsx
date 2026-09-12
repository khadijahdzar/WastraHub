import { useState, useEffect } from "react";

const PLACEHOLDER_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect fill="#F3E9DC" width="400" height="500"/>
  <g fill="none" stroke="#BB9457" stroke-width="1.2" opacity="0.35">
    <circle cx="200" cy="180" r="48"/>
    <circle cx="200" cy="180" r="28"/>
    <path d="M152 180 h96 M200 132 v96"/>
    <path d="M120 280 Q200 240 280 280 Q200 320 120 280"/>
    <path d="M100 360 Q200 320 300 360"/>
    <path d="M80 420 Q200 380 320 420"/>
  </g>
  <text x="200" y="470" text-anchor="middle" fill="#6B5E54" font-family="system-ui,sans-serif" font-size="13" opacity="0.7">WastraHub</text>
</svg>
`);

export default function ImageWithFallback({
  src,
  alt = "",
  className = "",
  style,
  fallback = PLACEHOLDER_SVG,
  loading = "lazy",
  ...rest
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  // Sync state jika prop src atau fallback berubah
  useEffect(() => {
    setCurrentSrc(src || fallback);
    setHasError(false);
  }, [src, fallback]);

  const handleError = () => {
    // Cegah infinite loop jika fallback image juga gagal dimuat
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallback || PLACEHOLDER_SVG);
    } else if (currentSrc !== PLACEHOLDER_SVG) {
      // Jika fallback lokal juga gagal, paksa gunakan Inline SVG
      setCurrentSrc(PLACEHOLDER_SVG);
    }
  };

  return (
    <img
      src={currentSrc || PLACEHOLDER_SVG}
      alt={alt ?? "WastraHub Product"}
      className={className}
      style={style}
      loading={loading}
      onError={handleError}
      {...rest}
    />
  );
}

export { PLACEHOLDER_SVG };