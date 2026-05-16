import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: "standalone", // Cần thiết cho Docker deployment
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "images.unsplash.com",
            pathname: "/**",
         },
         {
            protocol: "https",
            hostname: "picsum.photos",
            pathname: "/**",
         },
      ],
   },
   typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
