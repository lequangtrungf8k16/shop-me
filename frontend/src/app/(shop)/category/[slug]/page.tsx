import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, ShoppingCart, Package, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types/product.type";
import AddToCartButton from "@/_components/product/AddToCartButton";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getCategoryBySlug(slug: string) {
  const res = await fetch(`${API}/categories`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const cats: { id: number; name: string; slug: string; description?: string }[] = json.data ?? [];
  return cats.find((c) => c.slug === slug) ?? null;
}

async function getProductsByCategory(
  categorySlug: string,
  page: number,
  sortBy: string,
  sortOrder: string,
): Promise<{ products: Product[]; pagination: { total: number; totalPages: number; page: number } }> {
  const params = new URLSearchParams({
    category: categorySlug,
    page: String(page),
    limit: "12",
    sortBy,
    sortOrder,
  });
  const res = await fetch(`${API}/products?${params}`, { cache: "no-store" });
  if (!res.ok) return { products: [], pagination: { total: 0, totalPages: 0, page: 1 } };
  const json = await res.json();
  return json.data;
}

const FMT = (v: string | number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(v));

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string; sortOrder?: string }>;
}) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const page = Number(sp.page ?? "1");
  const sortBy = sp.sortBy ?? "createdAt";
  const sortOrder = sp.sortOrder ?? "desc";

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, pagination } = await getProductsByCategory(slug, page, sortBy, sortOrder);

  const sortOptions = [
    { label: "Mới nhất", sortBy: "createdAt", sortOrder: "desc" },
    { label: "Giá tăng dần", sortBy: "price", sortOrder: "asc" },
    { label: "Giá giảm dần", sortBy: "price", sortOrder: "desc" },
    { label: "Tên A-Z", sortBy: "name", sortOrder: "asc" },
  ];

  const buildSortUrl = (sb: string, so: string) => {
    const params = new URLSearchParams({ page: "1", sortBy: sb, sortOrder: so });
    return `/category/${slug}?${params}`;
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight size={13} />
        <span className="text-primary font-semibold">{category.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-on-surface">{category.name}</h1>
          <p className="text-[13px] text-on-surface-variant">{pagination.total} sản phẩm</p>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-on-surface-variant" />
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.sortBy && sortOrder === opt.sortOrder;
            return (
              <Link
                key={`${opt.sortBy}-${opt.sortOrder}`}
                href={buildSortUrl(opt.sortBy, opt.sortOrder)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  isActive ? "bg-primary text-on-primary" : "bg-surface-container border border-surface-variant text-on-surface hover:border-primary"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest border border-surface-variant rounded-xl">
          <Package size={48} className="mx-auto mb-4 text-outline opacity-40" />
          <p className="text-[16px] font-semibold text-on-surface-variant">Chưa có sản phẩm nào trong danh mục này</p>
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
                    <Image
                      src={product.thumbnail || "https://picsum.photos/400/400"}
                      alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:-translate-y-1 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-3 flex-1 flex flex-col border-t border-surface-variant">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-[13px] font-semibold text-on-surface mb-2 line-clamp-2 hover:text-primary">{product.name}</h3>
                    </Link>
                    <div className="mt-auto">
                      {product.priceDiscount ? (
                        <>
                          <p className="text-[12px] text-on-surface-variant line-through">{FMT(product.price)}</p>
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link href={`/category/${slug}?page=${page - 1}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="px-4 py-2 rounded-lg border border-surface-variant hover:bg-surface-container text-[13px] font-semibold">
                  ← Trước
                </Link>
              )}
              <span className="text-[13px] text-on-surface-variant px-4">
                Trang {page} / {pagination.totalPages}
              </span>
              {page < pagination.totalPages && (
                <Link href={`/category/${slug}?page=${page + 1}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="px-4 py-2 rounded-lg border border-surface-variant hover:bg-surface-container text-[13px] font-semibold">
                  Sau →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
