import { describe, expect, it } from 'vitest'
import { createEmptyCard, duplicateChurchCard } from '@/lib/card-utils'

describe('duplicateChurchCard', () => {
  it('copies the letter with a new id and independent signatures', () => {
    const source = {
      ...createEmptyCard('bienvenida'),
      title: 'Convención General',
      recipient: 'Ezequiel Molina Rosario',
      showSeal: true,
      showTemplateBadge: false,
      signatures: [
        { id: 'sig-1', name: 'Martina de la Cruz', title: 'Fundadora' },
        { id: 'sig-2', name: 'Zacarías Franco', title: 'Supervisor del Concilio' },
      ],
    }

    const copy = duplicateChurchCard(source)

    expect(copy.id).not.toBe(source.id)
    expect(copy.title).toBe('Convención General (copia)')
    expect(copy.recipient).toBe(source.recipient)
    expect(copy.body).toBe(source.body)
    expect(copy.showSeal).toBe(true)
    expect(copy.showTemplateBadge).toBe(false)
    expect(copy.signatures?.map((signature) => signature.id)).not.toEqual(['sig-1', 'sig-2'])
    expect(copy.signatures?.map((signature) => signature.name)).toEqual([
      'Martina de la Cruz',
      'Zacarías Franco',
    ])
    expect(source.title).toBe('Convención General')
    expect(source.signatures?.[0].id).toBe('sig-1')
  })
})