// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */

//     output: 'export', // ✅ Enable static export mode
//     outputFileTracingRoot: __dirname, // ensures Next.js uses this folder as root
//     images: {
//       unoptimized: true, // Required for static export
//       remotePatterns: [
//         {
//           protocol: 'http',
//           hostname: 'localhost',
//           port: '',
//           pathname: '/petite-backend/**',
//         },
//       ],
//     },

// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.petitefille.com.au',
        port: '',
        pathname: '/petite-backend/**',
      },
    ],
  },
};

export default nextConfig;