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

export const CENTRAL_CARD_TAGLINE = 'Sembrando fe · Sirviendo con amor'

export const DEFAULT_CARD_ALIGN: Record<keyof ChurchCardAlign, CardTextAlign> = {
  recipient: 'center',
  title: 'center',
  subtitle: 'center',
  body: 'left',
}

export function getCardFieldAlign(
  card: ChurchCard,
  field: keyof ChurchCardAlign,
): CardTextAlign {
  return card.align?.[field] ?? DEFAULT_CARD_ALIGN[field]
}

export function cardAlignClassName(align: CardTextAlign): string {
  return align === 'center' ? 'text-center' : 'text-left'
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
      'PAUTAS DE PARTICIPACIÓN:',
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
    createdAt: now,
    updatedAt: now,
  }
}

export function getCardSummary(card: ChurchCard): string {
  const title = card.title.trim() || getCardTemplateDefinition(card.template).name
  if (card.recipient?.trim()) return `${title} — ${card.recipient.trim()}`
  return title
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
