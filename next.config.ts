import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // turbopack: {
  //   root: '.',
  // },
  serverExternalPackages: ['firebase-admin'],
  experimental: {
    scrollRestoration: true,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', 'blandness-drown-shrank.ngrok-free.dev']
};

export default nextConfig;
