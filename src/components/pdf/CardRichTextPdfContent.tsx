import type { ReactNode } from 'react'
import { Text, View } from '@react-pdf/renderer'
import {
  parseCardFontSize,
  sanitizeCardRichTextDocument,
} from '@/lib/card-rich-text'
import { getCardPdfFontFamily } from '@/lib/card-text-styles'
import type {
  CardFontFamily,
  CardRichTextDocument,
  CardRichTextMark,
  CardRichTextNode,
  CardTextAlign,
} from '@/types'

interface CardRichTextPdfContentProps {
  document: CardRichTextDocument
  defaultFontSize: number
  lineHeight: number
  align: CardTextAlign
  color: string
  fontScale: number
}

function markStyle(marks: CardRichTextMark[] | undefined, fontScale: number) {
  const textStyle = marks?.find((mark) => mark.type === 'textStyle')?.attrs
  const bold = marks?.some((mark) => mark.type === 'bold') ?? false
  const italic = marks?.some((mark) => mark.type === 'italic') ?? false
  const underline = marks?.some((mark) => mark.type === 'underline') ?? false
  const fontSize = parseCardFontSize(textStyle?.fontSize)
  const fontFamily = textStyle?.fontFamily as CardFontFamily | undefined

  return {
    fontFamily: getCardPdfFontFamily(fontFamily),
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? ('italic' as const) : ('normal' as const),
    ...(textStyle?.color ? { color: textStyle.color } : {}),
    ...(fontSize ? { fontSize: fontSize * fontScale } : {}),
    ...(underline ? { textDecoration: 'underline' as const } : {}),
  }
}

function renderInline(nodes: CardRichTextNode[] | undefined, fontScale: number) {
  return nodes?.map((node, index) => {
    if (node.type !== 'text') return null
    return (
      <Text key={index} style={markStyle(node.marks, fontScale)}>
        {node.text}
      </Text>
    )
  })
}

function uniformInlineStyle(nodes: CardRichTextNode[] | undefined, fontScale: number) {
  const textNodes = nodes?.filter((node) => node.type === 'text') ?? []
  if (textNodes.length === 0) return undefined
  const first = JSON.stringify(textNodes[0].marks ?? [])
  if (!textNodes.every((node) => JSON.stringify(node.marks ?? []) === first)) return undefined
  return markStyle(textNodes[0].marks, fontScale)
}

function renderParagraphInline(nodes: CardRichTextNode[] | undefined, fontScale: number) {
  const uniformStyle = uniformInlineStyle(nodes, fontScale)
  if (uniformStyle) {
    return {
      style: uniformStyle,
      content: nodes?.filter((node) => node.type === 'text').map((node) => node.text).join('') ?? '',
    }
  }
  return { style: undefined, content: renderInline(nodes, fontScale) }
}

function renderList(
  node: CardRichTextNode,
  depth: number,
  keyPrefix: string,
  fontSize: number,
  lineHeight: number,
  align: CardTextAlign,
  color: string,
  fontScale: number,
): ReactNode {
  return (
    <View key={keyPrefix} style={{ width: '100%', marginBottom: depth === 0 ? 5 : 0 }}>
      {(node.content ?? []).map((item, index) => {
        const paragraph = item.content?.find((child) => child.type === 'paragraph')
        const nested = item.content?.filter(
          (child) => child.type === 'bulletList' || child.type === 'orderedList',
        )
        const marker = node.type === 'orderedList'
          ? `${index + 1}.`
          : ['•', '◦', '▪'][depth % 3]
        const inline = renderParagraphInline(paragraph?.content, fontScale)

        return (
          <View key={`${keyPrefix}-${index}`} style={{ width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginLeft: depth * 14,
                marginBottom: 3,
                width: '100%',
              }}
            >
              <Text style={{ width: 18, fontSize, lineHeight, color }}>{marker}</Text>
              <Text
                style={{
                  flex: 1,
                  fontSize,
                  lineHeight,
                  color,
                  textAlign: paragraph?.attrs?.textAlign ?? align,
                  ...inline.style,
                }}
              >
                {inline.content}
              </Text>
            </View>
            {nested?.map((child, childIndex) =>
              renderList(
                child,
                depth + 1,
                `${keyPrefix}-${index}-${childIndex}`,
                fontSize,
                lineHeight,
                align,
                color,
                fontScale,
              ),
            )}
          </View>
        )
      })}
    </View>
  )
}

export function CardRichTextPdfContent({
  document,
  defaultFontSize,
  lineHeight,
  align,
  color,
  fontScale,
}: CardRichTextPdfContentProps) {
  const resolved = sanitizeCardRichTextDocument(document)

  return (
    <>
      {resolved.content?.map((node, index) => {
        if (node.type === 'bulletList' || node.type === 'orderedList') {
          return renderList(
            node,
            0,
            `list-${index}`,
            defaultFontSize,
            lineHeight,
            align,
            color,
            fontScale,
          )
        }
        if (node.type !== 'paragraph') return null
        const isBlank = !node.content?.some((child) => child.type === 'text' && child.text)
        if (isBlank) return <View key={`blank-${index}`} style={{ height: 8 }} />
        const inline = renderParagraphInline(node.content, fontScale)

        return (
          <Text
            key={`paragraph-${index}`}
            wrap={false}
            style={{
              fontSize: defaultFontSize,
              lineHeight,
              color,
              textAlign: node.attrs?.textAlign ?? align,
              marginLeft: (node.attrs?.indent ?? 0) * 18,
              marginBottom: 4,
              ...inline.style,
            }}
          >
            {inline.content}
          </Text>
        )
      })}
    </>
  )
}
