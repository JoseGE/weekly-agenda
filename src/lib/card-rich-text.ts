import { parseCardBodyInline } from '@/lib/card-body-format'
import type {
  CardFontFamily,
  CardRichTextDocument,
  CardRichTextMark,
  CardRichTextNode,
  CardTextAlign,
  ChurchCard,
} from '@/types'

export const CARD_FONT_FAMILIES: { value: CardFontFamily; label: string }[] = [
  { value: 'Source Sans 3', label: 'Limpia' },
  { value: 'Playfair Display', label: 'Formal' },
  { value: 'Cormorant Garamond', label: 'Cursiva formal' },
]

export const CARD_FONT_SIZES_PT = [9, 10, 11, 12, 14, 16, 18, 22, 26, 32, 36]
export const CARD_FONT_SIZE_MIN_PT = 8
export const CARD_FONT_SIZE_MAX_PT = 48
export const CARD_INDENT_MAX = 6

export const CARD_COLOR_PRESETS = [
  { value: '#292524', label: 'Carbón' },
  { value: '#0f2d4a', label: 'Azul noche' },
  { value: '#1a4d7c', label: 'Azul Central' },
  { value: '#c47a2c', label: 'Dorado' },
  { value: '#b23a2b', label: 'Rojo' },
  { value: '#287d58', label: 'Verde' },
] as const

const FONT_FAMILY_SET = new Set<string>(CARD_FONT_FAMILIES.map((font) => font.value))
const ALIGN_SET = new Set<CardTextAlign>(['left', 'center', 'right'])
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function normalizeCardColor(value: unknown): string | undefined {
  if (typeof value !== 'string' || !HEX_COLOR_PATTERN.test(value.trim())) return undefined
  return value.trim().toLowerCase()
}

export function normalizeCardFontSize(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const numeric = typeof value === 'number' ? value : Number.parseFloat(value)
  if (!Number.isFinite(numeric)) return undefined
  return `${clampNumber(numeric, CARD_FONT_SIZE_MIN_PT, CARD_FONT_SIZE_MAX_PT)}pt`
}

export function parseCardFontSize(value: unknown): number | undefined {
  const normalized = normalizeCardFontSize(value)
  return normalized ? Number.parseFloat(normalized) : undefined
}

export function normalizeCardFontFamily(value: unknown): CardFontFamily | undefined {
  if (typeof value !== 'string' || !FONT_FAMILY_SET.has(value)) return undefined
  return value as CardFontFamily
}

function sanitizeMark(mark: unknown): CardRichTextMark | null {
  if (!mark || typeof mark !== 'object') return null
  const candidate = mark as CardRichTextMark

  if (candidate.type === 'bold' || candidate.type === 'italic' || candidate.type === 'underline') {
    return { type: candidate.type }
  }

  if (candidate.type !== 'textStyle') return null

  const color = normalizeCardColor(candidate.attrs?.color)
  const fontSize = normalizeCardFontSize(candidate.attrs?.fontSize)
  const fontFamily = normalizeCardFontFamily(candidate.attrs?.fontFamily)
  if (!color && !fontSize && !fontFamily) return null

  return {
    type: 'textStyle',
    attrs: {
      ...(color ? { color } : {}),
      ...(fontSize ? { fontSize } : {}),
      ...(fontFamily ? { fontFamily } : {}),
    },
  }
}

function sanitizeNode(node: unknown): CardRichTextNode | null {
  if (!node || typeof node !== 'object') return null
  const candidate = node as CardRichTextNode

  if (candidate.type === 'text') {
    if (typeof candidate.text !== 'string' || candidate.text.length === 0) return null
    const marks = Array.isArray(candidate.marks)
      ? candidate.marks.map(sanitizeMark).filter((mark): mark is CardRichTextMark => Boolean(mark))
      : []
    return {
      type: 'text',
      text: candidate.text,
      ...(marks.length > 0 ? { marks } : {}),
    }
  }

  if (
    candidate.type !== 'doc' &&
    candidate.type !== 'paragraph' &&
    candidate.type !== 'bulletList' &&
    candidate.type !== 'orderedList' &&
    candidate.type !== 'listItem'
  ) {
    return null
  }

  const content = Array.isArray(candidate.content)
    ? candidate.content.map(sanitizeNode).filter((item): item is CardRichTextNode => Boolean(item))
    : []

  if (candidate.type === 'paragraph') {
    const textAlign = ALIGN_SET.has(candidate.attrs?.textAlign as CardTextAlign)
      ? (candidate.attrs?.textAlign as CardTextAlign)
      : undefined
    const rawIndent = Number(candidate.attrs?.indent ?? 0)
    const indent = Number.isFinite(rawIndent)
      ? Math.round(clampNumber(rawIndent, 0, CARD_INDENT_MAX))
      : 0

    return {
      type: 'paragraph',
      attrs: {
        ...(textAlign ? { textAlign } : {}),
        ...(indent > 0 ? { indent } : {}),
      },
      ...(content.length > 0 ? { content: content.filter((item) => item.type === 'text') } : {}),
    }
  }

  const allowedChildren = content.filter((item) => {
    if (candidate.type === 'doc') {
      return item.type === 'paragraph' || item.type === 'bulletList' || item.type === 'orderedList'
    }
    if (candidate.type === 'listItem') {
      return item.type === 'paragraph' || item.type === 'bulletList' || item.type === 'orderedList'
    }
    return item.type === 'listItem'
  })

  return {
    type: candidate.type,
    ...(allowedChildren.length > 0 ? { content: allowedChildren } : {}),
  }
}

export function sanitizeCardRichTextDocument(value: unknown): CardRichTextDocument {
  const node = sanitizeNode(value)
  if (!node || node.type !== 'doc') {
    return { type: 'doc', content: [{ type: 'paragraph' }] }
  }
  return {
    type: 'doc',
    content:
      node.content && node.content.length > 0 ? node.content : [{ type: 'paragraph' }],
  }
}

function inlineTextNodes(text: string): CardRichTextNode[] {
  return parseCardBodyInline(text).map((segment) => ({
    type: 'text' as const,
    text: segment.value,
    ...(segment.type === 'bold' ? { marks: [{ type: 'bold' as const }] } : {}),
  }))
}

interface LegacyBullet {
  depth: number
  ordered: boolean
  text: string
}

function listFromLegacy(items: LegacyBullet[]): CardRichTextNode {
  const root: CardRichTextNode = {
    type: items[0]?.ordered ? 'orderedList' : 'bulletList',
    content: [],
  }
  const listStack: CardRichTextNode[] = [root]
  const lastItemStack: CardRichTextNode[] = []

  for (const rawItem of items) {
    const depth = Math.min(rawItem.depth, listStack.length)
    while (listStack.length - 1 > depth) {
      listStack.pop()
      lastItemStack.pop()
    }

    while (listStack.length - 1 < depth) {
      const parentItem = lastItemStack[listStack.length - 1]
      if (!parentItem) break
      const nested: CardRichTextNode = {
        type: rawItem.ordered ? 'orderedList' : 'bulletList',
        content: [],
      }
      parentItem.content = [...(parentItem.content ?? []), nested]
      listStack.push(nested)
    }

    const item: CardRichTextNode = {
      type: 'listItem',
      content: [{ type: 'paragraph', content: inlineTextNodes(rawItem.text) }],
    }
    const currentList = listStack[listStack.length - 1]
    currentList.content = [...(currentList.content ?? []), item]
    lastItemStack[listStack.length - 1] = item
    lastItemStack.length = listStack.length
  }

  return root
}

export function legacyCardBodyToRichText(
  body: string,
  defaultAlign: CardTextAlign = 'left',
): CardRichTextDocument {
  const content: CardRichTextNode[] = []
  let bullets: LegacyBullet[] = []
  let bulletOrdered: boolean | null = null

  const flushBullets = () => {
    if (bullets.length === 0) return
    content.push(listFromLegacy(bullets))
    bullets = []
    bulletOrdered = null
  }

  for (const line of body.split('\n')) {
    const bulletMatch = line.match(/^(\s*)([-*•]|\d+\.)\s+(.+)$/)
    if (bulletMatch) {
      const ordered = /^\d+\.$/.test(bulletMatch[2])
      if (bulletOrdered !== null && bulletOrdered !== ordered) flushBullets()
      bulletOrdered = ordered
      bullets.push({
        depth: Math.min(CARD_INDENT_MAX, Math.floor(bulletMatch[1].replace(/\t/g, '  ').length / 2)),
        ordered,
        text: bulletMatch[3],
      })
      continue
    }

    flushBullets()
    if (!line.trim()) {
      content.push({ type: 'paragraph', attrs: { textAlign: defaultAlign } })
      continue
    }

    const leading = line.match(/^(\s+)/)?.[1] ?? ''
    const indent = Math.min(CARD_INDENT_MAX, Math.floor(leading.replace(/\t/g, '  ').length / 2))
    content.push({
      type: 'paragraph',
      attrs: {
        textAlign: defaultAlign,
        ...(indent > 0 ? { indent } : {}),
      },
      content: inlineTextNodes(line.trimStart()),
    })
  }

  flushBullets()
  return sanitizeCardRichTextDocument({
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  })
}

function nodeText(node: CardRichTextNode, depth = 0): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'paragraph') return (node.content ?? []).map((child) => nodeText(child, depth)).join('')

  if (node.type === 'listItem') {
    const parts = node.content ?? []
    const paragraph = parts.find((child) => child.type === 'paragraph')
    const nested = parts.filter((child) => child.type === 'bulletList' || child.type === 'orderedList')
    const prefix = '  '.repeat(depth)
    const ownText = `${prefix}${paragraph ? nodeText(paragraph, depth) : ''}`
    const nestedText = nested.map((child) => nodeText(child, depth + 1)).filter(Boolean)
    return [ownText, ...nestedText].join('\n')
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content ?? [])
      .map((child, index) => {
        const value = nodeText(child, depth)
        const lines = value.split('\n')
        const marker = node.type === 'orderedList' ? `${index + 1}. ` : '- '
        lines[0] = `${'  '.repeat(depth)}${marker}${lines[0].trimStart()}`
        return lines.join('\n')
      })
      .join('\n')
  }

  return (node.content ?? []).map((child) => nodeText(child, depth)).join('\n')
}

export function cardRichTextToPlainText(document: CardRichTextDocument): string {
  return sanitizeCardRichTextDocument(document).content?.map((node) => nodeText(node)).join('\n') ?? ''
}

export function getCardRichTextDocument(card: ChurchCard): CardRichTextDocument {
  if (card.bodyRich) return sanitizeCardRichTextDocument(card.bodyRich)
  return legacyCardBodyToRichText(card.body, card.align?.body ?? 'left')
}

export function formatCardRecipientLine(card: Pick<ChurchCard, 'recipient' | 'recipientLabel'>): string {
  const recipient = card.recipient?.trim() ?? ''
  if (!recipient) return ''
  const label = card.recipientLabel === undefined ? 'Para:' : card.recipientLabel.trim()
  return label ? `${label} ${recipient}` : recipient
}

export function shouldShowCardTitle(card: Pick<ChurchCard, 'showTitle'>): boolean {
  return card.showTitle !== false
}
