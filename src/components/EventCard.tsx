import { ChevronDown, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { RoleAssignmentEditor } from '@/components/RoleAssignmentEditor'
import { getEventSummary } from '@/lib/program-utils'
import { cn } from '@/lib/utils'
import type { DayEvent, WeeklyProgram } from '@/types'

interface EventCardProps {
  program: WeeklyProgram
  event: DayEvent
  onUpdate: (event: DayEvent) => void
  onDelete: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function EventCard({
  program,
  event,
  onUpdate,
  onDelete,
  collapsed,
  onToggleCollapsed,
}: EventCardProps) {
  const { ministries, members } = useApp()

  const update = (partial: Partial<DayEvent>) => onUpdate({ ...event, ...partial })

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="flex items-start gap-2 border-b border-stone-100 bg-stone-50/60 px-3 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir evento' : 'Colapsar evento'}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', collapsed && '-rotate-90')}
          />
        </Button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onToggleCollapsed}
        >
          <p className="truncate text-sm font-medium text-stone-900">{getEventSummary(event)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={event.isSpecial ? 'warning' : 'secondary'} className="text-xs">
              {event.isSpecial ? 'Especial' : 'Normal'}
            </Badge>
            {event.isSimpleAnnouncement && (
              <Badge variant="outline" className="text-xs">
                Solo anuncio
              </Badge>
            )}
            {!event.isSimpleAnnouncement && event.assignments.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {event.assignments.length} parte{event.assignments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </button>

        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      {!collapsed && (
        <div className="space-y-4 p-4">
          <div className={`grid gap-4 ${event.isSimpleAnnouncement ? '' : 'md:grid-cols-2'}`}>
            {!event.isSimpleAnnouncement && (
              <div className="space-y-2">
                <Label htmlFor={`time-${event.id}`}>Hora de inicio</Label>
                <Input
                  id={`time-${event.id}`}
                  type="time"
                  value={event.time}
                  onChange={(e) => update({ time: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`ministry-${event.id}`}>Ministerio (opcional)</Label>
              <Select
                value={event.ministryId ?? 'none'}
                onValueChange={(v) => update({ ministryId: v === 'none' ? undefined : v })}
              >
                <SelectTrigger id={`ministry-${event.id}`}>
                  <SelectValue placeholder="Seleccionar ministerio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {ministries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`title-${event.id}`}>Título / Anuncio</Label>
            <Textarea
              id={`title-${event.id}`}
              placeholder="Ej: Culto del Ministerio de los Caballeros, será de oración"
              value={event.title}
              onChange={(e) => update({ title: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`location-${event.id}`}>Ubicación (opcional)</Label>
            <Input
              id={`location-${event.id}`}
              placeholder="Ej: Frente a la casa donde Luisa Fernández"
              value={event.location ?? ''}
              onChange={(e) => update({ location: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`special-${event.id}`}
                checked={event.isSpecial}
                onCheckedChange={(checked) => update({ isSpecial: checked })}
              />
              <Label htmlFor={`special-${event.id}`}>Texto especial (naranja en PDF)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`simple-${event.id}`}
                checked={event.isSimpleAnnouncement}
                onCheckedChange={(checked) =>
                  update({
                    isSimpleAnnouncement: checked,
                    assignments: checked ? [] : event.assignments,
                    time: checked ? '' : event.time,
                  })
                }
              />
              <Label htmlFor={`simple-${event.id}`}>Solo anuncio (sin horario ni partes)</Label>
            </div>
          </div>

          {!event.isSimpleAnnouncement && (
            <RoleAssignmentEditor
              program={program}
              members={members}
              event={event}
              onUpdateAssignments={(assignments) => update({ assignments })}
            />
          )}
        </div>
      )}
    </div>
  )
}
