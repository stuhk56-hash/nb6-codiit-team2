import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 이미지 테스트를 위한 외부 이미지 도메인 허용
      },
    ],
  },
};

export default nextConfig;
