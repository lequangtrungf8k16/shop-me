import React from "react";
import Header from "@/_components/layout/Header";
import Sidebar from "@/_components/layout/Sidebar";
import Footer from "@/_components/layout/Footer";
import AiChatWidget from "@/_components/ai/AiChatWidget";

export default function ShopLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <div className="flex flex-col min-h-screen">
         <Header />
         <Sidebar />

         <main className="w-full pb-(--spacing-section-gap) grow">
            {children}
         </main>

         <Footer />
         <AiChatWidget />
      </div>
   );
}
