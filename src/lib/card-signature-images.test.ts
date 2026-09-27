import { describe, expect, it } from 'vitest'
import { getSignatureImageSrc } from '@/lib/card-signature-images'

describe('getSignatureImageSrc', () => {
  it('matches the leader signature images by name', () => {
    expect(getSignatureImageSrc('Martina de la Cruz')).toBeTruthy()
    expect(getSignatureImageSrc('Marisol Alt. Villar de Ferrer')).toBeTruthy()
    expect(getSignatureImageSrc('Zacarías Franco')).toBeTruthy()
    expect(getSignatureImageSrc('José García')).toBeUndefined()
  })
})