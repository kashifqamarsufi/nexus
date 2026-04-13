import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-78b76278-9daf-48e6-8a7d-e41096132399.space.z.ai',
    '.space.z.ai',
  ],
};

export default nextConfig;
