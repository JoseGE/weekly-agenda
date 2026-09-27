import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { afterEach, describe, expect, it } from 'vitest'
import { CardParagraphIndent, changeCardEditorIndent } from '@/lib/card-editor-extensions'

let editor: Editor | null = null

afterEach(() => {
  editor?.destroy()
  editor = null
})

describe('formal card editor commands', () => {
  it('applies inline formatting, color, size, family and alignment', () => {
    editor = new Editor({
      extensions: [
        StarterKit.configure({ heading: false }),
        TextStyleKit,
        TextAlign.configure({ types: ['paragraph'], alignments: ['left', 'center', 'right'] }),
        CardParagraphIndent,
      ],
      content: '<p>Texto formal</p>',
    })

    editor.commands.setTextSelection({ from: 1, to: 6 })
    editor.chain().focus().toggleBold().toggleItalic().toggleUnderline().setColor('#b23a2b').setFontSize('18pt').setFontFamily('Playfair Display').run()
    editor.chain().focus().setTextAlign('center').run()

    const json = editor.getJSON()
    expect(json.content?.[0].attrs?.textAlign).toBe('center')
    expect(json.content?.[0].content?.[0].marks?.map((mark) => mark.type)).toEqual(
      expect.arrayContaining(['bold', 'italic', 'underline', 'textStyle']),
    )
  })

  it('indents and outdents ordinary paragraphs within limits', () => {
    editor = new Editor({
      extensions: [StarterKit.configure({ heading: false }), CardParagraphIndent],
      content: '<p>Párrafo</p>',
    })
    editor.commands.setTextSelection(2)

    expect(changeCardEditorIndent(editor, 1)).toBe(true)
    expect(editor.getJSON().content?.[0].attrs?.indent).toBe(1)
    for (let index = 0; index < 10; index += 1) changeCardEditorIndent(editor, 1)
    expect(editor.getJSON().content?.[0].attrs?.indent).toBe(6)
    for (let index = 0; index < 10; index += 1) changeCardEditorIndent(editor, -1)
    expect(editor.getJSON().content?.[0].attrs?.indent).toBe(0)
  })

  it('creates supported lists', () => {
    editor = new Editor({
      extensions: [StarterKit.configure({ heading: false }), CardParagraphIndent],
      content: '<p>Primero</p><p>Segundo</p>',
    })
    editor.commands.selectAll()

    expect(editor.chain().focus().toggleBulletList().run()).toBe(true)
    expect(editor.getJSON().content?.[0].type).toBe('bulletList')
    expect(editor.chain().focus().toggleBulletList().toggleOrderedList().run()).toBe(true)
    expect(editor.getJSON().content?.[0].type).toBe('orderedList')
  })

  it('uses Tab for indentation and Escape followed by Tab to leave the editor', () => {
    editor = new Editor({
      extensions: [StarterKit.configure({ heading: false }), CardParagraphIndent],
      content: '<p>Párrafo</p>',
    })
    editor.commands.setTextSelection(2)

    expect(editor.commands.keyboardShortcut('Tab')).toBe(true)
    expect(editor.getJSON().content?.[0].attrs?.indent).toBe(1)
    expect(editor.commands.keyboardShortcut('Shift-Tab')).toBe(true)
    expect(editor.getJSON().content?.[0].attrs?.indent).toBe(0)
    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    const exitTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    editor.view.dom.dispatchEvent(exitTab)

    expect(exitTab.defaultPrevented).toBe(false)
    expect(editor.getJSON().content?.[0].attrs?.indent).toBe(0)
  })
})
