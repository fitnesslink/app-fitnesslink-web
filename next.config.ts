import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a minimal self-contained server bundle for the container image.
  output: "standalone",
};

export default nextConfig;
