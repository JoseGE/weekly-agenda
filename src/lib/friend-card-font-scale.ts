import { clampCardFontScale } from '@/lib/card-font-scale'

export interface FriendCardFontSizes {
  churchName: number
  badge: number
  title: number
  greeting: number
  body: number
  quote: number
  quoteReference: number
  scriptTitle: number
  eventDetail: number
  eventIcon: number
  closing: number
  friendSignature: number
}

export function getFriendCardFontSizes(fontScaleInput = 1): FriendCardFontSizes {
  const fontScale = clampCardFontScale(fontScaleInput)
  return {
    churchName: Math.round(22 * fontScale),
    badge: Math.round(14 * fontScale),
    title: Math.round(42 * fontScale),
    greeting: Math.round(24 * fontScale),
    body: Math.round(24 * fontScale),
    quote: Math.round(26 * fontScale),
    quoteReference: Math.round(18 * fontScale),
    scriptTitle: Math.round(56 * fontScale),
    eventDetail: Math.round(28 * fontScale),
    eventIcon: Math.round(36 * fontScale),
    closing: Math.round(24 * fontScale),
    friendSignature: Math.round(72 * fontScale),
  }
}
