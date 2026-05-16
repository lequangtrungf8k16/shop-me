import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search, SlidersHorizontal, Package } from "lucide-react";
import type { Product, Category } from "@/types/product.type";
import AddToCartButton from "@/_components/product/AddToCartButton";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getProducts(opts: {
  page: number; search: string; categoryId?: number;
  sortBy: string; sortOrder: string; minPrice?: number; maxPrice?: number;
}) {
  try {
    const params = new URLSearchParams({
      page: String(opts.page),
      limit: "12",
      sortBy: opts.sortBy,
      sortOrder: opts.sortOrder,
      ...(opts.search ? { search: opts.search } : {}),
      ...(opts.categoryId ? { categoryId: String(opts.categoryId) } : {}),
      ...(opts.minPrice ? { minPrice: String(opts.minPrice) } : {}),
      ...(opts.maxPrice ? { maxPrice: String(opts.maxPrice) } : {}),
    });
    const res = await fetch(`${API}/products?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as { products: Product[]; pagination: { total: number; totalPages: number; page: number } };
  } catch { return null; }
}

const FMT = (v: string | number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(v));

const SORT_OPTS = [
  { label: "Mới nhất", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Giá tăng", sortBy: "price", sortOrder: "asc" },
  { label: "Giá giảm", sortBy: "price", sortOrder: "desc" },
  { label: "Tên A-Z", sortBy: "name", sortOrder: "asc" },
];

export default async function ProductsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; sortBy?: string; sortOrder?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const sp = await props.searchParams;
  const page = Number(sp.page ?? "1");
  const search = sp.search ?? "";
  const categoryId = sp.category ? Number(sp.category) : undefined;
  const sortBy = sp.sortBy ?? "createdAt";
  const sortOrder = sp.sortOrder ?? "desc";
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ page, search, categoryId, sortBy, sortOrder, minPrice, maxPrice }),
  ]);

  const products = result?.products ?? [];
  const pagination = result?.pagination ?? { total: 0, totalPages: 0, page: 1 };

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { page: "1", search, sortBy, sortOrder, ...overrides };
    if (sp.category) params.set("category", sp.category);
    if (sp.minPrice) params.set("minPrice", sp.minPrice);
    if (sp.maxPrice) params.set("maxPrice", sp.maxPrice);
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    return `/products?${params}`;
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight size={13} />
        <span className="text-primary font-semibold">Tất cả sản phẩm</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar Filter */}
        <aside className="xl:w-56 shrink-0 space-y-5">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4">
            <h3 className="text-[13px] font-bold text-on-surface mb-3 uppercase">Danh mục</h3>
            <div className="space-y-1">
              <Link href={buildUrl({ category: undefined, page: "1" })}
                className={`block px-3 py-2 rounded-lg text-[13px] transition-colors ${!categoryId ? "bg-primary text-on-primary font-semibold" : "hover:bg-surface-container text-on-surface"}`}>
                Tất cả ({pagination.total})
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={buildUrl({ category: String(cat.id), page: "1" })}
                  className={`block px-3 py-2 rounded-lg text-[13px] transition-colors ${categoryId === cat.id ? "bg-primary text-on-primary font-semibold" : "hover:bg-surface-container text-on-surface"}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Search + Sort bar */}
          <form method="get" action="/products" className="flex flex-col sm:flex-row gap-3 mb-6">
            {categoryId && <input type="hidden" name="category" value={categoryId} />}
            {sp.minPrice && <input type="hidden" name="minPrice" value={sp.minPrice} />}
            {sp.maxPrice && <input type="hidden" name="maxPrice" value={sp.maxPrice} />}
            <input type="hidden" name="sortBy" value={sortBy} />
            <input type="hidden" name="sortOrder" value={sortOrder} />
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input name="search" defaultValue={search} placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-[13px] focus:outline-none focus:border-primary" />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-[13px] font-bold hover:opacity-90">
              Tìm
            </button>
          </form>

          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-on-surface-variant">
              {pagination.total} sản phẩm {search && <span>cho "<strong>{search}</strong>"</span>}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-on-surface-variant" />
              {SORT_OPTS.map((opt) => {
                const isActive = sortBy === opt.sortBy && sortOrder === opt.sortOrder;
                return (
                  <Link key={`${opt.sortBy}-${opt.sortOrder}`}
                    href={buildUrl({ sortBy: opt.sortBy, sortOrder: opt.sortOrder, page: "1" })}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hidden sm:block ${isActive ? "bg-primary text-on-primary" : "bg-surface-container border border-surface-variant text-on-surface hover:border-primary"}`}>
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest border border-surface-variant rounded-xl">
              <Package size={48} className="mx-auto mb-4 text-outline opacity-40" />
              <p className="text-[16px] font-semibold text-on-surface-variant">Không tìm thấy sản phẩm nào</p>
              {search && (
                <Link href="/products" className="mt-4 inline-block text-primary text-[13px] font-semibold hover:underline">
                  Xóa bộ lọc
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                  const discount = product.priceDiscount
                    ? Math.round(((Number(product.price) - Number(product.priceDiscount)) / Number(product.price)) * 100)
                    : 0;
                  return (
                    <div key={product.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl hover:border-primary hover:shadow-md transition-all group flex flex-col overflow-hidden relative">
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 z-10 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded">
                          -{discount}%
                        </span>
                      )}
                      <Link href={`/products/${product.slug}`} className="relative h-48 bg-white flex items-center justify-center overflow-hidden">
                        <Image src={product.thumbnail || "https://picsum.photos/400/400"} alt={product.name}
                          fill sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-3 group-hover:-translate-y-1 transition-transform duration-300" />
                      </Link>
                      <div className="p-3 flex-1 flex flex-col border-t border-surface-variant">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-[13px] font-semibold text-on-surface mb-2 line-clamp-2 hover:text-primary">{product.name}</h3>
                        </Link>
                        <div className="mt-auto">
                          {product.priceDiscount ? (
                            <>
                              <p className="text-[11px] text-on-surface-variant line-through">{FMT(product.price)}</p>
                              <p className="text-[16px] font-bold text-primary">{FMT(product.priceDiscount)}</p>
                            </>
                          ) : (
                            <p className="text-[16px] font-bold text-primary">{FMT(product.price)}</p>
                          )}
                          <div className="mt-2">
                            <AddToCartButton product={product} compact />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })}
                      className="px-4 py-2 rounded-lg border border-surface-variant hover:bg-surface-container text-[13px] font-semibold">
                      ← Trước
                    </Link>
                  )}
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Link key={p} href={buildUrl({ page: String(p) })}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${p === page ? "bg-primary text-on-primary" : "border border-surface-variant hover:bg-surface-container"}`}>
                        {p}
                      </Link>
                    );
                  })}
                  {page < pagination.totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })}
                      className="px-4 py-2 rounded-lg border border-surface-variant hover:bg-surface-container text-[13px] font-semibold">
                      Sau →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
