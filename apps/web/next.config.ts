import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 显式指定项目 root，避免 Turbopack 向上遍历误判到 home 目录的 lockfile
  // turbopack: {
  //   root: path.resolve(process.cwd()),
  // },
  transpilePackages: ["@workspace/ui"]
};

export default nextConfig;
