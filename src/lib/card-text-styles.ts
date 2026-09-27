import { normalizeCardColor, normalizeCardFontFamily } from '@/lib/card-rich-text'
import { clampCardFontScale } from '@/lib/card-font-scale'
import type {
  CardFontFamily,
  CardTextStyle,
  CardTextStyleSection,
  ChurchCard,
} from '@/types'

const DEFAULT_SECTION_SIZES: Record<CardTextStyleSection, number> = {
  recipient: 10,
  title: 20,
  subtitle: 12,
  closing: 11,
}

const DEFAULT_SECTION_COLORS: Record<CardTextStyleSection, string> = {
  recipient: '#57534e',
  title: '#0f2d4a',
  subtitle: '#1a4d7c',
  closing: '#c47a2c',
}

const DEFAULT_SECTION_EMPHASIS: Record<
  CardTextStyleSection,
  Pick<CardTextStyle, 'bold' | 'italic'>
> = {
  recipient: { italic: true },
  title: { bold: true },
  subtitle: {},
  closing: { bold: true },
}

export interface ResolvedCardTextStyle {
  fontFamily?: CardFontFamily
  fontSizePt: number
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
}

export function getCardSectionTextStyle(
  card: ChurchCard,
  section: CardTextStyleSection,
): ResolvedCardTextStyle {
  const style = card.textStyles?.[section]
  const fontScale = clampCardFontScale(card.fontScale ?? 1)
  const size = Number(style?.fontSizePt)

  return {
    fontFamily: normalizeCardFontFamily(style?.fontFamily),
    fontSizePt: (Number.isFinite(size) ? Math.min(48, Math.max(8, size)) : DEFAULT_SECTION_SIZES[section]) * fontScale,
    color: normalizeCardColor(style?.color) ?? DEFAULT_SECTION_COLORS[section],
    bold: style?.bold ?? DEFAULT_SECTION_EMPHASIS[section].bold ?? false,
    italic: style?.italic ?? DEFAULT_SECTION_EMPHASIS[section].italic ?? false,
    underline: style?.underline ?? false,
  }
}

export function getCardFontCss(fontFamily?: CardFontFamily): string | undefined {
  if (!fontFamily) return undefined
  if (fontFamily === 'Source Sans 3') return '"Source Sans 3", sans-serif'
  if (fontFamily === 'Playfair Display') return '"Playfair Display", serif'
  return '"Cormorant Garamond", serif'
}

export function getCardPdfFontFamily(fontFamily?: CardFontFamily): string {
  if (!fontFamily) return 'Helvetica'
  if (fontFamily === 'Source Sans 3') return 'CardSourceSans'
  if (fontFamily === 'Playfair Display') return 'CardPlayfair'
  return 'CardCormorant'
}
