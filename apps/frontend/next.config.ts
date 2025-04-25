import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.0.101",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "bhalovashi-website-uploads.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "bhalovashi.abhishekchalla.in",
      },
    ],
  },
};

export default nextConfig;
