import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

    output: 'export', // ✅ Enable static export mode
    outputFileTracingRoot: __dirname, // ensures Next.js uses this folder as root

};

export default nextConfig;

