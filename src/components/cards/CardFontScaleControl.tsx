import { Minus, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  CARD_FONT_SCALE_MAX,
  CARD_FONT_SCALE_MIN,
  clampCardFontScale,
  formatCardFontScaleLabel,
} from '@/lib/card-font-scale'

interface CardFontScaleControlProps {
  value: number
  onChange: (value: number) => void
}

export function CardFontScaleControl({ value, onChange }: CardFontScaleControlProps) {
  const adjust = (delta: number) => {
    onChange(clampCardFontScale(Math.round((value + delta) * 100) / 100))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200/80 bg-stone-50 px-3 py-2">
      <Label htmlFor="card-font-scale" className="shrink-0 text-sm font-medium text-stone-600">
        Tamaño de letra
      </Label>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => adjust(-0.05)}
        disabled={value <= CARD_FONT_SCALE_MIN}
        aria-label="Reducir tamaño de letra"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <input
        id="card-font-scale"
        type="range"
        min={CARD_FONT_SCALE_MIN}
        max={CARD_FONT_SCALE_MAX}
        step={0.05}
        value={value}
        onChange={(event) => onChange(clampCardFontScale(Number(event.target.value)))}
        className="w-24 accent-church-gold sm:w-32"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => adjust(0.05)}
        disabled={value >= CARD_FONT_SCALE_MAX}
        aria-label="Aumentar tamaño de letra"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <span className="min-w-12 text-center text-sm font-semibold tabular-nums text-navy-dark">
        {formatCardFontScaleLabel(value)}
      </span>
    </div>
  )
}
