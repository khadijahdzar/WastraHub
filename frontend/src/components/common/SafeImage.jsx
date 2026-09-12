import { useState } from "react";

const DEFAULT_PLACEHOLDER = "/images/products/placeholder.jpg";

/**
 * Image dengan fallback otomatis jika URL broken / null.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  placeholder = DEFAULT_PLACEHOLDER,
  ...rest
}) {
  const [current, setCurrent] = useState(src || placeholder);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setCurrent(placeholder);
    }
  };

  return (
    <img
      src={current || placeholder}
      alt={alt}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}