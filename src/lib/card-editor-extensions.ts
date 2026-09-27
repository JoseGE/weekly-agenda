import { Extension, type Editor } from '@tiptap/core'
import { CARD_INDENT_MAX } from '@/lib/card-rich-text'

export function changeCardEditorIndent(editor: Editor, delta: 1 | -1): boolean {
  if (editor.isActive('listItem')) {
    return delta > 0
      ? editor.chain().focus().sinkListItem('listItem').run()
      : editor.chain().focus().liftListItem('listItem').run()
  }

  const { state, view } = editor
  const { from, to } = state.selection
  const transaction = state.tr
  let changed = false

  state.doc.nodesBetween(from, to, (node, position) => {
    if (node.type.name !== 'paragraph') return true
    const current = Number(node.attrs.indent ?? 0)
    const next = Math.min(CARD_INDENT_MAX, Math.max(0, current + delta))
    if (next !== current) {
      transaction.setNodeMarkup(position, undefined, { ...node.attrs, indent: next })
      changed = true
    }
    return false
  })

  if (!changed) return false
  view.dispatch(transaction)
  return true
}

export const CardParagraphIndent = Extension.create<Record<string, never>, { allowTabExit: boolean }>({
  name: 'cardParagraphIndent',

  addStorage() {
    return { allowTabExit: false }
  },

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const value = Number(element.getAttribute('data-indent') ?? 0)
              return Number.isFinite(value) ? Math.min(CARD_INDENT_MAX, Math.max(0, value)) : 0
            },
            renderHTML: (attributes) => {
              const indent = Number(attributes.indent ?? 0)
              if (!indent) return {}
              return {
                'data-indent': String(indent),
                style: `margin-inline-start: ${indent * 1.5}em`,
              }
            },
          },
        },
      },
    ]
  },

  addKeyboardShortcuts() {
    return {
      Escape: () => {
        this.storage.allowTabExit = true
        return false
      },
      Tab: () => {
        if (this.storage.allowTabExit) {
          this.storage.allowTabExit = false
          return false
        }
        return changeCardEditorIndent(this.editor, 1)
      },
      'Shift-Tab': () => {
        if (this.storage.allowTabExit) {
          this.storage.allowTabExit = false
          return false
        }
        return changeCardEditorIndent(this.editor, -1)
      },
    }
  },
})
