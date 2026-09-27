import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EventCard } from '@/components/EventCard'
import type { DayEvent, WeeklyProgram } from '@/types'

interface SortableEventCardProps {
  program: WeeklyProgram
  event: DayEvent
  isRecurring?: boolean
  onRecurringChange?: (recurring: boolean) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  onUpdate: (event: DayEvent) => void
  onDelete: () => void
}

export function SortableEventCard({
  program,
  event,
  isRecurring,
  onRecurringChange,
  collapsed,
  onToggleCollapsed,
  onUpdate,
  onDelete,
}: SortableEventCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <EventCard
        program={program}
        event={event}
        isRecurring={isRecurring}
        onRecurringChange={onRecurringChange}
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}
