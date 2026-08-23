import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import reactRefresh from 'eslint-plugin-react-refresh'
import baseConfig from '../../eslint.config.base.mjs'

export default defineConfig([
  ...baseConfig,
  reactRefresh.configs.vite,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // ui 是组件库，不直接被 Vite dev 运行；shadcn 模式（组件 + cva variants 同文件导出）与该规则冲突
      'react-refresh/only-export-components': 'off',
      // shadcn 官方模板大量使用「effect 内同步初始化受控状态」模式，逐个豁免不现实；
      // 应用代码（apps/web）不受影响，规则在那边仍生效
      // 'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores(['dist', 'eslint.config.js']),
])
