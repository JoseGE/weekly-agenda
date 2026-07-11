import type { RefObject } from 'react'
import { Bold, IndentDecrease, IndentIncrease, List } from 'lucide-react'
import {
  indentTextareaBulletLines,
  prefixTextareaLines,
  wrapTextareaSelection,
} from '@/lib/card-body-format'
import { Button } from '@/components/ui/button'

interface CardBodyFormatToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onChange: (value: string) => void
}

export function CardBodyFormatToolbar({ textareaRef, onChange }: CardBodyFormatToolbarProps) {
  const applyBold = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    onChange(wrapTextareaSelection(textarea, '**', '**'))
  }

  const applyBullet = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    onChange(prefixTextareaLines(textarea, '- '))
  }

  const applyIndent = (direction: 1 | -1) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { value, selectionStart, selectionEnd } = indentTextareaBulletLines(textarea, direction)
    onChange(value)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button type="button" variant="outline" size="sm" onClick={applyBold} title="Negrita">
        <Bold className="h-4 w-4" />
        Negrita
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={applyBullet} title="Viñeta">
        <List className="h-4 w-4" />
        Viñeta
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => applyIndent(1)}
        title="Sub-viñeta (aumentar sangría)"
      >
        <IndentIncrease className="h-4 w-4" />
        Sub-viñeta
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => applyIndent(-1)}
        title="Disminuir sangría"
      >
        <IndentDecrease className="h-4 w-4" />
      </Button>
      <span className="text-xs text-stone-400">
        También: <code className="rounded bg-stone-100 px-1">**negrita**</code>,{' '}
        <code className="rounded bg-stone-100 px-1">- viñeta</code>, y{' '}
        <code className="rounded bg-stone-100 px-1">Tab</code> para sub-viñetas
      </span>
    </div>
  )
}
