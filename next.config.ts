import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    qualities: [75, 90],
  },
  async redirects() {
    return [
      {
        source: "/sektorler",
        destination: "/cozumler",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
