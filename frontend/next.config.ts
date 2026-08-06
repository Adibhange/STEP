import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean, self-contained build output for Docker — copies only the files a production
  // `node server.js` run actually needs, instead of the whole node_modules tree.
  output: 'standalone',
};

export default nextConfig;
