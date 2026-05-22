import DOMPurify from "isomorphic-dompurify";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Eye, ChevronRight, MessageCircle } from "lucide-react";
import type { Article } from "@/types/article.type";
import ReactionButtons from "@/_components/reaction/ReactionButtons";
import CommentSection from "@/_components/comment/CommentSection";

async function getArticle(slug: string): Promise<Article | null> {
   try {
      const res = await fetch(
         `${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`,
         { cache: "no-store" },
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as Article;
   } catch {
      return null;
   }
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
) {
   const { slug } = await props.params;
   const article = await getArticle(slug);
   if (!article) return { title: "Không tìm thấy bài viết" };
   return {
      title: `${article.title} | TECHNOLOGY`,
      description: article.excerpt ?? undefined,
   };
}

const formatDate = (d: string) =>
   new Date(d).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });

export default async function ArticleDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
   const { slug } = await props.params;
   const article = await getArticle(slug);
   if (!article) notFound();

   return (
      <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-6">
            <Link href="/" className="hover:text-primary">
               Trang chủ
            </Link>
            <ChevronRight size={14} />
            <Link href="/news" className="hover:text-primary">
               Tin tức
            </Link>
            <ChevronRight size={14} />
            <span className="text-primary font-semibold truncate max-w-xs">
               {article.title}
            </span>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* MAIN CONTENT */}
            <article className="xl:col-span-8">
               {/* Title */}
               <h1 className="text-[28px] md:text-[36px] font-bold text-on-surface leading-tight mb-4">
                  {article.title}
               </h1>

               {/* Meta */}
               <div className="flex flex-wrap items-center gap-4 text-[13px] text-on-surface-variant mb-6 pb-6 border-b border-surface-variant">
                  <span className="flex items-center gap-1.5">
                     <User size={14} /> {article.author.fullName}
                  </span>
                  <span className="flex items-center gap-1.5">
                     <Calendar size={14} /> {formatDate(article.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                     <Eye size={14} /> {article.views} lượt xem
                  </span>
                  <span className="flex items-center gap-1.5">
                     <MessageCircle size={14} /> {article._count.comments} bình
                     luận
                  </span>
               </div>

               {/* Thumbnail */}
               {article.thumbnail && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-surface-container">
                     <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1280px) 100vw, 800px"
                     />
                  </div>
               )}

               {/* Excerpt */}
               {article.excerpt && (
                  <p className="text-[16px] text-on-surface font-medium leading-relaxed bg-surface-container-low border-l-4 border-primary px-5 py-4 rounded-r-lg mb-8">
                     {article.excerpt}
                  </p>
               )}

               {/* Content — render HTML từ editor */}
               <div
                  className="prose prose-lg max-w-none text-on-surface prose-headings:text-on-surface prose-a:text-primary prose-strong:text-on-surface prose-img:rounded-lg mb-10"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
               />

               {/* Reaction */}
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-surface-variant mb-10">
                  <div>
                     <p className="text-[14px] font-bold text-on-surface">
                        Bài viết này có hữu ích không?
                     </p>
                     <p className="text-[12px] text-on-surface-variant">
                        Hãy cho chúng tôi biết ý kiến của bạn!
                     </p>
                  </div>
                  <div className="sm:ml-auto">
                     <ReactionButtons articleId={article.id} />
                  </div>
               </div>

               {/* Comments */}
               <div className="border-t border-surface-variant pt-8">
                  <CommentSection articleId={article.id} />
               </div>
            </article>

            {/* SIDEBAR */}
            <aside className="xl:col-span-4 space-y-6">
               {/* Author card */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 shadow-sm">
                  <h3 className="text-[13px] font-bold text-on-surface-variant uppercase mb-3">
                     Tác giả
                  </h3>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {article.author.fullName.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <p className="text-[14px] font-bold text-on-surface">
                           {article.author.fullName}
                        </p>
                        <p className="text-[12px] text-on-surface-variant">
                           Biên tập viên TECHNOLOGY
                        </p>
                     </div>
                  </div>
               </div>

               {/* Quick links */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 shadow-sm">
                  <h3 className="text-[13px] font-bold text-on-surface-variant uppercase mb-3">
                     Danh mục tin tức
                  </h3>
                  <div className="space-y-2">
                     {[
                        "Laptop & Mobile",
                        "Linh kiện PC",
                        "Gaming",
                        "AI & Phần mềm",
                        "Mạng & Bảo mật",
                     ].map((cat) => (
                        <Link
                           key={cat}
                           href="/news"
                           className="flex items-center justify-between text-[13px] text-on-surface hover:text-primary transition-colors py-1"
                        >
                           <span>{cat}</span>
                           <ChevronRight size={14} className="text-outline" />
                        </Link>
                     ))}
                  </div>
               </div>
            </aside>
         </div>
      </div>
   );
}
