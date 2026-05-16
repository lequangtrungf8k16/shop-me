import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BackToTop } from "@/_components/layout/BackToTop";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/query-provider";

const beVietnamPro = localFont({
   src: [
      {
         path: "../../public/fonts/BeVietnamPro-Regular.woff2",
         weight: "400",
         style: "normal",
      },
      {
         path: "../../public/fonts/BeVietnamPro-Medium.woff2",
         weight: "500",
         style: "normal",
      },
      {
         path: "../../public/fonts/BeVietnamPro-SemiBold.woff2",
         weight: "600",
         style: "normal",
      },
      {
         path: "../../public/fonts/BeVietnamPro-Bold.woff2",
         weight: "700",
         style: "normal",
      },
   ],
   variable: "--font-be-vietnam-pro",
   display: "swap",
});

export const metadata: Metadata = {
   title: "TECHNOLOGY - High Performance Systems",
   description: "Hệ thống bán lẻ máy tính, linh kiện, phụ kiện hàng đầu.",
};

export default function RootLayout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <html lang="vi" className={beVietnamPro.variable}>
         <body className="bg-background text-on-background font-sans antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
            <QueryProvider>
               {children}
               <BackToTop />
               <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  duration={2000}
               />
            </QueryProvider>
         </body>
      </html>
   );
}
