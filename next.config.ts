import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The end-to-end tests build the app twice with different settings and keep
  // the outputs apart with NEXT_DIST_DIR. Normal builds use ".next".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    // Next.js adds the build folder to the tsconfig it is given. Pointing the
    // test builds at their own file keeps tsconfig.json unchanged.
    tsconfigPath: process.env.NEXT_TSCONFIG_PATH || "tsconfig.json",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
