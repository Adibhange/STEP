import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://stepapi.scipl.info.in/api/v2';

    const cleanUrl = backendUrl.replace(/\/+$/, '');
    const baseDomain = cleanUrl.replace(/\/api\/.*$/i, '');

    return [
      {
        source: '/api/:path*',
        destination: `${baseDomain}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
