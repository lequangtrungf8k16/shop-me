import Image from "next/image";
import Link from "next/link";
import {
   Laptop,
   Cpu,
   Monitor,
   Keyboard,
   Flame,
   ChevronRight,
   Newspaper,
} from "lucide-react";
import type { Product } from "@/types/product.type";
import type { ArticleSummary } from "@/types/article.type";
import AddToCartButton from "@/_components/product/AddToCartButton";

const API =
   process.env.INTERNAL_API_URL ||
   process.env.NEXT_PUBLIC_API_URL ||
   "http://localhost:5000/api";

async function getLatestProducts(): Promise<Product[]> {
   try {
      const res = await fetch(
         `${API}/products?limit=8&sortBy=createdAt&sortOrder=desc`,
         { cache: "no-store" },
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.products ?? [];
   } catch {
      return [];
   }
}

async function getLatestArticles(): Promise<ArticleSummary[]> {
   try {
      const res = await fetch(`${API}/articles?limit=4&page=1`, {
         cache: "no-store",
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.articles ?? [];
   } catch {
      return [];
   }
}

const FMT = (v: string | number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(v));

const CATEGORIES = [
   { name: "Laptop Gaming", slug: "laptop-gaming", icon: Laptop },
   { name: "Linh Kiện PC", slug: "linh-kien-pc", icon: Cpu },
   { name: "Màn Hình", slug: "man-hinh", icon: Monitor },
   { name: "Gaming Gear", slug: "gaming-gear", icon: Keyboard },
];

export default async function HomePage() {
   const [products, articles] = await Promise.all([
      getLatestProducts(),
      getLatestArticles(),
   ]);

   return (
      <>
         {/* HERO */}
         <section className="max-w-container-max mx-auto px-margin-page pt-stack-default pb-section-gap">
            <div className="relative h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-sm group bg-surface-container-highest">
               <Image
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
                  alt="Hero Banner"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                  priority
               />
               <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
               <div className="absolute bottom-8 left-8 max-w-md">
                  <span className="inline-block bg-primary text-on-primary text-[11px] font-bold px-2 py-1 rounded mb-2">
                     NEW ARRIVAL
                  </span>
                  <h1 className="text-[26px] font-bold text-white mb-2">
                     TECHNOLOGY STORE
                  </h1>
                  <p className="text-[14px] text-white/80 mb-5">
                     Thiết bị công nghệ hàng đầu — Laptop, PC, Gaming Gear
                  </p>
                  <Link
                     href="/products"
                     className="inline-flex items-center gap-2 bg-primary text-on-primary font-bold text-[13px] px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                     Khám phá ngay <ChevronRight size={16} />
                  </Link>
               </div>
            </div>
         </section>

         {/* DANH MỤC NỔI BẬT */}
         <section className="max-w-container-max mx-auto px-margin-page pb-section-gap">
            <h2 className="text-[18px] font-bold text-on-surface mb-4 uppercase border-l-4 border-primary pl-3">
               Danh Mục Nổi Bật
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {CATEGORIES.map(({ name, slug, icon: Icon }) => (
                  <Link
                     key={slug}
                     href={`/category/${slug}`}
                     className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all group"
                  >
                     <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <Icon size={28} className="text-primary" />
                     </div>
                     <h3 className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {name}
                     </h3>
                  </Link>
               ))}
            </div>
         </section>

         {/* SẢN PHẨM MỚI NHẤT */}
         <section className="max-w-container-max mx-auto px-margin-page pb-section-gap">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 shadow-sm">
               <div className="flex justify-between items-center mb-5 pb-3 border-b border-surface-variant">
                  <h2 className="text-[18px] font-bold text-primary uppercase flex items-center gap-2">
                     <Flame size={20} /> Sản phẩm mới nhất
                  </h2>
                  <Link
                     href="/products"
                     className="text-[13px] text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
                  >
                     Xem tất cả <ChevronRight size={15} />
                  </Link>
               </div>

               {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {products.map((product) => {
                        const discount = product.priceDiscount
                           ? Math.round(
                                ((Number(product.price) -
                                   Number(product.priceDiscount)) /
                                   Number(product.price)) *
                                   100,
                             )
                           : 0;
                        return (
                           <div
                              key={product.id}
                              className="border border-surface-variant hover:border-primary hover:shadow-md transition-all group flex flex-col overflow-hidden relative rounded-lg"
                           >
                              {discount > 0 && (
                                 <span className="absolute top-2 left-2 z-10 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded">
                                    -{discount}%
                                 </span>
                              )}
                              <Link
                                 href={`/products/${product.slug}`}
                                 className="relative h-48 bg-white p-3 flex items-center justify-center overflow-hidden"
                              >
                                 <Image
                                    src={
                                       product.thumbnail ||
                                       "https://picsum.photos/400/400"
                                    }
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-contain p-3 group-hover:-translate-y-1 transition-transform duration-300"
                                 />
                              </Link>
                              <div className="p-3 flex-1 flex flex-col border-t border-surface-variant bg-surface-container-lowest">
                                 <Link href={`/products/${product.slug}`}>
                                    <h3 className="text-[13px] font-semibold text-on-surface mb-2 line-clamp-2 hover:text-primary">
                                       {product.name}
                                    </h3>
                                 </Link>
                                 <div className="mt-auto">
                                    {product.priceDiscount ? (
                                       <>
                                          <p className="text-[11px] text-on-surface-variant line-through">
                                             {FMT(product.price)}
                                          </p>
                                          <p className="text-[16px] font-bold text-primary mb-2">
                                             {FMT(product.priceDiscount)}
                                          </p>
                                       </>
                                    ) : (
                                       <p className="text-[16px] font-bold text-primary mb-2">
                                          {FMT(product.price)}
                                       </p>
                                    )}
                                    <AddToCartButton
                                       product={product}
                                       compact
                                    />
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <p className="text-center py-10 text-on-surface-variant">
                     Chưa có sản phẩm nào.
                  </p>
               )}
            </div>
         </section>

         {/* TIN TỨC CÔNG NGHỆ */}
         {articles.length > 0 && (
            <section className="max-w-container-max mx-auto px-margin-page pb-section-gap">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[18px] font-bold text-on-surface uppercase border-l-4 border-primary pl-3 flex items-center gap-2">
                     <Newspaper size={18} /> Tin tức công nghệ
                  </h2>
                  <Link
                     href="/news"
                     className="text-[13px] text-on-surface-variant hover:text-primary flex items-center gap-1"
                  >
                     Xem tất cả <ChevronRight size={15} />
                  </Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {articles.map((article) => (
                     <Link
                        key={article.id}
                        href={`/news/${article.slug}`}
                        className="group bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all flex flex-col"
                     >
                        <div className="relative aspect-video bg-surface-container overflow-hidden">
                           {article.thumbnail ? (
                              <Image
                                 src={article.thumbnail}
                                 alt={article.title}
                                 fill
                                 className="object-cover group-hover:scale-105 transition-transform duration-500"
                                 sizes="(max-width: 768px) 100vw, 25vw"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">
                                 📰
                              </div>
                           )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                           <h3 className="text-[13px] font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                           </h3>
                           <p className="text-[11px] text-on-surface-variant mt-1">
                              {new Date(article.createdAt).toLocaleDateString(
                                 "vi-VN",
                              )}{" "}
                              · {article.views} lượt xem
                           </p>
                        </div>
                     </Link>
                  ))}
               </div>
            </section>
         )}
      </>
   );
}
