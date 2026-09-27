import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CardRichTextEditor } from '@/components/cards/CardRichTextEditor'

describe('CardRichTextEditor', () => {
  it('exposes the requested formatting controls and accessible editor', () => {
    render(
      <CardRichTextEditor
        value={{ type: 'doc', content: [{ type: 'paragraph' }] }}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Mensaje de la carta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Negrita' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aumentar sangría' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tipografía')).toBeInTheDocument()
    expect(screen.getByLabelText('Color personalizado')).toBeInTheDocument()
  })
})
