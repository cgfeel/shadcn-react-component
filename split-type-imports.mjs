export default {
  meta: {
    type: 'layout',

    docs: {
      description:
        'Split inline type specifiers into a separate import type declaration',
    },

    fixable: 'code',

    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode

    /** `imported.name`, plus `as local` when aliased */
    function renderNamedSpecifier(specifier) {
      const { imported, local } = specifier
      return local.name === imported.name
        ? imported.name
        : `${imported.name} as ${local.name}`
    }

    function renderImportClause(specifiers) {
      const parts = []
      let defaultSpecifier = null
      let namespaceSpecifier = null
      const named = []

      for (const specifier of specifiers) {
        if (specifier.type === 'ImportDefaultSpecifier') {
          defaultSpecifier = specifier
        } else if (specifier.type === 'ImportNamespaceSpecifier') {
          namespaceSpecifier = specifier
        } else {
          named.push(specifier)
        }
      }

      if (defaultSpecifier) parts.push(defaultSpecifier.local.name)
      if (namespaceSpecifier) parts.push(`* as ${namespaceSpecifier.local.name}`)
      if (named.length) {
        parts.push(`{ ${named.map(renderNamedSpecifier).join(', ')} }`)
      }

      return parts.join(', ')
    }

    return {
      ImportDeclaration(node) {
        // 只处理 value import 里的内联 `type X` 声明
        if (node.importKind !== 'value') {
          return
        }

        const typeSpecifiers = []
        const valueSpecifiers = []

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.importKind === 'type'
          ) {
            typeSpecifiers.push(specifier)
          } else {
            valueSpecifiers.push(specifier)
          }
        }

        // 纯 inline type 的 value import（如删掉 value 后遗留的形态），升级为 import type
        if (typeSpecifiers.length && !valueSpecifiers.length) {
          context.report({
            node,

            message: 'Convert value import with only type specifiers to import type',

            fix(fixer) {
              const source = node.source.raw

              const typeText = [
                'import type { ',
                typeSpecifiers.map(renderNamedSpecifier).join(', '),
                ` } from ${source}`,
              ].join('')

              return fixer.replaceText(node, typeText)
            },
          })
          return
        }

        // 没有混合，不处理
        if (!typeSpecifiers.length || !valueSpecifiers.length) {
          return
        }

        context.report({
          node,

          message: 'Split type imports and value imports',

          fix(fixer) {
            const source = node.source.raw

            const typeText = [
              'import type { ',
              typeSpecifiers.map(renderNamedSpecifier).join(', '),
              ` } from ${source}`,
            ].join('')

            const valueText = `import ${renderImportClause(valueSpecifiers)} from ${source}`

            return fixer.replaceText(node, `${typeText}\n${valueText}`)
          },
        })
      },
    }
  },
}
