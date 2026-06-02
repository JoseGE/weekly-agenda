import { useMemo, useState } from 'react'
import { LayoutTemplate, Plus, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { createEmptyTemplateEvent, formatTimeForDisplay } from '@/lib/program-utils'
import { DAY_NAMES, DAY_SHORT, type WeekTemplateEvent } from '@/types'

function TemplateEventRow({
  event,
  onUpdate,
  onDelete,
}: {
  event: WeekTemplateEvent
  onUpdate: (updates: Partial<WeekTemplateEvent>) => void
  onDelete: () => void
}) {
  const { ministries } = useApp()

  return (
    <div className="space-y-3 rounded-xl border border-stone-200/70 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-navy-dark">
          {event.title.trim() || 'Evento sin título'}
          {event.time ? ` · ${formatTimeForDisplay(event.time)}` : ''}
        </p>
        <Button type="button" variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className={`grid gap-3 ${event.isSimpleAnnouncement ? '' : 'sm:grid-cols-2'}`}>
        {!event.isSimpleAnnouncement && (
          <div className="space-y-2">
            <Label>Hora</Label>
            <Input
              type="time"
              value={event.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Ministerio (opcional)</Label>
          <Select
            value={event.ministryId ?? 'none'}
            onValueChange={(value) =>
              onUpdate({ ministryId: value === 'none' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Ninguno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              {ministries.map((ministry) => (
                <SelectItem key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Título / Anuncio</Label>
        <Textarea
          value={event.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ej: Culto del Ministerio de los Caballeros"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Ubicación (opcional)</Label>
        <Input
          value={event.location ?? ''}
          onChange={(e) => onUpdate({ location: e.target.value || undefined })}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="flex items-center gap-2">
          <Switch
            checked={event.isSpecial}
            onCheckedChange={(isSpecial) => onUpdate({ isSpecial })}
          />
          <Label className="font-normal">Texto especial en PDF</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={event.isSimpleAnnouncement}
            onCheckedChange={(isSimpleAnnouncement) =>
              onUpdate({
                isSimpleAnnouncement,
                time: isSimpleAnnouncement ? '' : event.time,
              })
            }
          />
          <Label className="font-normal">Solo anuncio</Label>
        </div>
      </div>
    </div>
  )
}

export function SettingsWeekTemplateTab() {
  const { data, updateWeekTemplate } = useApp()
  const [activeDay, setActiveDay] = useState('0')

  const template = data.weekTemplate
  const totalEvents = useMemo(
    () => template.reduce((sum, day) => sum + day.events.length, 0),
    [template],
  )

  const updateDay = (dayIndex: number, events: WeekTemplateEvent[]) => {
    updateWeekTemplate(
      template.map((day) => (day.dayIndex === dayIndex ? { ...day, events } : day)),
    )
  }

  const addEvent = (dayIndex: number) => {
    const day = template.find((entry) => entry.dayIndex === dayIndex)
    if (!day) return
    updateDay(dayIndex, [...day.events, createEmptyTemplateEvent()])
  }

  return (
    <div className="space-y-4">
      <Card className="border-church-gold/20 bg-cream/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutTemplate className="h-5 w-5 text-church-gold" />
            Plantilla semanal
          </CardTitle>
          <CardDescription>
            Define la estructura habitual de cada día. Al crear un programa nuevo, estos eventos se
            copian automáticamente (sin asignar personas).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">
            {totalEvents} evento{totalEvents !== 1 ? 's' : ''} en la plantilla
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full gap-1">
            {template.map((day) => (
              <TabsTrigger key={day.dayIndex} value={String(day.dayIndex)} className="gap-1">
                {DAY_SHORT[day.dayIndex]}
                {day.events.length > 0 && (
                  <span className="rounded-full bg-navy-soft px-1.5 text-xs text-navy-dark">
                    {day.events.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {template.map((day) => (
          <TabsContent key={day.dayIndex} value={String(day.dayIndex)} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-lg font-semibold text-navy-dark">
                {DAY_NAMES[day.dayIndex]}
              </h3>
              <Button type="button" size="sm" onClick={() => addEvent(day.dayIndex)}>
                <Plus className="h-4 w-4" />
                Agregar evento
              </Button>
            </div>

            {day.events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300/80 bg-white/50 py-10 text-center text-sm text-stone-500">
                Sin eventos para {DAY_NAMES[day.dayIndex].toLowerCase()}.
              </div>
            ) : (
              <div className="space-y-3">
                {day.events.map((event) => (
                  <TemplateEventRow
                    key={event.id}
                    event={event}
                    onUpdate={(updates) =>
                      updateDay(
                        day.dayIndex,
                        day.events.map((entry) =>
                          entry.id === event.id ? { ...entry, ...updates } : entry,
                        ),
                      )
                    }
                    onDelete={() =>
                      updateDay(
                        day.dayIndex,
                        day.events.filter((entry) => entry.id !== event.id),
                      )
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
