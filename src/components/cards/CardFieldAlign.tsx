import { AlignCenter, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CardTextAlign } from '@/types'

interface CardFieldAlignProps {
  value: CardTextAlign
  onChange: (value: CardTextAlign) => void
}

export function CardFieldAlign({ value, onChange }: CardFieldAlignProps) {
  return (
    <div className="flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
      <button
        type="button"
        title="Alinear a la izquierda"
        aria-label="Alinear a la izquierda"
        aria-pressed={value === 'left'}
        onClick={() => onChange('left')}
        className={cn(
          'rounded p-1 text-stone-500 transition-colors',
          value === 'left' && 'bg-white text-navy-dark shadow-sm',
        )}
      >
        <AlignLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Centrar"
        aria-label="Centrar"
        aria-pressed={value === 'center'}
        onClick={() => onChange('center')}
        className={cn(
          'rounded p-1 text-stone-500 transition-colors',
          value === 'center' && 'bg-white text-navy-dark shadow-sm',
        )}
      >
        <AlignCenter className="h-4 w-4" />
      </button>
    </div>
  )
}
