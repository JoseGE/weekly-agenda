import type { CSSProperties, ReactNode } from 'react'
import {
  getCardRichTextDocument,
  parseCardFontSize,
  sanitizeCardRichTextDocument,
} from '@/lib/card-rich-text'
import { getCardFontCss } from '@/lib/card-text-styles'
import type {
  CardRichTextDocument,
  CardFontFamily,
  CardRichTextMark,
  CardRichTextNode,
  CardTextAlign,
  ChurchCard,
} from '@/types'
import { cn } from '@/lib/utils'

interface CardRichTextContentProps {
  document?: CardRichTextDocument
  card?: ChurchCard
  defaultFontSize: number
  defaultLineHeight?: number
  defaultAlign?: CardTextAlign
  defaultColor?: string
  fontScale?: number
  className?: string
}

function inlineStyle(marks: CardRichTextMark[] | undefined, fontScale: number): CSSProperties {
  const textStyle = marks?.find((mark) => mark.type === 'textStyle')?.attrs
  const fontSize = parseCardFontSize(textStyle?.fontSize)
  const fontFamily = getCardFontCss(textStyle?.fontFamily as CardFontFamily | undefined)

  return {
    ...(marks?.some((mark) => mark.type === 'bold') ? { fontWeight: 700 } : {}),
    ...(marks?.some((mark) => mark.type === 'italic') ? { fontStyle: 'italic' } : {}),
    ...(marks?.some((mark) => mark.type === 'underline')
      ? { textDecorationLine: 'underline' }
      : {}),
    ...(textStyle?.color ? { color: textStyle.color } : {}),
    ...(fontSize ? { fontSize: `${fontSize * fontScale * 2}px` } : {}),
    ...(fontFamily ? { fontFamily } : {}),
  }
}

function renderInline(nodes: CardRichTextNode[] | undefined, fontScale: number): ReactNode {
  return nodes?.map((node, index) => {
    if (node.type !== 'text') return null
    return (
      <span key={index} style={inlineStyle(node.marks, fontScale)}>
        {node.text}
      </span>
    )
  })
}

function renderList(
  node: CardRichTextNode,
  depth: number,
  keyPrefix: string,
  fontScale: number,
): ReactNode {
  const ListTag = node.type === 'orderedList' ? 'ol' : 'ul'
  const listStyleType = node.type === 'orderedList'
    ? ['decimal', 'lower-alpha', 'lower-roman'][depth % 3]
    : ['disc', 'circle', 'square'][depth % 3]

  return (
    <ListTag
      key={keyPrefix}
      className={cn('space-y-1', depth === 0 ? 'my-2' : 'mt-1')}
      style={{ listStyleType, paddingInlineStart: depth === 0 ? 28 : 24 }}
    >
      {(node.content ?? []).map((item, itemIndex) => {
        const paragraph = item.content?.find((child) => child.type === 'paragraph')
        const nested = item.content?.filter(
          (child) => child.type === 'bulletList' || child.type === 'orderedList',
        )
        return (
          <li key={`${keyPrefix}-${itemIndex}`} className="ps-1">
            {paragraph ? renderInline(paragraph.content, fontScale) : null}
            {nested?.map((child, childIndex) =>
              renderList(child, depth + 1, `${keyPrefix}-${itemIndex}-${childIndex}`, fontScale),
            )}
          </li>
        )
      })}
    </ListTag>
  )
}

export function CardRichTextContent({
  document,
  card,
  defaultFontSize,
  defaultLineHeight = 1.5,
  defaultAlign = 'left',
  defaultColor,
  fontScale = 1,
  className,
}: CardRichTextContentProps) {
  const resolved = document
    ? sanitizeCardRichTextDocument(document)
    : card
      ? getCardRichTextDocument(card)
      : sanitizeCardRichTextDocument(null)

  return (
    <div
      className={className}
      style={{
        color: defaultColor,
        fontSize: defaultFontSize,
        lineHeight: defaultLineHeight,
      }}
    >
      {resolved.content?.map((node, index) => {
        if (node.type === 'bulletList' || node.type === 'orderedList') {
          return renderList(node, 0, `list-${index}`, fontScale)
        }
        if (node.type !== 'paragraph') return null
        const isBlank = !node.content?.some((child) => child.type === 'text' && child.text)
        return (
          <p
            key={`paragraph-${index}`}
            className={isBlank ? 'h-3' : 'my-1'}
            style={{
              textAlign: node.attrs?.textAlign ?? defaultAlign,
              marginInlineStart: `${(node.attrs?.indent ?? 0) * 32}px`,
            }}
            aria-hidden={isBlank || undefined}
          >
            {renderInline(node.content, fontScale)}
          </p>
        )
      })}
    </div>
  )
}
