import {
  clampPdfFontScale,
  getPdfFontScale,
  PDF_FONT_SCALE_DEFAULT,
} from '@/lib/pdf-font-scale'

export function buildProgramPreviewUrl(programId: string, fontScale?: number): string {
  const path = `/programa/${programId}/vista-previa`
  const scale = fontScale ?? getPdfFontScale()
  if (scale === PDF_FONT_SCALE_DEFAULT) {
    return `${window.location.origin}${path}`
  }
  return `${window.location.origin}${path}?scale=${scale}`
}

export function parsePreviewFontScale(searchParams: URLSearchParams): number {
  const raw = searchParams.get('scale')
  if (!raw) return getPdfFontScale()
  const value = Number(raw)
  if (!Number.isFinite(value)) return getPdfFontScale()
  return clampPdfFontScale(value)
}
