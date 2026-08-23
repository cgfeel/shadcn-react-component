import { defineConfig, globalIgnores } from 'eslint/config'
import baseConfig from './eslint.config.base.mjs'

export default defineConfig([
  ...baseConfig,
  globalIgnores([
    '**/dist/**',
    '**/*.json',
    // 配置文件与工具脚本不参与 lint
    'eslint.config.js',
    'eslint.config.base.mjs',
    'split-type-imports.mjs',
  ]),
])
