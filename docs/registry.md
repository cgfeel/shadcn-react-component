# 自定义组件注册与发布（Registry）

本文档记录本 monorepo 的自建 shadcn 注册表机制：组件如何声明、构建、验证和安装。

## 目录结构

```
packages/ui/
  registry.json          # 注册表清单（registry name: levi）
  src/components/        # 组件源码（同时是库内消费源码，单一来源）
    card.tsx
    blocks/login/index.tsx
  public/r/              # shadcn build 产物（*.json，内联源码）
```

## 硬规则（CLI 源码实测验证）

1. **files[].path 必须是注册表项目内的相对路径**。`shadcn build` 允许 `../` 逃逸，但 `add` 安装端会以"unsafe file path"拒绝（安全校验，防路径穿越）。发布文件必须物理位于注册表项目内。
2. **组件源码 import 必须用 `@/registry/<name>/...` 约定**（本仓库是 `@/registry/levi/...`），CLI 安装时按以下规则重写为消费者的 aliases：

   | 源码 import | 安装后 |
   |---|---|
   | `@/registry/levi/lib/utils` | 消费者 `aliases.utils` |
   | `@/registry/levi/ui/xxx` | 消费者 `aliases.ui + /xxx` |
   | `@/registry/levi/components/xxx` | 消费者 `aliases.components + /xxx` |
   | `@/registry/levi/hooks/xxx` | 消费者 `aliases.hooks + /xxx` |

3. **不要用 `@workspace/ui/*`**：CLI 将其视为"最终路径"原样保留，安装到外部项目后无法解析。
4. 文件落位由 `files[].type` 决定（registry:ui → aliases.ui，registry:lib → aliases.lib，依此类推）；可显式指定 `target` 覆盖。

## 路径映射配置（monorepo 三处，缺一不可）

- `packages/ui/tsconfig.json`：`"@/registry/levi/*": ["./src/*"]`
- `apps/web/tsconfig.json`：`"@/registry/levi/*": ["../../packages/ui/src/*"]`
- 构建器侧：Next 的 transpilePackages + tsconfig paths（详见 [nextjs-migration.md](./nextjs-migration.md)）

## 构建与本地验证

```bash
# 构建（根目录脚本，等价于 packages/ui 内 pnpm exec shadcn build）
pnpm registry:build        # → packages/ui/public/r/*.json

# 本地托管
python3 -m http.server 8787 -d packages/ui/public

# 干净项目验证
npx shadcn@latest init
npx shadcn@latest registry add @levi=http://localhost:8787/r/{name}.json
npx shadcn@latest add @levi/card
```

## 四种安装方式

| 方式 | 命令 | 要求 |
|---|---|---|
| GitHub 直连 | `add 用户名/仓库名/card` | 公开仓库 + registry.json 在仓库根（**待办**） |
| 命名空间 | `registry add @levi=URL` 后 `add @levi/card` | 任何 HTTP 托管 |
| 完整 URL | `add https://域名/r/card.json` | 任何 HTTP 托管 |
| 官方默认 | `add card` | 仅官方组件 |

## 待办

- [ ] registry.json 提升到仓库根（启用 GitHub 直连，paths 改为 `packages/ui/src/...`）
- [ ] login item 是空壳，需实现
- [ ] `homepage` 字段换成自己的仓库/域名（现为模板作者地址）
- [ ] 对外部署（GitHub Pages / Vercel）时更新命名空间 URL
