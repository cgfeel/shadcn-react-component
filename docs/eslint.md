# ESLint 配置与 Type Import 自动拆分

本文档记录本 monorepo 的 ESLint 配置演进(2026-08-22 落定):type import 自动拆分、未使用导入自动删除、保存时自动修复,以及过程中的关键决策与踩坑。

## 需求

1. 保存时自动把混合导入拆成 type 单独一行:

   ```ts
   // 保存前
   import { clsx, type ClassValue } from "clsx"

   // 保存后（type 组在前，与 value 组之间 1 空行；value 组内无空行）
   import type { ClassValue } from "clsx"

   import { clsx } from "clsx"
   ```

2. 保存时自动删除未使用的导入(未使用的局部变量/参数只警告不删除,`_` 前缀豁免)。

## 规则分工

| 规则 | 职责 |
|---|---|
| `local/split-type-imports`(自定义,`split-type-imports.mjs`) | 拆分内联 `type X` 声明;纯 inline type 的 value import 升级为 `import type` |
| `@typescript-eslint/consistent-type-imports`(`separate-type-imports`) | 把「值导入当纯类型使用」的转成 `import type` |
| `unused-imports/no-unused-imports` | 删除未使用导入(官方 `no-unused-vars` 无 fixer,故引入此插件;tseslint 同名规则已关闭避免双报) |
| `perfectionist/sort-imports` + `sort-named-imports` | 排序:type 组在前、组间 1 空行、组内字母序 |
| `reactRefresh.configs.vite` | 仅 packages/ui(Vite 消费场景),不在 base |

两规则必须互补:**`consistent-type-imports` 不会拆混合导入里的内联 `type X` 声明**——它只在「值导入被当纯类型使用」时触发(typescript-eslint #11010、#6338,实测确认)。纯 inline-type 场景只能靠自定义规则。

## 关键决策与依据

### 1. ESLint 从 10 降级到 9.39.4

`eslint-plugin-react`(eslint-config-next@16 的依赖)至今没有发布支持 ESLint 10 的版本(修复 PR #3979 未合并),web 侧 lint 和 VS Code 扩展必然崩溃(`contextOrFilename.getFilename is not a function`)。这不是配置能绕过的,全仓降级 9 是唯一可靠路径。附带影响:

- ESLint 9 按 cwd 查找配置(没有 10 的按文件查找),所以**根目录必须有 `eslint.config.js`**(见下),VS Code 扩展需要 `eslint.workingDirectories`。
- `eslint-plugin-unused-imports` 的 peer 声明到 ^9,降级后正好消除 peer 警告。

### 2. `import` 插件不能注册在 base config

`eslint-config-next` 内部也注册 `import` 插件,两个实例同名会报 `Cannot redefine plugin "import"`。处理:base config 不注册,`packages/ui` 自行注册,`apps/web` 复用 next 实例。

### 3. perfectionist v5 语法破坏性变更(旧 v4 配置直接 schema 报错)

- `newlinesBetween` 是数字(空行数)或 `'ignore'`,不是 `'always'/'never'`
- `sort-imports` 组名从 `builtin-type` 改为 `<modifier>-<selector>` 组合(如 `type-external`、`value-sibling`)
- `sort-named-imports` 的 `groupKind: 'values-first'` 已移除,改为 `groups: ['value-import', 'type-import']`

组间空行的精确控制:默认 `newlinesBetween: 1` 会对**所有组边界**生效(没有 type 导入时 value 的 external/internal/sibling 子组之间也会空行)。要「仅 type→value 边界空行、value 子组间不空行」,用**空行指令元素**插在组之间:

```js
groups: [
  'type-import',
  { newlinesBetween: 1 },
  ['value-builtin', 'value-external'],
  { newlinesBetween: 0 },
  'value-internal',
  { newlinesBetween: 0 },
  ['value-parent', 'value-sibling', 'value-index'],
  { newlinesBetween: 1 },
  'ts-equals-import',
  { newlinesBetween: 1 },
  'unknown',
],
```

### 4. packages/ui 关闭的两条规则

| 规则 | 关闭理由 |
|---|---|
| `react-refresh/only-export-components` | ui 是组件库,不被 Vite dev 直接运行(Fast Refresh 检查无意义);shadcn 的「组件 + cva variants 同文件导出」模式与该规则天然冲突 |
| `react-hooks/set-state-in-effect` | react-hooks v7 新增规则,shadcn 官方模板大量使用「effect 内同步初始化受控状态」(如 carousel),逐个豁免不现实 |

这两条在 apps/web 仍然生效——应用业务代码保留检查价值。原则:ui 包按组件库规则走(模板代码原样、无噪音),web 按应用标准走。

### 5. pnpm 孤儿 `.bin` shim

降级 eslint 后,`packages/ui`、`apps/web` 的 `node_modules/.bin/eslint` 残留 shell shim 指向已废弃的 `eslint@10.4.0`,导致子包 `pnpm exec eslint` 仍跑 10。`pnpm install --force` 无法清除(不认为它是自己的产物),需手动删 `*/node_modules/.bin/eslint` 和 `.pnpm/eslint@10.4.0_*` 孤儿目录后重新 install。

## VS Code 侧(保存自动修复的前提)

1. 必须安装扩展 `dbaeumer.vscode-eslint`(`.vscode/extensions.json` 已加推荐清单)。`source.fixAll.eslint` 只是声明,没有扩展就没有执行者。
2. `.vscode/settings.json` 关键配置:

   ```json
   "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
   "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
   "eslint.workingDirectories": [
     { "pattern": "./apps/*/" },
     { "pattern": "./packages/*/" }
   ]
   ```

3. 改了 eslint.config.* 后如果编辑器不生效,执行 `Cmd+Shift+P` → **ESLint: Restart ESLint Server** 或 Reload Window;仍不行看 Output 面板的 ESLint 频道日志。

## 验证命令

```bash
pnpm --dir packages/ui exec eslint . --fix   # ui 全包修复
pnpm --dir apps/web exec eslint src          # web 检查
pnpm exec eslint .                           # 根(仅根目录文件)
```

## 涉及文件

- `eslint.config.js`(根,新建;ESLint 9 需要根级 config)
- `eslint.config.base.mjs`(共享:tseslint、react-hooks、import 规则、perfectionist、unused-imports、自定义规则)
- `split-type-imports.mjs`(自定义规则,注意:产出 type import 时按 `imported/local` 名重建,不能用 `getText` 会带出 `type` 关键字)
- `packages/ui/eslint.config.js`(import 插件注册、reactRefresh、两条关闭的规则)
- `apps/web/eslint.config.mjs`(next 配置 + base;`eslint.config.mjs` 自身加入 ignore)
- `.vscode/settings.json`、`.vscode/extensions.json`
