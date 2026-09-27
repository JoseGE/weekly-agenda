import { pdf } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import { ChurchCardPdfDocument } from '@/components/pdf/ChurchCardPdfDocument'
import { createEmptyCard } from '@/lib/card-utils'
import type { CardRichTextDocument } from '@/types'

describe('ChurchCardPdfDocument', () => {
  it('renders the reference-style rich formal card to a PDF', async () => {
    const bodyRich: CardRichTextDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { indent: 1 },
          content: [
            {
              type: 'text',
              text: 'Reciba un afectuoso saludo. Deseamos que el Señor derrame bendiciones sobre su vida y familia.',
              marks: [
                {
                  type: 'textStyle',
                  attrs: { fontFamily: 'Cormorant Garamond', fontSize: '14pt' },
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Texto en Source Sans 3 para exportación.',
              marks: [
                {
                  type: 'textStyle',
                  attrs: { fontFamily: 'Source Sans 3', fontSize: '12pt' },
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Texto en Playfair Display para exportación.',
              marks: [
                {
                  type: 'textStyle',
                  attrs: { fontFamily: 'Playfair Display', fontSize: '12pt' },
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: 'Tema: ', marks: [{ type: 'bold' }] },
            {
              type: 'text',
              text: 'Amarás a Dios sobre todas las cosas',
              marks: [
                { type: 'bold' },
                { type: 'textStyle', attrs: { color: '#b23a2b', fontSize: '18pt' } },
              ],
            },
          ],
        },
      ],
    }
    const card = {
      ...createEmptyCard('libre'),
      showTitle: false,
      recipientLabel: 'Distinguido Pastor:',
      recipient: 'Ezequiel Molina Rosario',
      body: 'Reciba un afectuoso saludo.\nTema: Amarás a Dios sobre todas las cosas',
      bodyRich,
      closing: 'Les saludan, atentamente:',
      signatures: [
        { id: '1', name: 'Martina de la Cruz', title: 'Fundadora' },
        { id: '2', name: 'Marisol Villar', title: 'Secretaria del concilio' },
        { id: '3', name: 'Zacarías Franco', title: 'Supervisor del Concilio' },
      ],
    }

    const blob = await pdf(
      <ChurchCardPdfDocument card={card} churchName="Iglesia Evangélica Pentecostal Central" />,
    ).toBlob()

    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(5_000)
  }, 20_000)

  it('paginates long rich letters naturally', async () => {
    const paragraphs = Array.from({ length: 56 }, (_, index) => ({
      type: 'paragraph' as const,
      attrs: { indent: index % 3 },
      content: [
        {
          type: 'text' as const,
          text: `Párrafo ${index + 1}: contenido de comprobación para una carta formal extensa con formato conservado entre páginas.`,
          marks: index % 4 === 0
            ? [{ type: 'textStyle' as const, attrs: { color: '#173d61', fontSize: '12pt' } }]
            : undefined,
        },
      ],
    }))
    const card = {
      ...createEmptyCard('libre'),
      body: paragraphs.map((paragraph) => paragraph.content[0].text).join('\n'),
      bodyRich: { type: 'doc' as const, content: paragraphs },
      signatures: [
        { id: '1', name: 'Martina de la Cruz', title: 'Fundadora' },
        { id: '2', name: 'Zacarías Franco', title: 'Supervisor del Concilio' },
      ],
    }

    const blob = await pdf(
      <ChurchCardPdfDocument card={card} churchName="Iglesia Evangélica Pentecostal Central" />,
    ).toBlob()
    const bytes = new Uint8Array(await blob.arrayBuffer())
    const pageCount = new TextDecoder('latin1').decode(bytes).match(/\/Type \/Page\b/g)?.length ?? 0

    expect(pageCount).toBeGreaterThan(1)
  }, 20_000)

  it('embeds the council seal when the card asks for it', async () => {
    const card = {
      ...createEmptyCard('agradecimiento'),
      showSeal: true,
      closing: 'Que Dios le retribuya abundantemente',
      signatures: [{ id: '1', name: 'Martina de la Cruz', title: 'Fundadora' }],
    }

    const blob = await pdf(
      <ChurchCardPdfDocument card={card} churchName="Iglesia Evangélica Pentecostal Central" />,
    ).toBlob()

    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(50_000)
  }, 20_000)
})
