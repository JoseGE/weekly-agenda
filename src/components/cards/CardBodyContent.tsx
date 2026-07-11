import type { ReactNode } from 'react'
import { parseCardBodyBlocks, type CardBodyBlock, type CardBodyInlineSegment } from '@/lib/card-body-format'
import { cn } from '@/lib/utils'

interface CardBodyContentProps {
  body: string
  fontSize: number
  lineHeight?: number
  className?: string
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

function listStyleTypeFor(depth: number, ordered: boolean): string {
  if (ordered) {
    return ['decimal', 'lower-alpha', 'lower-roman'][depth % 3]
  }
  return ['disc', 'circle', 'square'][depth % 3]
}

function renderInlineSegments(segments: CardBodyInlineSegment[]): ReactNode[] {
  return segments.map((segment, index) => {
    if (segment.type === 'bold') {
      return (
        <strong key={index} className="font-bold">
          {segment.value}
        </strong>
      )
    }
    return <span key={index}>{segment.value}</span>
  })
}

function groupBulletNodesByType(nodes: BulletNode[]): BulletNode[][] {
  const groups: BulletNode[][] = []

  for (const node of nodes) {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup[0].block.ordered === node.block.ordered) {
      lastGroup.push(node)
    } else {
      groups.push([node])
    }
  }

  return groups
}

function renderBulletNodes(nodes: BulletNode[], depth: number, keyPrefix: string): ReactNode {
  const groups = groupBulletNodesByType(nodes)

  return groups.map((group, groupIndex) => {
    const ordered = group[0].block.ordered
    const ListTag = ordered ? 'ol' : 'ul'
    const groupKey = `${keyPrefix}-g${groupIndex}`

    return (
      <ListTag
        key={groupKey}
        className={cn('space-y-1', depth === 0 ? 'my-1' : 'mt-1')}
        style={{ listStyleType: listStyleTypeFor(depth, ordered), paddingLeft: 22 }}
      >
        {group.map((node, itemIndex) => {
          const itemKey = `${groupKey}-i${itemIndex}`
          return (
            <li key={itemKey} className="pl-1">
              {renderInlineSegments(node.block.segments)}
              {node.children.length > 0
                ? renderBulletNodes(node.children, depth + 1, itemKey)
                : null}
            </li>
          )
        })}
      </ListTag>
    )
  })
}

export function CardBodyContent({
  body,
  fontSize,
  lineHeight = 1.5,
  className,
}: CardBodyContentProps) {
  const groups = groupCardBodyBlocks(parseCardBodyBlocks(body.trim()))

  return (
    <div className={className} style={{ fontSize, lineHeight }}>
      {groups.map((group) => {
        if (group.type === 'blank') {
          return <div key={group.key} className="h-3" aria-hidden />
        }
        if (group.type === 'bulletList') {
          return renderBulletNodes(group.nodes, 0, group.key)
        }
        return (
          <p key={group.key} className="my-1">
            {renderInlineSegments(group.segments)}
          </p>
        )
      })}
    </div>
  )
}
