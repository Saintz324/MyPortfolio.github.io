import type { NextConfig } from "next";

/**
 * Static export, served from GitHub Pages at https://saintz324.github.io/MyPortfolio.github.io/.
 * PAGES_BASE_PATH is set by the deploy workflow; locally it is empty so dev runs at "/".
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Static hosting has no image optimizer; images in /public are already sized and compressed.
  images: { unoptimized: true },
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
