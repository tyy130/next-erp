import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles server + minimal node_modules
  // into .next/standalone/ — can be run with any Node.js install
  output: "standalone",
};

export default nextConfig;
