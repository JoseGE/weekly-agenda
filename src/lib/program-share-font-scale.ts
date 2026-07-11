import { clampPdfFontScale } from '@/lib/pdf-font-scale'

/** Lienzo ancho para WhatsApp: se ve amplio al abrir en el celular (no tira fina). */
export const PROGRAM_SHARE_IMAGE_WIDTH = 1080

/** Resolución de exportación (nitidez en pantallas retina). */
export const PROGRAM_SHARE_IMAGE_PIXEL_RATIO = 2

/** Ancho aproximado al ver la imagen en el chat del móvil. */
const PHONE_VIEW_WIDTH = 390

/** Escala texto del lienzo 1080 → tamaño legible al verse en el móvil. */
const CANVAS_FONT_SCALE = PROGRAM_SHARE_IMAGE_WIDTH / PHONE_VIEW_WIDTH

export interface ProgramShareFontSizes {
  churchName: number
  headerSubtitle: number
  themeText: number
  dayHeader: number
  announcement: number
  announcementLocation: number
  timeChip: number
  eventTitle: number
  specialHeadline: number
  eventLocation: number
  partText: number
  footer: number
  footerSub: number
  birthdaysTitle: number
  birthdayRow: number
  dayDot: number
  headerAccentWidth: number
  headerAccentHeight: number
  eventIndent: number
  lineHeight: number
  sectionGap: number
  eventGap: number
  pagePaddingX: number
  pagePaddingY: number
  cardPadding: number
  cardRadius: number
  borderWidth: number
}

/** Tamaño deseado al verse en el móvil (px), antes de escalar al lienzo 1080. */
const PHONE_READABLE_BASE = {
  churchName: 30,
  headerSubtitle: 23,
  themeText: 19,
  dayHeader: 26,
  announcement: 24,
  announcementLocation: 21,
  timeChip: 22,
  eventTitle: 24,
  specialHeadline: 24,
  eventLocation: 21,
  partText: 23,
  footer: 26,
  footerSub: 19,
  birthdaysTitle: 22,
  birthdayRow: 21,
  dayDot: 12,
  headerAccentWidth: 56,
  headerAccentHeight: 4,
  eventIndent: 16,
  lineHeight: 1.45,
  sectionGap: 18,
  eventGap: 12,
  pagePaddingX: 28,
  pagePaddingY: 22,
  cardPadding: 18,
  cardRadius: 14,
  borderWidth: 2,
} as const

function scalePx(px: number, fontScale: number): number {
  return Math.round(px * clampPdfFontScale(fontScale) * 10) / 10
}

function buildScreenSizes(fontScale: number): ProgramShareFontSizes {
  const s = (n: number) => scalePx(n, fontScale)
  return {
    churchName: s(PHONE_READABLE_BASE.churchName),
    headerSubtitle: s(PHONE_READABLE_BASE.headerSubtitle),
    themeText: s(PHONE_READABLE_BASE.themeText),
    dayHeader: s(PHONE_READABLE_BASE.dayHeader),
    announcement: s(PHONE_READABLE_BASE.announcement),
    announcementLocation: s(PHONE_READABLE_BASE.announcementLocation),
    timeChip: s(PHONE_READABLE_BASE.timeChip),
    eventTitle: s(PHONE_READABLE_BASE.eventTitle),
    specialHeadline: s(PHONE_READABLE_BASE.specialHeadline),
    eventLocation: s(PHONE_READABLE_BASE.eventLocation),
    partText: s(PHONE_READABLE_BASE.partText),
    footer: s(PHONE_READABLE_BASE.footer),
    footerSub: s(PHONE_READABLE_BASE.footerSub),
    birthdaysTitle: s(PHONE_READABLE_BASE.birthdaysTitle),
    birthdayRow: s(PHONE_READABLE_BASE.birthdayRow),
    dayDot: s(PHONE_READABLE_BASE.dayDot),
    headerAccentWidth: s(PHONE_READABLE_BASE.headerAccentWidth),
    headerAccentHeight: s(PHONE_READABLE_BASE.headerAccentHeight),
    eventIndent: s(PHONE_READABLE_BASE.eventIndent),
    lineHeight: PHONE_READABLE_BASE.lineHeight,
    sectionGap: s(PHONE_READABLE_BASE.sectionGap),
    eventGap: s(PHONE_READABLE_BASE.eventGap),
    pagePaddingX: s(PHONE_READABLE_BASE.pagePaddingX),
    pagePaddingY: s(PHONE_READABLE_BASE.pagePaddingY),
    cardPadding: s(PHONE_READABLE_BASE.cardPadding),
    cardRadius: s(PHONE_READABLE_BASE.cardRadius),
    borderWidth: Math.max(2, Math.round(PHONE_READABLE_BASE.borderWidth * clampPdfFontScale(fontScale))),
  }
}

function toCanvasSizes(screen: ProgramShareFontSizes): ProgramShareFontSizes {
  const c = (n: number) => Math.round(n * CANVAS_FONT_SCALE * 10) / 10
  return {
    churchName: c(screen.churchName),
    headerSubtitle: c(screen.headerSubtitle),
    themeText: c(screen.themeText),
    dayHeader: c(screen.dayHeader),
    announcement: c(screen.announcement),
    announcementLocation: c(screen.announcementLocation),
    timeChip: c(screen.timeChip),
    eventTitle: c(screen.eventTitle),
    specialHeadline: c(screen.specialHeadline),
    eventLocation: c(screen.eventLocation),
    partText: c(screen.partText),
    footer: c(screen.footer),
    footerSub: c(screen.footerSub),
    birthdaysTitle: c(screen.birthdaysTitle),
    birthdayRow: c(screen.birthdayRow),
    dayDot: c(screen.dayDot),
    headerAccentWidth: c(screen.headerAccentWidth),
    headerAccentHeight: c(screen.headerAccentHeight),
    eventIndent: c(screen.eventIndent),
    lineHeight: screen.lineHeight,
    sectionGap: c(screen.sectionGap),
    eventGap: c(screen.eventGap),
    pagePaddingX: c(screen.pagePaddingX),
    pagePaddingY: c(screen.pagePaddingY),
    cardPadding: c(screen.cardPadding),
    cardRadius: c(screen.cardRadius),
    borderWidth: screen.borderWidth,
  }
}

/** Tamaños para el lienzo 1080px (imagen WhatsApp). */
export function getProgramShareFontSizes(fontScale = 1): ProgramShareFontSizes {
  return toCanvasSizes(buildScreenSizes(fontScale))
}

/** Tamaños para la vista HTML en el navegador del móvil. */
export function getProgramMobileViewFontSizes(fontScale = 1): ProgramShareFontSizes {
  return buildScreenSizes(fontScale)
}
