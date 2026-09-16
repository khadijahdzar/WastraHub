import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/card/ProductCard";
import {
  fetchProducts,
  fetchCategories,
  fetchRegions,
} from "../services/productService";
import { useLanguage } from "../context/LanguageContext";
import "./collections.css";

const TECHNIQUES = ["Tulis", "Cap", "Premium", "Modern"];

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const category = searchParams.get("category") || "";
  const region = searchParams.get("region") || "";
  const technique = searchParams.get("technique") || "";
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "featured";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catRes, regRes] = await Promise.all([
          fetchCategories().catch(() => ({ data: [] })),
          fetchRegions().catch(() => ({ data: [] })),
        ]);
        if (!cancelled) {
          setCategories(catRes.data || []);
          setRegions(regRes.data || []);
        }
      } catch (err) {
        console.warn("Gagal memuat filter metadata", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const params = { category, region, technique, search, sort };
        const res = await fetchProducts(params).catch(() => ({ data: [] }));
        if (cancelled) return;

        let list = res?.data || [];

        if (category) {
          const cat = category.toLowerCase().replace(/-/g, " ");
          list = list.filter((p) => {
            const name = (p.category || "").toLowerCase();
            const slug = name.replace(/\s+/g, "-");
            return name === cat || slug === category.toLowerCase() || name.includes(cat);
          });
        }
        if (region) {
          const r = region.toLowerCase();
          list = list.filter((p) => {
            const name = (p.region || "").toLowerCase();
            return name === r || name.replace(/\s+/g, "-") === r;
          });
        }
        if (technique) {
          const tech = technique.toLowerCase().replace(/^batik\s+/, "");
          list = list.filter((p) =>
            (p.technique || p.type || "").toLowerCase().replace(/^batik\s+/, "").includes(tech)
          );
        }
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.region?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q)
          );
        }
        if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
        else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
        else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
        else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setProducts(list);
      } catch (err) {
        console.error("Gagal fetch produk:", err);
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, region, technique, search, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = category || region || technique || search;

  return (
    <div className="collections">
      <div className="collections__header">
        <div className="container">
          <h1>{t("collections_title") || "Koleksi Wastra Nusantara"}</h1>
          <p>{t("section_regions_sub") || "Temukan kain tradisional pilihan."}</p>
        </div>
      </div>

      <div className="collections__body container">
        <button
          type="button"
          className="collections__filter-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          <SlidersHorizontal size={18} />
          {t("collections_filter") || "Filter"}
        </button>

        <aside className={`collections__sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="collections__sidebar-header">
            <h3>{t("collections_filter") || "Filter"}</h3>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup filter"
            >
              <X size={20} />
            </button>
          </div>

          <div className="collections__search">
            <Search size={16} />
            <input
              type="search"
              placeholder={t("collections_search") || "Cari..."}
              value={search}
              onChange={(e) => updateParam("q", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <h4>{t("collections_technique") || "Teknik"}</h4>
            {TECHNIQUES.map((tech) => (
              <label key={tech} className="filter-check">
                <input
                  type="checkbox"
                  checked={technique === tech}
                  onChange={() => updateParam("technique", technique === tech ? "" : tech)}
                />
                <span>Batik {tech}</span>
              </label>
            ))}
          </div>

          {regions && regions.length > 0 && (
            <div className="filter-group">
              <h4>{t("collections_region") || "Wilayah"}</h4>
              {regions.map((r) => (
                <label key={r.id} className="filter-check">
                  <input
                    type="checkbox"
                    checked={region === r.slug}
                    onChange={() => updateParam("region", region === r.slug ? "" : r.slug)}
                  />
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
          )}

          {categories && categories.length > 0 && (
            <div className="filter-group">
              <h4>{t("collections_category") || "Kategori"}</h4>
              {categories.map((c) => (
                <label key={c.id} className="filter-check">
                  <input
                    type="checkbox"
                    checked={category === c.slug}
                    onChange={() => updateParam("category", category === c.slug ? "" : c.slug)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          )}

          {hasFilters && (
            <button type="button" className="collections__clear" onClick={clearFilters}>
              {t("collections_reset") || "Reset Filter"}
            </button>
          )}
        </aside>

        {sidebarOpen && (
          <div className="collections__overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="collections__main">
          <div className="collections__toolbar">
            <span className="collections__count">
              {products.length} {t("collections_found") || "produk ditemukan"}
            </span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="collections__sort"
              aria-label="Urutkan produk"
            >
              <option value="featured">{t("section_featured") || "Unggulan"}</option>
              <option value="price-asc">{t("collections_sort_price_asc") || "Harga: Rendah ke Tinggi"}</option>
              <option value="price-desc">{t("collections_sort_price_desc") || "Harga: Tinggi ke Rendah"}</option>
              <option value="name">{t("collections_sort_name") || "Nama"}</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "40px" }}>Memuat produk...</p>
          ) : products.length === 0 ? (
            <div className="collections__empty">
              <p>{t("collections_empty") || "Produk tidak ditemukan."}</p>
              <button type="button" onClick={clearFilters}>
                {t("collections_reset") || "Reset Filter"}
              </button>
            </div>
          ) : (
            <div className="product-grid product-grid--collections">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}