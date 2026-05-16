"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
   children,
}: {
   children: React.ReactNode;
}) {
   // Khởi tạo QueryClient bên trong component để tránh share state giữa các request SSR
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  staleTime: 1000 * 60 * 5, // Cache 5 phút
                  retry: 1,
               },
            },
         }),
   );

   return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );
}
