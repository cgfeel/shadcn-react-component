import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'
import unusedImports from 'eslint-plugin-unused-imports'
import splitTypeImports from './split-type-imports.mjs'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      // 注意：不在这里注册 `import`——eslint-config-next 内部也注册同名插件，
      // 两个实例会报 Cannot redefine plugin。由 packages/ui 自行注册，
      // apps/web 复用 next 自带的实例。
      '@typescript-eslint': tseslint.plugin,
      perfectionist,
      'unused-imports': unusedImports,
      local: {
        rules: {
          'split-type-imports': splitTypeImports,
        },
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            './tsconfig.json',
            './apps/*/tsconfig.json',
            './packages/*/tsconfig.json',
          ],
        },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      'import/no-duplicates': 'error',
      'import/no-cycle': ['warn', { maxDepth: 3 }],
      'import/no-unresolved': 'error',
      'import/order': 'off',

      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 1,
          internalPattern: ['^@/', '^@workspace/'],
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
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          type: 'alphabetical',
          groups: ['value-import', 'type-import'],
        },
      ],
      'local/split-type-imports': 'warn',

      // 保存时自动删除未使用的导入/变量（官方 no-unused-vars 无 fixer，用它替代）
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
]
