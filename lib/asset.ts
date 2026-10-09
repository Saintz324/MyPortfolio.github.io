/**
 * Prefixes a /public path with the deploy base path (e.g. "/MyPortfolio.github.io" on GitHub Pages).
 * next/image does not add basePath to string `src` values, so every local asset goes through this.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
