import { describe, expect, it } from 'vitest'
import {
  cardRichTextToPlainText,
  formatCardRecipientLine,
  legacyCardBodyToRichText,
  sanitizeCardRichTextDocument,
  shouldShowCardTitle,
} from '@/lib/card-rich-text'

describe('card rich text document', () => {
  it('sanitizes nodes, marks and bounded attributes', () => {
    const document = sanitizeCardRichTextDocument({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify', indent: 99 },
          content: [
            {
              type: 'text',
              text: 'Tema',
              marks: [
                { type: 'bold' },
                {
                  type: 'textStyle',
                  attrs: {
                    color: '#ABCDEF',
                    fontSize: '90pt',
                    fontFamily: 'Comic Sans',
                  },
                },
                { type: 'link', attrs: { href: 'https://example.com' } },
              ],
            },
          ],
        },
        { type: 'image', attrs: { src: 'bad' } },
      ],
    })

    expect(document.content).toHaveLength(1)
    expect(document.content?.[0].attrs).toEqual({ indent: 6 })
    expect(document.content?.[0].content?.[0].marks).toEqual([
      { type: 'bold' },
      { type: 'textStyle', attrs: { color: '#abcdef', fontSize: '48pt' } },
    ])
  })

  it('converts legacy bold, lists, indentation and alignment', () => {
    const document = legacyCardBodyToRichText(
      '**Saludo**\n\n- Primero\n  - Segundo\n  Párrafo con sangría',
      'center',
    )

    expect(document.content?.[0].attrs?.textAlign).toBe('center')
    expect(document.content?.[0].content?.[0].marks).toEqual([{ type: 'bold' }])
    expect(document.content?.[2].type).toBe('bulletList')
    expect(document.content?.[3].attrs).toEqual({ textAlign: 'center', indent: 1 })
  })

  it('creates a readable plain-text representation', () => {
    const document = legacyCardBodyToRichText('Mensaje\n\n1. Uno\n2. Dos')
    expect(cardRichTextToPlainText(document)).toContain('Mensaje')
    expect(cardRichTextToPlainText(document)).toContain('1. Uno')
    expect(cardRichTextToPlainText(document)).toContain('2. Dos')
  })
})

describe('formal card helpers', () => {
  it('formats configurable recipient labels', () => {
    expect(formatCardRecipientLine({ recipient: 'Ana' })).toBe('Para: Ana')
    expect(
      formatCardRecipientLine({ recipientLabel: 'Distinguido Pastor:', recipient: 'Ezequiel' }),
    ).toBe('Distinguido Pastor: Ezequiel')
    expect(formatCardRecipientLine({ recipientLabel: '', recipient: 'Iglesia Central' })).toBe(
      'Iglesia Central',
    )
  })

  it('keeps title visible by default and honors the visibility switch', () => {
    expect(shouldShowCardTitle({})).toBe(true)
    expect(shouldShowCardTitle({ showTitle: false })).toBe(false)
  })
})
