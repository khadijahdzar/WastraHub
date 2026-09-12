import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setFade(false);
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setFade(true);
    }, 150);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "60vh",
        opacity: fade ? 1 : 0,
        transform: fade ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      {displayChildren}
    </div>
  );
}