import { Bold, Italic, Palette, RotateCcw, Underline } from 'lucide-react'
import { CardFieldAlign } from '@/components/cards/CardFieldAlign'
import { Button } from '@/components/ui/button'
import {
  CARD_COLOR_PRESETS,
  CARD_FONT_FAMILIES,
  CARD_FONT_SIZES_PT,
  normalizeCardColor,
} from '@/lib/card-rich-text'
import type { ResolvedCardTextStyle } from '@/lib/card-text-styles'
import type { CardTextAlign, CardTextStyle } from '@/types'
import { cn } from '@/lib/utils'

interface CardSectionStyleControlsProps {
  label: string
  style?: CardTextStyle
  resolved: ResolvedCardTextStyle
  align: CardTextAlign
  onStyleChange: (style: CardTextStyle | undefined) => void
  onAlignChange: (align: CardTextAlign) => void
}

function contrastRatio(hex: string): number {
  const coefficients = [0.2126, 0.7152, 0.0722]
  const luminance = [1, 3, 5].reduce((sum, start, index) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255
    const channel = value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    return sum + channel * coefficients[index]
  }, 0)
  return 1.05 / (luminance + 0.05)
}

export function CardSectionStyleControls({
  label,
  style,
  resolved,
  align,
  onStyleChange,
  onAlignChange,
}: CardSectionStyleControlsProps) {
  const update = (updates: Partial<CardTextStyle>) => onStyleChange({ ...style, ...updates })
  const lowContrast = contrastRatio(resolved.color) < 4.5

  return (
    <details className="group rounded-lg border border-stone-200/80 bg-stone-50/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-stone-600 marker:hidden">
        <span className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-church-gold" />
          Estilo de {label.toLowerCase()}
        </span>
        <span className="text-[11px] font-normal text-stone-400 group-open:hidden">
          {Math.round(resolved.fontSizePt)} pt
        </span>
      </summary>

      <div className="space-y-3 border-t border-stone-200/70 px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={`Tipografía de ${label.toLowerCase()}`}
            value={style?.fontFamily ?? ''}
            onChange={(event) => update({ fontFamily: event.target.value ? event.target.value as CardTextStyle['fontFamily'] : undefined })}
            className="h-8 min-w-32 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-church-gold"
          >
            <option value="">Tipografía base</option>
            {CARD_FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
          <select
            aria-label={`Tamaño predefinido de ${label.toLowerCase()}`}
            value={style?.fontSizePt && CARD_FONT_SIZES_PT.includes(style.fontSizePt) ? style.fontSizePt : ''}
            onChange={(event) => event.target.value && update({ fontSizePt: Number(event.target.value) })}
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
              aria-label={`Tamaño personalizado de ${label.toLowerCase()}`}
              type="number"
              min={8}
              max={48}
              value={style?.fontSizePt ?? Math.round(resolved.fontSizePt)}
              onChange={(event) => update({ fontSizePt: Math.min(48, Math.max(8, Number(event.target.value))) })}
              className="w-10 bg-transparent text-stone-800 outline-none"
            />
          </label>

          <Button
            type="button"
            variant={resolved.bold ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            aria-label={`Negrita en ${label.toLowerCase()}`}
            onClick={() => update({ bold: !resolved.bold })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={resolved.italic ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            aria-label={`Cursiva en ${label.toLowerCase()}`}
            onClick={() => update({ italic: !resolved.italic })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={resolved.underline ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            aria-label={`Subrayado en ${label.toLowerCase()}`}
            onClick={() => update({ underline: !resolved.underline })}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <CardFieldAlign value={align} onChange={onAlignChange} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CARD_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-label={`${label}: color ${preset.label}`}
              title={preset.label}
              onClick={() => update({ color: preset.value })}
              className={cn(
                'h-7 w-7 rounded-full border-2 shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-church-gold',
                resolved.color === preset.value ? 'border-stone-900' : 'border-white ring-1 ring-stone-200',
              )}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          <label className="flex h-8 items-center gap-2 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-600">
            Personalizado
            <input
              aria-label={`Color personalizado de ${label.toLowerCase()}`}
              type="color"
              value={normalizeCardColor(style?.color) ?? resolved.color}
              onChange={(event) => update({ color: event.target.value })}
              className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => onStyleChange(undefined)}>
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer
          </Button>
        </div>

        {lowContrast ? (
          <p className="text-xs text-amber-700" role="status">
            Este color puede tener poco contraste sobre el papel claro.
          </p>
        ) : null}
      </div>
    </details>
  )
}
