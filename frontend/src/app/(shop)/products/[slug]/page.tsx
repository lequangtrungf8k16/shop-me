import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
   ChevronRight,
   CheckCircle2,
   ShieldCheck,
   Check,
   ShoppingCart,
   CreditCard,
   ArrowLeftRight,
   Cpu,
   Gauge,
   Thermometer,
   LayoutGrid,
   Star,
} from "lucide-react";
import { Product } from "@/types/product.type";
import AddToCartButton from "@/_components/product/AddToCartButton";
import ReviewSection from "@/_components/review/ReviewSection";
import CommentSection from "@/_components/comment/CommentSection";
import ReactionButtons from "@/_components/reaction/ReactionButtons";
import ImageGallery from "@/_components/product/ImageGallery";

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fetch API
async function getProduct(slug: string): Promise<Product | null> {
   try {
      const res = await fetch(
         `${API}/products/${slug}`,
         {
            cache: "no-store",
         },
      );

      if (!res.ok) {
         if (res.status === 404) return null;
         throw new Error("Failed to fetch product");
      }

      const json = await res.json();
      return json.data;
   } catch (error) {
      console.error("Fetch Error:", error);
      return null;
   }
}

async function getRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products/${slug}/related`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

// Hàm format tiền tệ VNĐ
const formatPrice = (price: string) => {
   return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(price));
};

// Component Chính
export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
   const { slug } = await props.params;
   const [product, relatedProducts] = await Promise.all([
     getProduct(slug),
     getRelatedProducts(slug),
   ]);

   if (!product) {
      notFound();
   }

   // Chọn giá hiển thị
   const currentPrice = product.priceDiscount
      ? product.priceDiscount
      : product.price;

   return (
      <div className="grow w-full max-w-container-max mx-auto px-margin-page py-section-gap flex flex-col gap-section-gap">
         {/* BREADCRUMB & STATUS */}
         <div className="flex justify-between items-center bg-surface-container-lowest p-stack-default rounded-lg shadow-sm border border-surface-container-high">
            <div className="flex gap-stack-compact text-on-surface-variant text-[12px] items-center">
               <Link href="/" className="hover:text-primary">
                  Trang chủ
               </Link>
               <ChevronRight size={14} />
               <Link
                  href={`/category/${product.category.slug}`}
                  className="hover:text-primary"
               >
                  {product.category.name}
               </Link>
               <ChevronRight size={14} />
               <span className="text-primary font-bold truncate max-w-37.5 sm:max-w-xs">
                  {product.name}
               </span>
            </div>
            <div className="flex gap-stack-compact">
               {product.stock > 0 ? (
                  <span className="bg-[#e8f5e9] text-[#2e7d32] text-[12px] font-semibold px-3 py-1 rounded flex items-center gap-1 border border-[#c8e6c9]">
                     <CheckCircle2 size={14} /> Sẵn hàng
                  </span>
               ) : (
                  <span className="bg-error-container text-on-error-container text-[12px] font-semibold px-3 py-1 rounded flex items-center gap-1 border border-error">
                     Hết hàng
                  </span>
               )}
            </div>
         </div>

         {/* PRODUCT HERO SECTION */}
         <section className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap bg-surface-container-lowest p-gutter rounded-xl shadow-sm border border-surface-container-high">
            {/* Left: Gallery */}
            <div className="lg:col-span-7 flex flex-col gap-stack-default">
               <ImageGallery thumbnail={product.thumbnail} images={product.images || []} productName={product.name} />
            </div>

            {/* Right: Purchase Info */}
            <div className="lg:col-span-5 flex flex-col justify-start pt-gutter">
               <h1 className="text-[24px] leading-[32px] font-bold text-on-surface mb-stack-compact">
                  {product.name}
               </h1>
               <p className="text-[14px] leading-5 text-on-surface-variant mb-gutter pb-stack-default border-b border-surface-container-highest line-clamp-2">
                  {product.description ||
                     "Máy trạm di động siêu cấp với sức mạnh xử lý lượng tử."}
               </p>

               <div className="mb-gutter bg-surface-container p-gutter rounded-lg border border-surface-container-high">
                  {product.priceDiscount && (
                     <span className="text-[14px] text-on-surface-variant line-through block mb-1">
                        {formatPrice(product.price)}
                     </span>
                  )}
                  <span className="text-[28px] leading-9 font-bold text-primary block mb-1">
                     {formatPrice(currentPrice)}
                  </span>
                  <p className="text-[12px] leading-[16px] text-on-surface-variant flex items-center gap-1">
                     <ShieldCheck size={14} className="text-primary" /> Đã bao
                     gồm VAT. Bảo hành phần cứng 3 năm.
                  </p>
               </div>

               {/* Config Options (Tĩnh - Giữ nguyên UI) */}
               <div className="flex flex-col gap-gutter mb-section-gap">
                  <div>
                     <span className="text-[12px] font-semibold text-on-surface block mb-stack-compact">
                        CHỌN VI XỬ LÝ (CPU)
                     </span>
                     <div className="grid grid-cols-2 gap-stack-default">
                        <button className="border-2 border-primary bg-primary/5 text-primary py-stack-default px-gutter rounded-lg text-[14px] text-left relative overflow-hidden font-semibold">
                           Core i9-13980HX
                           <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-bl"></span>
                           <Check
                              className="absolute top-0.5 right-0.5 text-white"
                              size={10}
                              strokeWidth={4}
                           />
                        </button>
                        <button className="border border-surface-container-highest text-on-surface hover:border-primary hover:text-primary py-stack-default px-gutter rounded-lg text-[14px] text-left transition-colors bg-surface-container-lowest">
                           Ryzen 9 7945HX3D{" "}
                           <span className="text-[12px] text-primary block mt-1">
                              +5.000.000 ₫
                           </span>
                        </button>
                     </div>
                  </div>
                  <div>
                     <span className="text-[12px] font-semibold text-on-surface block mb-stack-compact">
                        BỘ NHỚ (RAM)
                     </span>
                     <div className="grid grid-cols-2 gap-stack-default">
                        <button className="border border-surface-container-highest text-on-surface hover:border-primary hover:text-primary py-stack-default px-gutter rounded-lg text-[14px] transition-colors bg-surface-container-lowest">
                           32GB DDR5
                        </button>
                        <button className="border-2 border-primary bg-primary/5 text-primary py-stack-default px-gutter rounded-lg text-[14px] relative font-semibold">
                           64GB DDR5
                           <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-bl"></span>
                           <Check
                              className="absolute top-0.5 right-0.5 text-white"
                              size={10}
                              strokeWidth={4}
                           />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex flex-col gap-stack-default mt-auto">
                  <button className="w-full bg-primary text-on-primary text-[20px] font-bold py-gutter rounded-lg hover:brightness-110 transition-all flex justify-center items-center gap-2 shadow-md">
                     <CreditCard size={24} /> MUA NGAY
                  </button>
                  <div className="grid grid-cols-2 gap-stack-default">
                     <AddToCartButton product={product} />
                     <button className="border border-surface-container-highest text-on-surface text-[12px] font-semibold py-stack-default rounded-lg hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2 bg-surface-container-lowest">
                        <ArrowLeftRight size={18} /> SO SÁNH
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* TECH SPECS & DETAILS (BEN-TO GRID)*/}
         <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-section-gap">
            {/* Specs Table Panel */}
            <div className="lg:col-span-4 flex flex-col gap-stack-default">
               <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
                  <div className="p-gutter border-b border-surface-container-high bg-surface-container flex justify-between items-center">
                     <h3 className="text-[16px] font-semibold text-on-surface m-0">
                        Thông số kỹ thuật
                     </h3>
                     <Cpu className="text-primary" size={20} />
                  </div>
                  <div className="flex flex-col text-[14px]">
                     <div className="grid grid-cols-5 p-stack-default bg-surface-container-lowest border-b border-surface-container-high">
                        <span className="text-on-surface-variant col-span-2">
                           CPU
                        </span>
                        <span className="text-on-surface font-semibold col-span-3 text-right">
                           Intel Core i9-13980HX
                        </span>
                     </div>
                     <div className="grid grid-cols-5 p-stack-default bg-surface-container border-b border-surface-container-high">
                        <span className="text-on-surface-variant col-span-2">
                           GPU
                        </span>
                        <span className="text-on-surface font-semibold col-span-3 text-right">
                           NVIDIA RTX 4090 16GB
                        </span>
                     </div>
                     <div className="grid grid-cols-5 p-stack-default bg-surface-container-lowest border-b border-surface-container-high">
                        <span className="text-on-surface-variant col-span-2">
                           RAM
                        </span>
                        <span className="text-on-surface font-semibold col-span-3 text-right">
                           64GB DDR5 5600MHz
                        </span>
                     </div>
                     <div className="grid grid-cols-5 p-stack-default bg-surface-container border-b border-surface-container-high">
                        <span className="text-on-surface-variant col-span-2">
                           Ổ cứng
                        </span>
                        <span className="text-on-surface font-semibold col-span-3 text-right">
                           2TB PCIe Gen4 NVMe
                        </span>
                     </div>
                     <div className="grid grid-cols-5 p-stack-default bg-surface-container-lowest border-b border-surface-container-high">
                        <span className="text-on-surface-variant col-span-2">
                           Màn hình
                        </span>
                        <span className="text-on-surface font-semibold col-span-3 text-right">
                           18 inch Mini-LED 240Hz
                        </span>
                     </div>
                     <div className="grid grid-cols-5 p-stack-default bg-surface-container">
                        <span className="text-on-surface-variant col-span-2">
                           Tản nhiệt
                        </span>
                        <span className="text-primary font-semibold col-span-3 text-right">
                           Cryo-Chamber Vapor
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Description & Visuals */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
               <div className="md:col-span-2 bg-white border border-surface-container-high p-section-gap rounded-xl relative overflow-hidden group border-t-4 border-t-primary shadow-sm flex flex-col justify-center">
                  <h2 className="text-[24px] font-bold text-on-surface mb-gutter">
                     Vượt Qua Mọi Giới Hạn Vật Lý
                  </h2>
                  <p className="text-[15px] leading-5.5 text-on-surface-variant mb-0 max-w-3xl">
                     Được chế tác từ hợp kim nhôm cấp hàng không vũ trụ, thiết
                     bị này không chỉ là một cỗ máy, mà là một tuyệt tác kỹ
                     thuật. Hệ thống tản nhiệt buồng hơi lượng tử đảm bảo hiệu
                     năng duy trì ở mức tối đa mà không bị nghẽn cổ chai, ngay
                     cả trong những tác vụ render 3D phức tạp nhất.
                  </p>
               </div>
               <div className="bg-white border border-surface-container-high p-gutter rounded-xl flex flex-col justify-between aspect-square relative shadow-sm hover:border-primary transition-colors">
                  <Gauge size={40} className="text-primary mb-gutter" />
                  <div>
                     <div className="text-[32px] font-bold text-primary mb-1">
                        240Hz
                     </div>
                     <div className="text-[12px] font-semibold text-on-surface-variant">
                        TẦN SỐ QUÉT MÀN HÌNH
                     </div>
                  </div>
               </div>
               <div className="bg-surface-container-lowest border border-surface-container-high p-gutter rounded-xl flex flex-col justify-between aspect-square relative shadow-sm hover:border-primary transition-colors">
                  <Thermometer size={40} className="text-tertiary mb-gutter" />
                  <div>
                     <div className="w-full h-2 bg-surface-container-highest rounded-full mb-stack-default overflow-hidden">
                        <div className="h-full bg-primary w-[85%]"></div>
                     </div>
                     <div className="text-[12px] font-semibold text-on-surface-variant">
                        HIỆU QUẢ TẢN NHIỆT
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* SẢN PHẨM TƯƠNG TỰ - từ API */}
         {relatedProducts.length > 0 && (
         <section className="mt-section-gap pt-section-gap border-t border-surface-container-high">
            <h2 className="text-[24px] font-bold text-on-surface mb-section-gap flex items-center gap-stack-default">
               <LayoutGrid className="text-primary" size={28} /> SẢN PHẨM TƯƠNG TỰ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
               {relatedProducts.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`}
                     className="bg-surface-container-lowest border border-surface-container-high shadow-sm rounded-lg p-gutter hover:border-primary hover:shadow-md transition-all group flex flex-col">
                     <div className="aspect-video relative bg-surface-container mb-gutter rounded overflow-hidden">
                        <Image src={p.thumbnail || "https://picsum.photos/400/300"} alt={p.name} fill
                           className="object-contain p-2 group-hover:scale-105 transition-transform" />
                     </div>
                     <h3 className="text-[13px] font-semibold text-on-surface line-clamp-2 mb-2 group-hover:text-primary">{p.name}</h3>
                     <div className="text-[15px] font-bold text-primary mt-auto">
                        {new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(Number(p.priceDiscount || p.price))}
                     </div>
                  </Link>
               ))}
            </div>
         </section>
         )}

         {/* REACTION
         {/* REACTION — LIKE / DISLIKE SẢN PHẨM */}
         <div className="mt-section-gap pt-section-gap border-t border-surface-container-high flex items-center gap-4">
            <span className="text-[14px] font-semibold text-on-surface-variant">
               Bạn thấy sản phẩm này thế nào?
            </span>
            <ReactionButtons productId={product.id} />
         </div>

         {/* ĐÁNH GIÁ */}
         <section className="mt-section-gap pt-section-gap border-t border-surface-container-high">
            <h2 className="text-[24px] font-bold text-on-surface mb-section-gap">
               Đánh giá từ khách hàng
            </h2>
            <ReviewSection productId={product.id} />
         </section>

         {/* BÌNH LUẬN ĐA CẤP */}
         <section className="mt-section-gap pt-section-gap border-t border-surface-container-high">
            <CommentSection productId={product.id} />
         </section>
      </div>
   );
}
