import { defineConfig } from "tsup";

export default defineConfig({
   entry: ["src/server.ts"],
   format: ["esm"],
   clean: true,
   // Chặn không cho gộp các thư viện này vào file build
   external: [
      "mariadb",
      "@prisma/client",
      "@prisma/adapter-mariadb",
      "express",
      "zod",
   ],
   // Chặn việc gộp toàn bộ node_modules (nếu có)
   noExternal: [],
   skipNodeModulesBundle: true,
});
