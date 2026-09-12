export function Skeleton({ className = "", style, ...rest }) {
  return <div className={`skeleton ${className}`} style={style} {...rest} />;
}

export function ProductDetailSkeleton() {
  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 40,
        }}
      >
        <Skeleton className="skeleton--img" />
        <div>
          <Skeleton className="skeleton--title" />
          <Skeleton className="skeleton--text" style={{ width: "40%" }} />
          <Skeleton className="skeleton--text" style={{ width: "30%", marginTop: 16 }} />
          <Skeleton className="skeleton--text" style={{ width: "90%", marginTop: 24 }} />
          <Skeleton className="skeleton--text" style={{ width: "80%" }} />
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Skeleton className="skeleton--btn" />
            <Skeleton className="skeleton--btn" style={{ width: 120 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 24,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="skeleton--img" />
          <Skeleton className="skeleton--text" style={{ width: "70%", marginTop: 12 }} />
          <Skeleton className="skeleton--text" style={{ width: "40%" }} />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;