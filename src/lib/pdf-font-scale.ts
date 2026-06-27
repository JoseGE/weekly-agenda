export const PDF_FONT_SCALE_DEFAULT = 1
export const PDF_FONT_SCALE_MIN = 0.75
export const PDF_FONT_SCALE_MAX = 1.35

const STORAGE_KEY = 'weekly-agenda-pdf-font-scale'

export function clampPdfFontScale(scale: number): number {
  return Math.min(PDF_FONT_SCALE_MAX, Math.max(PDF_FONT_SCALE_MIN, scale))
}

export function getPdfFontScale(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return PDF_FONT_SCALE_DEFAULT
    const value = Number(raw)
    if (!Number.isFinite(value)) return PDF_FONT_SCALE_DEFAULT
    return clampPdfFontScale(value)
  } catch {
    return PDF_FONT_SCALE_DEFAULT
  }
}

export function setPdfFontScale(scale: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(clampPdfFontScale(scale)))
  } catch {
    // ignore storage errors
  }
}

export function formatPdfFontScaleLabel(scale: number): string {
  return `${Math.round(scale * 100)}%`
}
