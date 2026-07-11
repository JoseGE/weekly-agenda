import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CHURCH_CARD_TEMPLATES,
  type CardTextAlign,
  type ChurchCard,
  type ChurchCardAlign,
  type ChurchCardTemplate,
} from '@/types'

import { clampCardFontScale } from '@/lib/card-font-scale'

export const CARD_COUNCIL_NAME = 'Concilio de las Iglesias Evangélicas Pentecostales Inc.'
export const CARD_COUNCIL_ADDRESS =
  'C/ 2da. N. 38, los Guaricanos, Santo Domingo Norte, Rep. Dom.'
export const CARD_DOCUMENT_CITY = 'Santo Domingo Norte'

export const CENTRAL_CARD_TAGLINE = 'Sembrando fe · Sirviendo con amor'

export const DEFAULT_CARD_ALIGN: Record<keyof ChurchCardAlign, CardTextAlign> = {
  recipient: 'center',
  title: 'center',
  subtitle: 'center',
  body: 'left',
  closing: 'center',
}

export function getCardFieldAlign(
  card: ChurchCard,
  field: keyof ChurchCardAlign,
): CardTextAlign {
  return card.align?.[field] ?? DEFAULT_CARD_ALIGN[field]
}

export function cardAlignClassName(align: CardTextAlign): string {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

export function cardBlockClassName(align: CardTextAlign): string {
  const textAlign = cardAlignClassName(align)
  if (align === 'center') {
    return `w-full max-w-2xl self-center ${textAlign}`
  }
  return `w-full self-stretch ${textAlign}`
}

export interface CardBodyTypography {
  pdfFontSize: number
  pdfLineHeight: number
}

export function getCardFontScale(card: ChurchCard): number {
  return clampCardFontScale(card.fontScale ?? 1)
}

export function getCardBodyTypography(body: string, fontScale = 1): CardBodyTypography {
  const scale = clampCardFontScale(fontScale)
  const length = body.trim().length
  if (length > 800) {
    return {
      pdfFontSize: 9.5 * scale,
      pdfLineHeight: 1.45,
    }
  }
  if (length > 400) {
    return {
      pdfFontSize: 10.5 * scale,
      pdfLineHeight: 1.5,
    }
  }
  return {
    pdfFontSize: 11.5 * scale,
    pdfLineHeight: 1.55,
  }
}

export function shouldUseCompactCardLayout(body: string): boolean {
  return body.trim().length > 600
}

export function shouldUseCardSecondPage(body: string): boolean {
  return body.trim().length > 1400
}

export function splitCardBodyForPdf(body: string): [string, string] {
  const trimmed = body.trim()
  if (!shouldUseCardSecondPage(trimmed)) return [trimmed, '']

  const paragraphs = trimmed.split(/\n\n+/)
  if (paragraphs.length >= 2) {
    const midpoint = Math.ceil(paragraphs.length / 2)
    return [paragraphs.slice(0, midpoint).join('\n\n'), paragraphs.slice(midpoint).join('\n\n')]
  }

  const midpoint = Math.floor(trimmed.length / 2)
  const breakAt = trimmed.lastIndexOf(' ', midpoint)
  const splitIndex = breakAt > 0 ? breakAt : midpoint
  return [trimmed.slice(0, splitIndex).trim(), trimmed.slice(splitIndex).trim()]
}

export function cardPdfBlockStyle(align: CardTextAlign): {
  width: string
  alignSelf: 'stretch' | 'center'
  maxWidth?: number
} {
  if (align === 'center') {
    return { width: '100%', alignSelf: 'center', maxWidth: 420 }
  }
  return { width: '100%', alignSelf: 'stretch' }
}

export function shouldShowCardEventBlock(card: ChurchCard): boolean {
  const supportsEvent =
    card.template === 'invitacion' ||
    card.template === 'anuncio' ||
    card.template === 'oracion'

  if (!supportsEvent || card.showEventBlock === false) return false
  return Boolean(card.eventDate || card.eventTime || card.location?.trim())
}

export function getCardTemplateDefinition(template: ChurchCardTemplate) {
  return CHURCH_CARD_TEMPLATES.find((item) => item.id === template) ?? CHURCH_CARD_TEMPLATES[0]
}

export function createParadaNinoCristianoSample(): ChurchCard {
  const card = createEmptyCard('anuncio')

  return {
    ...card,
    title: 'Parada del Niño Cristiano',
    subtitle: 'Celebración navideña infantil',
    recipient: 'Hermanos, hermanas y amigos de la congregación',
    body: [
      'Nos complace anunciar la tradicional Parada del Niño Cristiano, actividad dedicada a honrar el nacimiento de nuestro Salvador Jesucristo. Invitamos a toda la iglesia — niños, jóvenes y familias — a participar con gozo y reverencia.',
      '',
      '**PAUTAS DE PARTICIPACIÓN:**',
      '',
      '1. Puntualidad: Reunión a las 9:00 a.m. en el templo. El recorrido inicia puntualmente a las 9:30 a.m.',
      '2. Vestimenta: Niños de blanco; adultos acompañantes con ropa formal modesta.',
      '3. Aporte: Cada niño debe traer su figurilla del Niño Jesús o estrella, según lo coordinado con su maestro de Escuela Dominical.',
      '4. Conducta: Mantener orden, silencio reverente y supervisión de los menores durante todo el recorrido.',
      '5. Ruta: Salida desde el templo — recorrido por la calle principal — retorno al templo para un breve mensaje y refrigerio.',
      '6. Colaboración: Maestros, líderes juveniles y diáconos apoyarán en la organización de filas por grupos de edad.',
      '',
      'Rogamos preparar el corazón y confirmar asistencia con su maestro o líder de sector.',
    ].join('\n'),
    eventDate: '2027-12-04',
    eventTime: '09:00',
    location: 'Salida desde el templo principal — recorrido por la calle principal',
    closing: '¡Los esperamos con gozo! Dios les bendiga',
    documentDate: getDefaultCardDocumentDate(),
    fontScale: 1,
  }
}

export function createEmptyCard(template: ChurchCardTemplate = 'invitacion'): ChurchCard {
  const def = getCardTemplateDefinition(template)
  const now = new Date().toISOString()

  return {
    id: uuidv4(),
    template,
    title: def.defaultTitle,
    subtitle: '',
    recipient: '',
    body: def.defaultBody,
    closing: def.defaultClosing,
    eventDate: '',
    eventTime: '',
    location: '',
    showEventBlock: true,
    documentDate: getDefaultCardDocumentDate(),
    fontScale: 1,
    createdAt: now,
    updatedAt: now,
  }
}

export function getCardSummary(card: ChurchCard): string {
  const title = card.title.trim() || getCardTemplateDefinition(card.template).name
  if (card.recipient?.trim()) return `${title} — ${card.recipient.trim()}`
  return title
}

export function formatCardDocumentDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export function formatCardDocumentLine(dateStr: string): string {
  const formatted = formatCardDocumentDate(dateStr)
  if (!formatted) return CARD_DOCUMENT_CITY
  return `${CARD_DOCUMENT_CITY}, ${formatted}`
}

export function getDefaultCardDocumentDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatCardEventDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return format(new Date(dateStr + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })
  } catch {
    return dateStr
  }
}

export function formatCardEventTime(time: string): string {
  if (!time) return ''
  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return time
  const hours = Number(match[1])
  const minutes = match[2]
  const period = hours >= 12 ? 'p.m.' : 'a.m.'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${period}`
}
