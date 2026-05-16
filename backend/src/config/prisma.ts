import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
   host: process.env["DATABASE_HOST"] ?? "127.0.0.1",
   user: process.env["DATABASE_USER"] ?? "root",
   password: process.env["DATABASE_PASSWORD"] ?? "123456",
   database: process.env["DATABASE_NAME"] ?? "shop-me",
   port: Number(process.env["DATABASE_PORT"]) || 3306,
   connectionLimit: 10,
   allowPublicKeyRetrieval: true,
});

declare global {
   // eslint-disable-next-line no-var
   var __prisma: PrismaClient | undefined;
}

export const prisma =
   globalThis.__prisma ??
   new PrismaClient({
      adapter,
      log:
         process.env["NODE_ENV"] === "development"
            ? ["warn", "error"]
            : ["error"],
   });

if (process.env["NODE_ENV"] !== "production") {
   globalThis.__prisma = prisma;
}
