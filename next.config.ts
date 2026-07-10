import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

    output: 'export', 
    outputFileTracingRoot: __dirname, 
    images: {
      unoptimized: true, 
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '',
          pathname: '/petite-backend/**',
        },
      ],
    },

};
export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'backend.petitefille.com.au',
//         port: '',
//         pathname: '/petite-backend/**',
//       },
//     ],
//   },
// };

// export default nextConfig;