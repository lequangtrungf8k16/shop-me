import Link from "next/link";
import Image from "next/image";
import { Eye, MessageCircle, ThumbsUp, Calendar, ChevronRight, Search, Sparkles } from "lucide-react";
import type { ArticleSummary } from "@/types/article.type";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getArticles(page = 1, search = ""): Promise<{
  articles: ArticleSummary[];
  pagination: { total: number; totalPages: number; page: number };
} | null> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "9", ...(search ? { search } : {}) });
    const res = await fetch(`${API}/articles?${params}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch { return null; }
}

const FD = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default async function NewsPage(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const sp = await props.searchParams;
  const page = Number(sp.page ?? "1");
  const search = sp.search ?? "";
  const data = await getArticles(page, search);

  return (
    <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-2">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight size={13} />
          <span className="text-primary font-semibold">Tin tức công nghệ</span>
        </div>
        <h1 className="text-[28px] font-bold text-on-surface">Tin tức công nghệ</h1>
        <p className="text-[14px] text-on-surface-variant mt-1">Cập nhật những xu hướng và công nghệ mới nhất từ thế giới IT.</p>
      </div>

      {/* Search */}
      <form method="get" action="/news" className="flex gap-3 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input name="search" defaultValue={search} placeholder="Tìm kiếm bài viết..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surface-variant text-[13px] focus:outline-none focus:border-primary" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-[13px] font-bold hover:opacity-90">
          Tìm
        </button>
        {search && (
          <Link href="/news" className="px-4 py-2.5 border border-surface-variant rounded-lg text-[13px] hover:bg-surface-container">
            Xóa
          </Link>
        )}
      </form>

      {!data || data.articles.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest border border-surface-variant rounded-xl">
          <p className="text-on-surface-variant text-[16px] font-semibold">
            {search ? `Không tìm thấy bài viết cho "${search}"` : "Chưa có bài viết nào."}
          </p>
        </div>
      ) : (
        <>
          {search && (
            <p className="text-[13px] text-on-surface-variant mb-5">
              Tìm thấy <strong>{data.pagination.total}</strong> bài viết cho "<strong>{search}</strong>"
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.articles.map((article, idx) => (
              <Link key={article.id} href={`/news/${article.slug}`}
                className={`group bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all flex flex-col ${idx === 0 && !search ? "md:col-span-2" : ""}`}>
                <div className={`relative w-full overflow-hidden bg-surface-container ${idx === 0 && !search ? "h-72" : "h-52"}`}>
                  {article.thumbnail ? (
                    <Image src={article.thumbnail} alt={article.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes={idx === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-container">📰</div>
                  )}
                  {/* AI badge */}
                  <span className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Sparkles size={9} /> AI
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className={`font-bold text-on-surface group-hover:text-primary transition-colors mb-2 line-clamp-2 ${idx === 0 && !search ? "text-[18px]" : "text-[14px]"}`}>
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-[13px] text-on-surface-variant line-clamp-2 mb-3 flex-1">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-on-surface-variant mt-auto pt-3 border-t border-surface-variant">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {FD(article.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {article.views}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} /> {article._count.comments}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {article._count.reactions}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link href={`/news?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="px-4 py-2 rounded-lg border border-surface-variant hover:bg-surface-container text-[13px] font-semibold">
                  ← Trước
                </Link>
              )}
              {Array.from({ length: data.pagination.totalPages }, (_, i) => (
                <Link key={i + 1} href={`/news?page=${i + 1}${search ? `&search=${search}` : ""}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${i + 1 === page ? "bg-primary text-on-primary" : "border border-surface-variant hover:bg-surface-container"}`}>
                  {i + 1}
                </Link>
              ))}
              {page < data.pagination.totalPages && (
                <Link href={`/news?page=${page + 1}${search ? `&search=${search}` : ""}`}
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
