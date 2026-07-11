export type CardBodyInlineSegment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }

export type CardBodyBlock =
  | { type: 'paragraph'; segments: CardBodyInlineSegment[] }
  | {
      type: 'bullet'
      ordered: boolean
      marker: string
      depth: number
      segments: CardBodyInlineSegment[]
    }
  | { type: 'blank' }

const INLINE_BOLD_PATTERN = /\*\*(.+?)\*\*|__(.+?)__/g
const BULLET_LINE_PATTERN = /^(\s*)([-*•]|\d+\.)\s+(.+)$/
const BULLET_INDENT_UNIT = 2
const BULLET_MAX_DEPTH = 3

function getBulletDepth(indent: string): number {
  const normalized = indent.replace(/\t/g, ' '.repeat(BULLET_INDENT_UNIT))
  return Math.min(BULLET_MAX_DEPTH, Math.floor(normalized.length / BULLET_INDENT_UNIT))
}

export function parseCardBodyInline(text: string): CardBodyInlineSegment[] {
  if (!text) return []

  const segments: CardBodyInlineSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(INLINE_BOLD_PATTERN)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, index) })
    }
    segments.push({ type: 'bold', value: match[1] ?? match[2] ?? '' })
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }]
}

export function parseCardBodyBlocks(body: string): CardBodyBlock[] {
  return body.split('\n').map((line) => {
    if (!line.trim()) return { type: 'blank' as const }

    const bulletMatch = line.match(BULLET_LINE_PATTERN)
    if (bulletMatch) {
      const marker = bulletMatch[2]
      const ordered = /^\d+\.$/.test(marker)
      return {
        type: 'bullet' as const,
        ordered,
        marker,
        depth: getBulletDepth(bulletMatch[1]),
        segments: parseCardBodyInline(bulletMatch[3]),
      }
    }

    return {
      type: 'paragraph' as const,
      segments: parseCardBodyInline(line),
    }
  })
}

export function wrapTextareaSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = 'texto',
): string {
  const { selectionStart, selectionEnd, value } = textarea
  const selected = value.slice(selectionStart, selectionEnd) || placeholder
  const nextValue =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd)

  const cursorStart = selectionStart + before.length
  const cursorEnd = cursorStart + selected.length

  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(cursorStart, cursorEnd)
  })

  return nextValue
}

export function prefixTextareaLines(textarea: HTMLTextAreaElement, prefix: string): string {
  const { selectionStart, selectionEnd, value } = textarea
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const lineEndIndex = value.indexOf('\n', selectionEnd)
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
  const block = value.slice(lineStart, lineEnd)

  const prefixed = block
    .split('\n')
    .map((line) => {
      if (!line.trim()) return line
      if (BULLET_LINE_PATTERN.test(line)) return line
      return `${prefix}${line}`
    })
    .join('\n')

  return value.slice(0, lineStart) + prefixed + value.slice(lineEnd)
}

const INDENT_UNIT = '  '

export function indentTextareaBulletLines(
  textarea: HTMLTextAreaElement,
  direction: 1 | -1,
): { value: string; selectionStart: number; selectionEnd: number } {
  const { selectionStart, selectionEnd, value } = textarea
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const lineEndIndex = value.indexOf('\n', selectionEnd > 0 ? selectionEnd - 1 : selectionEnd)
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
  const block = value.slice(lineStart, lineEnd)

  let startDelta = 0
  let totalDelta = 0
  let firstLine = true

  const indented = block
    .split('\n')
    .map((line) => {
      if (!line.trim()) return line

      if (direction === 1) {
        const next = `${INDENT_UNIT}${line}`
        if (firstLine) startDelta += INDENT_UNIT.length
        totalDelta += INDENT_UNIT.length
        firstLine = false
        return next
      }

      const match = line.match(/^(\s+)/)
      if (!match) {
        firstLine = false
        return line
      }
      const removeLength = Math.min(INDENT_UNIT.length, match[1].length)
      if (firstLine) startDelta -= removeLength
      totalDelta -= removeLength
      firstLine = false
      return line.slice(removeLength)
    })
    .join('\n')

  const nextValue = value.slice(0, lineStart) + indented + value.slice(lineEnd)

  return {
    value: nextValue,
    selectionStart: Math.max(lineStart, selectionStart + startDelta),
    selectionEnd: Math.max(lineStart, selectionEnd + totalDelta),
  }
}
