import type { ReactNode } from 'react'
import { Text, View } from '@react-pdf/renderer'
import {
  parseCardBodyBlocks,
  type CardBodyBlock,
  type CardBodyInlineSegment,
} from '@/lib/card-body-format'
import type { CardTextAlign } from '@/types'

interface CardBodyPdfContentProps {
  body: string
  fontSize: number
  lineHeight: number
  align: CardTextAlign
  color: string
}

type BulletBlock = Extract<CardBodyBlock, { type: 'bullet' }>

interface BulletNode {
  block: BulletBlock
  children: BulletNode[]
}

type RenderGroup =
  | { type: 'paragraph'; key: string; segments: CardBodyInlineSegment[] }
  | { type: 'blank'; key: string }
  | { type: 'bulletList'; key: string; nodes: BulletNode[] }

function buildBulletTree(items: BulletBlock[]): BulletNode[] {
  const root: BulletNode[] = []
  const stack: { depth: number; node: BulletNode }[] = []

  for (const item of items) {
    const node: BulletNode = { block: item, children: [] }
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop()
    }
    if (stack.length === 0) {
      root.push(node)
    } else {
      stack[stack.length - 1].node.children.push(node)
    }
    stack.push({ depth: item.depth, node })
  }

  return root
}

function groupCardBodyBlocks(blocks: CardBodyBlock[]): RenderGroup[] {
  const groups: RenderGroup[] = []
  let pendingBullets: BulletBlock[] = []

  const flushPending = () => {
    if (pendingBullets.length === 0) return
    groups.push({
      type: 'bulletList',
      key: `list-${groups.length}`,
      nodes: buildBulletTree(pendingBullets),
    })
    pendingBullets = []
  }

  blocks.forEach((block, index) => {
    if (block.type === 'bullet') {
      pendingBullets = [...pendingBullets, block]
      return
    }

    flushPending()

    if (block.type === 'blank') {
      groups.push({ type: 'blank', key: `blank-${index}` })
      return
    }

    groups.push({ type: 'paragraph', key: `p-${index}`, segments: block.segments })
  })

  flushPending()
  return groups
}

const UNORDERED_MARKERS = ['•', '◦', '▪']

function renderInlinePdf(segments: CardBodyInlineSegment[], fontSize: number, color: string) {
  return segments.map((segment, index) => (
    <Text
      key={index}
      style={{
        fontSize,
        color,
        fontFamily: segment.type === 'bold' ? 'Helvetica-Bold' : 'Helvetica',
      }}
    >
      {segment.value}
    </Text>
  ))
}

function renderBulletNodes(
  nodes: BulletNode[],
  depth: number,
  keyPrefix: string,
  fontSize: number,
  lineHeight: number,
  align: CardTextAlign,
  color: string,
): ReactNode {
  return (
    <View key={keyPrefix} style={{ width: '100%' }}>
      {nodes.map((node, index) => {
        const itemKey = `${keyPrefix}-${index}`
        const marker = node.block.ordered
          ? node.block.marker
          : UNORDERED_MARKERS[depth % UNORDERED_MARKERS.length]

        return (
          <View key={itemKey} style={{ width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 3,
                marginLeft: depth * 16,
                width: '100%',
              }}
            >
              <Text
                style={{
                  width: 18,
                  fontSize,
                  lineHeight,
                  color,
                  textAlign: align === 'right' ? 'right' : 'left',
                }}
              >
                {marker}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize,
                  lineHeight,
                  color,
                  textAlign: align,
                }}
              >
                {renderInlinePdf(node.block.segments, fontSize, color)}
              </Text>
            </View>
            {node.children.length > 0
              ? renderBulletNodes(node.children, depth + 1, itemKey, fontSize, lineHeight, align, color)
              : null}
          </View>
        )
      })}
    </View>
  )
}

export function CardBodyPdfContent({
  body,
  fontSize,
  lineHeight,
  align,
  color,
}: CardBodyPdfContentProps) {
  const groups = groupCardBodyBlocks(parseCardBodyBlocks(body.trim()))

  return (
    <>
      {groups.map((group) => {
        if (group.type === 'blank') {
          return <View key={group.key} style={{ height: 8 }} />
        }
        if (group.type === 'bulletList') {
          return (
            <View key={group.key} style={{ marginBottom: 6, width: '100%' }}>
              {renderBulletNodes(group.nodes, 0, `${group.key}-tree`, fontSize, lineHeight, align, color)}
            </View>
          )
        }
        return (
          <Text
            key={group.key}
            style={{
              fontSize,
              lineHeight,
              color,
              textAlign: align,
              marginBottom: 4,
            }}
          >
            {renderInlinePdf(group.segments, fontSize, color)}
          </Text>
        )
      })}
    </>
  )
}
