export const CARD_FONT_SCALE_DEFAULT = 1
export const CARD_FONT_SCALE_MIN = 0.8
export const CARD_FONT_SCALE_MAX = 1.6

export function clampCardFontScale(scale: number): number {
  return Math.min(CARD_FONT_SCALE_MAX, Math.max(CARD_FONT_SCALE_MIN, scale))
}

export function scaleCardFontSize(basePx: number, fontScale: number): number {
  return Math.round(basePx * clampCardFontScale(fontScale) * 10) / 10
}

export function formatCardFontScaleLabel(scale: number): string {
  return `${Math.round(scale * 100)}%`
}

export interface CardFontSizes {
  councilName: number
  councilAddress: number
  badge: number
  documentDate: number
  recipient: number
  title: number
  subtitle: number
  body: number
  bodyLineHeight: number
  eventDate: number
  eventTime: number
  eventLocation: number
  closing: number
  signatureName: number
  signatureTitle: number
  signatureLineWidth: number
  footerTitle: number
  footerSub: number
}

export function getCardFontSizes(body: string, fontScale = 1): CardFontSizes {
  const length = body.trim().length
  let bodyBase = 24
  let bodyLineHeight = 1.55
  if (length > 800) {
    bodyBase = 18
    bodyLineHeight = 1.45
  } else if (length > 400) {
    bodyBase = 20
    bodyLineHeight = 1.5
  }

  return {
    councilName: scaleCardFontSize(20, fontScale),
    councilAddress: scaleCardFontSize(14, fontScale),
    badge: scaleCardFontSize(12, fontScale),
    documentDate: scaleCardFontSize(16, fontScale),
    recipient: scaleCardFontSize(18, fontScale),
    title: scaleCardFontSize(36, fontScale),
    subtitle: scaleCardFontSize(20, fontScale),
    body: scaleCardFontSize(bodyBase, fontScale),
    bodyLineHeight,
    eventDate: scaleCardFontSize(24, fontScale),
    eventTime: scaleCardFontSize(20, fontScale),
    eventLocation: scaleCardFontSize(18, fontScale),
    closing: scaleCardFontSize(24, fontScale),
    signatureName: scaleCardFontSize(18, fontScale),
    signatureTitle: scaleCardFontSize(14, fontScale),
    signatureLineWidth: scaleCardFontSize(120, fontScale),
    footerTitle: scaleCardFontSize(20, fontScale),
    footerSub: scaleCardFontSize(16, fontScale),
  }
}
