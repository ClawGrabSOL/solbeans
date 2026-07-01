import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack with empty config
  turbopack: {},
  // Disable strict mode to prevent double-rendering in development
  // which can cause issues with Three.js
  reactStrictMode: false,
};

export default nextConfig;
