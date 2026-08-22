# apps/web：Vite → Next.js 迁移记录

## 目的

组件面向 RSC/SSR 消费者分发时，hydration 异常只在 SSR 环境暴露，Vite SPA 永远测不出：

- 渲染期访问 `localStorage` / `window`（服务端直接崩溃）
- 渲染期使用随机值 / 时间值（server/client HTML 不一致）
- 交互组件缺 `"use client"`（Next 构建期报错，Vite 不报）

因此 apps/web 迁移为 Next.js（App Router），作为组件开发时的 RSC/SSR 验证环境。

## 关键配置（踩坑记录）

- **`next.config.ts`**：
  - `transpilePackages: ["@workspace/ui"]` —— monorepo 消费 workspace TS 源码包，必配
  - `reactCompiler: true` —— 需要 `babel-plugin-react-compiler` 依赖，否则构建报错
  - **不要设置 `turbopack.root`** —— 锁死根目录会导致 Turbopack 找不到 hoisted 的 next 包；默认按最近 lockfile 检测工作区根，正确
- **`tsconfig.json`** paths 需三条：`@/*`、`@/registry/levi/*`（→ packages/ui/src）、`@workspace/ui/*`
- **Tailwind 扫描**：`@tailwindcss/postcss` 不会自动扫到 monorepo 外的 packages/ui，需在 globals.css 加 `@source` 指令
- `components.json` 的 `rsc` 字段已改为 `true`

## 组件 RSC 约定

- 交互组件（hooks、事件、context）顶部加 `"use client"`（button.tsx）
- 纯展示组件不写 directive，server/client 双栖（card.tsx）
- 注册表分发源码，directive 随内容内联，消费者天然正确

## theme-provider 的 SSR 安全模式

- `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` + 内存快照 store（`src/utils/generateStorage.ts`）
- `getServerSnapshot` 返回内存快照 → SSR 不崩溃、hydration 一致
- mount 后 useEffect 从 localStorage 恢复主题（不能在 useState 初始化器里读，渲染期执行会崩）
- 注意 `localStorage.removeItem`（无 `delete` API）；updater 分支要存计算后的值而非函数本身

## 验证方法

1. `next build`：构建期 SSR 预渲染 + tsc（"use client" 缺失在此暴露）
2. `next dev`：浏览器控制台无 hydration mismatch 报错（React 19 会明确报）
3. 主题切换后刷新页面保持（验证恢复 effect）
