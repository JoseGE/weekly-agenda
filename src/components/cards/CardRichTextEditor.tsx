import { useMemo } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Redo2,
  RotateCcw,
  Underline,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardParagraphIndent, changeCardEditorIndent } from '@/lib/card-editor-extensions'
import {
  CARD_COLOR_PRESETS,
  CARD_FONT_FAMILIES,
  CARD_FONT_SIZES_PT,
  cardRichTextToPlainText,
  normalizeCardColor,
  sanitizeCardRichTextDocument,
} from '@/lib/card-rich-text'
import { cn } from '@/lib/utils'
import type { CardRichTextDocument } from '@/types'

interface CardRichTextEditorProps {
  value: CardRichTextDocument
  onChange: (document: CardRichTextDocument, plainText: string) => void
}

function ToolbarButton({
  active = false,
  label,
  disabled,
  onClick,
  children,
}: {
  active?: boolean
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="icon"
      className="h-8 w-8"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function colorContrastRatio(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
  const luminance = channels.reduce((sum, channel, index) => {
    const linear = channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    return sum + linear * [0.2126, 0.7152, 0.0722][index]
  }, 0)
  return 1.05 / (luminance + 0.05)
}

export function CardRichTextEditor({ value, onChange }: CardRichTextEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        link: false,
        strike: false,
      }),
      TextStyleKit.configure({
        backgroundColor: false,
        lineHeight: false,
      }),
      TextAlign.configure({ types: ['paragraph'], alignments: ['left', 'center', 'right'] }),
      CardParagraphIndent,
    ],
    [],
  )

  const editor = useEditor({
    extensions,
    content: sanitizeCardRichTextDocument(value),
    editorProps: {
      attributes: {
        class:
          'card-rich-editor min-h-64 px-4 py-4 text-[12pt] leading-relaxed text-stone-800 focus:outline-none',
        role: 'textbox',
        'aria-label': 'Mensaje de la carta',
        'aria-multiline': 'true',
      },
      transformPastedHTML: (html) => html.replace(/<(img|video|audio|iframe)[^>]*>/gi, ''),
    },
    onUpdate: ({ editor: currentEditor }) => {
      const document = sanitizeCardRichTextDocument(currentEditor.getJSON())
      onChange(document, cardRichTextToPlainText(document))
    },
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null
      const textStyle = currentEditor.getAttributes('textStyle')
      return {
        bold: currentEditor.isActive('bold'),
        italic: currentEditor.isActive('italic'),
        underline: currentEditor.isActive('underline'),
        bulletList: currentEditor.isActive('bulletList'),
        orderedList: currentEditor.isActive('orderedList'),
        left: currentEditor.isActive({ textAlign: 'left' }),
        center: currentEditor.isActive({ textAlign: 'center' }),
        right: currentEditor.isActive({ textAlign: 'right' }),
        fontFamily: (textStyle.fontFamily as string | undefined) ?? '',
        fontSize: Number.parseFloat(textStyle.fontSize ?? '') || 12,
        color: normalizeCardColor(textStyle.color) ?? '#292524',
        canUndo: currentEditor.can().chain().focus().undo().run(),
        canRedo: currentEditor.can().chain().focus().redo().run(),
      }
    },
  })

  if (!editor || !state) {
    return <div className="h-64 animate-pulse rounded-xl border border-stone-200 bg-stone-50" />
  }

  const setFontSize = (value: number) => {
    const next = Math.min(48, Math.max(8, value))
    editor.chain().focus().setFontSize(`${next}pt`).run()
  }
  const setColor = (value: string) => {
    const next = normalizeCardColor(value)
    if (next) editor.chain().focus().setColor(next).run()
  }
  const lowContrast = colorContrastRatio(state.color) < 4.5

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm focus-within:border-church-gold/60 focus-within:ring-2 focus-within:ring-church-gold/15">
      <div className="space-y-2 border-b border-stone-200 bg-gradient-to-b from-stone-50 to-white p-2">
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton active={state.bold} label="Negrita" onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={state.italic} label="Cursiva" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={state.underline} label="Subrayado" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Underline className="h-4 w-4" />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-stone-200" aria-hidden />

          <select
            aria-label="Tipografía"
            value={state.fontFamily}
            onChange={(event) => {
              if (event.target.value) {
                editor.chain().focus().setFontFamily(event.target.value).run()
              } else {
                editor.chain().focus().unsetFontFamily().run()
              }
            }}
            className="h-8 min-w-32 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-church-gold"
          >
            <option value="">Tipografía base</option>
            {CARD_FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>

          <select
            aria-label="Tamaño de texto predefinido"
            value={CARD_FONT_SIZES_PT.includes(state.fontSize) ? state.fontSize : ''}
            onChange={(event) => event.target.value && setFontSize(Number(event.target.value))}
            className="h-8 w-20 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-church-gold"
          >
            <option value="">Tamaño</option>
            {CARD_FONT_SIZES_PT.map((size) => (
              <option key={size} value={size}>{size} pt</option>
            ))}
          </select>
          <label className="flex h-8 items-center gap-1 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-500">
            <span>pt</span>
            <input
              aria-label="Tamaño de texto personalizado"
              type="number"
              min={8}
              max={48}
              value={state.fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              className="w-10 bg-transparent text-stone-800 outline-none"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {CARD_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-label={`Color ${preset.label}`}
              title={preset.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setColor(preset.value)}
              className={cn(
                'h-7 w-7 rounded-full border-2 shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-church-gold',
                state.color === preset.value ? 'border-stone-900' : 'border-white ring-1 ring-stone-200',
              )}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          <label className="relative flex h-8 items-center gap-2 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-600">
            <span>Color</span>
            <input
              aria-label="Color personalizado"
              type="color"
              value={state.color}
              onChange={(event) => setColor(event.target.value)}
              className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>

          <span className="mx-1 h-6 w-px bg-stone-200" aria-hidden />

          <ToolbarButton active={state.left} label="Alinear a la izquierda" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={state.center} label="Centrar" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={state.right} label="Alinear a la derecha" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={state.bulletList} label="Lista con viñetas" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={state.orderedList} label="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Disminuir sangría" onClick={() => changeCardEditorIndent(editor, -1)}>
            <IndentDecrease className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Aumentar sangría" onClick={() => changeCardEditorIndent(editor, 1)}>
            <IndentIncrease className="h-4 w-4" />
          </ToolbarButton>

          <span className="mx-1 h-6 w-px bg-stone-200" aria-hidden />

          <ToolbarButton label="Deshacer" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Rehacer" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Quitar formato de texto" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
            <Eraser className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Restablecer párrafo" onClick={() => editor.chain().focus().setParagraph().setTextAlign('left').run()}>
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {lowContrast ? (
          <p className="text-xs text-amber-700" role="status">
            Este color puede tener poco contraste sobre el papel claro.
          </p>
        ) : null}
      </div>

      <EditorContent editor={editor} />
      <p className="border-t border-stone-100 px-3 py-2 text-[11px] text-stone-400">
        Tab y Shift+Tab ajustan la sangría. Presiona Escape antes de Tab para salir del editor.
      </p>
    </div>
  )
}
