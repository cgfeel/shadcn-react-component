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
2. **组件源码 import 必须用 `@/registry/<name>/...` 约定**（本仓库是 `@/registry/levi/...`；ui 组件互引用例外，用 `@/ui/...`，见第 5 条），CLI 安装时按以下规则重写为消费者的 aliases：

   | 源码 import | 安装后 |
   |---|---|
   | `@/registry/levi/lib/utils` | 消费者 `aliases.utils` |
   | `@/registry/levi/ui/xxx` / `@/ui/xxx` | 消费者 `aliases.ui + /xxx` |
   | `@/registry/levi/components/xxx` | 消费者 `aliases.components + /xxx` |
   | `@/registry/levi/hooks/xxx` | 消费者 `aliases.hooks + /xxx` |

3. **不要用 `@workspace/ui/*`**：CLI 将其视为"最终路径"原样保留，安装到外部项目后无法解析。
4. 文件落位由 `files[].type` 决定（registry:ui → aliases.ui，registry:lib → aliases.lib，依此类推）；可显式指定 `target` 覆盖。
5. **aliases 必须带 `@/` 前缀**；其中 **ui 段必须用独立别名 `@/ui`**（不是 `@/registry/levi/ui`）——后者命中 `@/registry/levi/*` 通配导致 CLI 落位到 `src/ui/`，详见「路径解析机制」。

## 路径映射配置（monorepo 三处，缺一不可）

- `packages/ui/tsconfig.json`：

```json
{
  "@/ui": ["./src/components"],      // 精确键：CLI 落位解析（base 全等匹配，唯一命中）
  "@/ui/*": ["./src/components/*"],  // import 解析：@/ui/button → src/components/button
  "@/registry/levi/*": ["./src/*"],  // 其他段：lib/utils、components、hooks
  "@workspace/ui/*": ["./src/*"]     // 兼容 apps/web 的 monorepo 内引用
}
```

- `apps/web/tsconfig.json`：`"@/registry/levi/*": ["../../packages/ui/src/*"]`（+ `@workspace/ui/*` 同向映射）
- 构建器侧：Next 的 transpilePackages + tsconfig paths（详见 [nextjs-migration.md](./nextjs-migration.md)）

> 为什么 ui 段用 `@/ui` 而不是 `@/registry/levi/ui`：见下节「路径解析机制」——后者命中 `@/registry/levi/*` 通配是排序机制决定的死结，tsconfig 键无法挽救。

## 路径解析机制（CLI 4.19.0 源码实测，2026-08-22）

### aliases → 物理目录的解析规则

CLI 落位时用 `tsconfig-paths` 的 `createMatchPath` 解析 aliases.ui 等字符串：

```js
createMatchPath(absoluteBaseUrl, paths)(alias, undefined, () => true, [".ts", ".tsx", ...])
```

第三个参数 `() => true` 是关键：**文件存在检查恒真**，候选路径生成后第一个匹配即返回，与磁盘实际状态无关。

tsconfig-paths 键匹配的三条规则（`mapping-entry.ts` / `try-path.ts`）：

1. 键按「最长前缀」排序，前缀长度 = 键中第一个 `*` 之前的字符数
2. **无 `*` 的键权重为 0**（`indexOf("*")` 为 -1，`substr(0, -1)` 返回空串）
3. `*` 至少匹配 1 个字符；pattern 比请求串长则直接不匹配

**推论（落位 bug 的根因）**：`@/registry/levi/ui` 必然命中 `@/registry/levi/*`（`*` = "ui" → 拼出 `src/ui`），精确键权重恒为 0、排序永远最后。键顺序、精确键都救不了——必须给 ui 段换一个脱离通配范围的独立别名 `@/ui`：base `@/ui` 只被自己的精确键匹配（`@/ui/*` 因尾斜杠不匹配、`@/registry/levi/*` 前缀不符），落位由「通配替换拼串」变成「精确查表」。

### 四步链路与验证点

| 环节 | 输入 → 输出 | 验证方法 |
|---|---|---|
| ① add 落位 | aliases.ui 解析 → 写入目录 | `add carousel -c packages/ui` 后确认文件在 `src/components/` |
| ② add import 重写 | 官方 `@/registry/<style>/ui/button` → `@/ui/button` | 看生成文件的 import 行 |
| ③ build | 源码 → `public/r/*.json` 内联 content | `pnpm registry:build` 后检查产物 import |
| ④ 消费者 add | 产物 → 消费者 aliases | 干净项目实测（见「端到端实测」） |

④ 的实测结果：产物中 `@/ui/button` 被消费者 CLI 识别为 ui 段，重写为消费者的 `aliases.ui + /button`；`@/registry/levi/lib/utils` → `aliases.utils`。build 不会把 `@/ui/...` 规范化为 registry 形式，但不需要——消费者端直接识别该段。

### 踩坑记录

| 坑 | 现象 | 根因 |
|---|---|---|
| aliases 用 `@workspace/ui/*` | add 生成 `@workspace/ui/...` import，消费者无法解析 | CLI 只重写 `@/` 前缀 |
| aliases 写 `@registry/...`（无斜杠） | 同上，原样保留 | CLI 只识别 `@/registry/...` 带斜杠形式 |
| tsconfig 加精确键 / 调键顺序 | 落位仍是 `src/ui/` | `@/registry/levi/ui` 命中 `levi/*` 是排序机制死结，与键顺序无关 |
| 组件意外落到 `src/ui/` 幽灵目录 | add 后文件不在 `src/components/` | 上述死结的产物，aliases.ui 改 `@/ui` 后消失 |

### 排查方法

1. **模拟解析实验**（最快，验证 aliases 字符串命中哪个键；`() => true` 是模拟 CLI 行为的关键，普通解析会因文件不存在返回 undefined，两者结果不同）：

```bash
node -e "
const tp = require('<repo>/node_modules/.pnpm/tsconfig-paths@4.2.0/node_modules/tsconfig-paths');
const m = tp.createMatchPath('<abs>/packages/ui', {
  '@/ui': ['./src/components'],
  '@/ui/*': ['./src/components/*'],
  '@/registry/levi/*': ['./src/*'],
  '@workspace/ui/*': ['./src/*']
}, ['main'], true);
for (const req of ['@/ui', '@/ui/button', '@/registry/levi/lib/utils']) {
  console.log(req.padEnd(36), '->', m(req, undefined, () => true, ['.ts', '.tsx']));
}
"
```

2. **查 CLI 源码**（机制不确定时）：dlx 缓存 `~/Library/Caches/pnpm/dlx/*/node_modules/.pnpm/shadcn@*/node_modules/shadcn/dist/chunk-CDOZT3OO.js`（压缩包，grep `resolvedPaths`、`loadConfig`、`createMatchPath`）；tsconfig-paths 包源码 `mapping-entry.ts`（排序）、`try-path.ts`（matchStar）。

3. **端到端实测**（最终验收）：

```bash
pnpm registry:build
python3 -m http.server 8787 -d packages/ui/public   # 另开终端
# 干净项目（/tmp/shadcn-test/app，components.json 已配 @levi registry）
npx shadcn@latest add @levi/<组件> --overwrite
# 检查：文件落位 + import 是否重写为消费者 aliases
```

### 修复流程

按链路逐环定位，别在错误的环上打补丁：

1. **落位错**（文件写错目录）→ 用模拟实验验证 aliases 字符串命中哪个键；命中通配键且 `*` 拼出的路径不对 → 换独立别名
2. **import 重写错**（生成 @workspace / 无斜杠 / 错段）→ 改 components.json 的 aliases 值（必须 `@/` 前缀，ui 段必须 `@/ui`）
3. **产物 import 错** → 查源码 import 段是否正确（build 只内联源码，不改 import）
4. **消费者端错** → 端到端实测复现，看重写结果与文件落位是否一致（ui 段 import 必须与 type=registry:ui 的落位段一致）

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
- [ ] 对外部署（GitHub Pages / Vercel）时更新命名空间 URL
