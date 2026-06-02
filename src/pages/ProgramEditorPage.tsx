import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Plus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { AssignmentCounter } from '@/components/AssignmentCounter'
import { BirthdaysSection } from '@/components/BirthdaysSection'
import { EventCard } from '@/components/EventCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPeopleAtLimit } from '@/lib/assignment-rules'
import { downloadProgramPdf } from '@/lib/download-program-pdf'
import { createEmptyEvent, formatProgramDate, getDayLabel } from '@/lib/program-utils'
import { DAY_SHORT, type DayEvent, type ProgramDay } from '@/types'

export function ProgramEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProgram, updateProgram, members, settings } = useApp()
  const program = id ? getProgram(id) : undefined
  const [activeDay, setActiveDay] = useState('0')
  const [generating, setGenerating] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!program) return
    setExpandedEvents(new Set(program.days.flatMap((day) => day.events.map((event) => event.id))))
  }, [program?.id])

  const atLimitPeople = useMemo(
    () => (program ? getPeopleAtLimit(program) : []),
    [program],
  )

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Programa no encontrado.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  const saveProgram = (updates: Partial<typeof program>) => {
    updateProgram({ ...program, ...updates })
  }

  const updateDay = (dayIndex: number, day: ProgramDay) => {
    saveProgram({
      days: program.days.map((d) => (d.dayIndex === dayIndex ? day : d)),
    })
  }

  const toggleEventExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      return next
    })
  }

  const addEvent = (dayIndex: number) => {
    const day = program.days[dayIndex]
    const newEvent = createEmptyEvent()
    updateDay(dayIndex, { ...day, events: [...day.events, newEvent] })
    setExpandedEvents((prev) => new Set(prev).add(newEvent.id))
  }

  const updateEvent = (dayIndex: number, eventId: string, event: DayEvent) => {
    const day = program.days[dayIndex]
    updateDay(dayIndex, {
      ...day,
      events: day.events.map((e) => (e.id === eventId ? event : e)),
    })
  }

  const deleteEvent = (dayIndex: number, eventId: string) => {
    const day = program.days[dayIndex]
    updateDay(dayIndex, {
      ...day,
      events: day.events.filter((e) => e.id !== eventId),
    })
  }

  const handleDownloadPdf = async () => {
    setGenerating(true)
    try {
      await downloadProgramPdf(program, settings.churchName, members)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-6 page-enter">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          {atLimitPeople.length > 0 && (
            <Badge variant="warning" className="w-fit whitespace-normal">
              {atLimitPeople.length} al límite
            </Badge>
          )}
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              saveProgram({ status: program.status === 'complete' ? 'draft' : 'complete' })
            }
          >
            {program.status === 'complete' ? 'Marcar borrador' : 'Marcar completo'}
          </Button>
          <Button onClick={handleDownloadPdf} disabled={generating} className="w-full sm:w-auto">
            <Download className="h-4 w-4" />
            {generating ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </div>

      <div className="app-panel overflow-hidden">
        <div className="app-accent-bar mb-4" />
        <div className="space-y-2">
          <Label htmlFor="theme">Tema del mes</Label>
          <Input
            id="theme"
            value={program.monthlyTheme}
            onChange={(e) => saveProgram({ monthlyTheme: e.target.value })}
            placeholder="Ej: Junio: Mes de ayuno y oración"
          />
        </div>
        <p className="mt-3 break-words text-sm text-stone-500">
          {settings.churchName} · Semana del {formatProgramDate(program.weekStartDate)}
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <Tabs value={activeDay} onValueChange={setActiveDay}>
            <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-1">
              <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap gap-1">
                {program.days.map((day) => (
                  <TabsTrigger
                    key={day.dayIndex}
                    value={String(day.dayIndex)}
                    className="shrink-0 gap-1 px-3 py-2"
                  >
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

            {program.days.map((day) => (
              <TabsContent key={day.dayIndex} value={String(day.dayIndex)} className="min-w-0">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-display text-lg font-semibold break-words text-navy-dark">
                    {getDayLabel(day)}
                  </h3>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                    {day.events.length > 0 && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          onClick={() =>
                            setExpandedEvents((prev) => {
                              const next = new Set(prev)
                              day.events.forEach((e) => next.add(e.id))
                              return next
                            })
                          }
                        >
                          Expandir
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          onClick={() =>
                            setExpandedEvents((prev) => {
                              const next = new Set(prev)
                              day.events.forEach((e) => next.delete(e.id))
                              return next
                            })
                          }
                        >
                          Colapsar
                        </Button>
                      </>
                    )}
                    <Button size="sm" className="w-full sm:w-auto" onClick={() => addEvent(day.dayIndex)}>
                      <Plus className="h-4 w-4" />
                      Añadir evento
                    </Button>
                  </div>
                </div>

                {day.events.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-300/80 bg-white/50 py-12 text-center text-stone-500">
                    No hay eventos para este día.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.events.map((event) => (
                      <EventCard
                        key={event.id}
                        program={program}
                        event={event}
                        collapsed={!expandedEvents.has(event.id)}
                        onToggleCollapsed={() => toggleEventExpanded(event.id)}
                        onUpdate={(updated) => updateEvent(day.dayIndex, event.id, updated)}
                        onDelete={() => {
                          deleteEvent(day.dayIndex, event.id)
                          setExpandedEvents((prev) => {
                            const next = new Set(prev)
                            next.delete(event.id)
                            return next
                          })
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <aside className="min-w-0 space-y-4">
          <BirthdaysSection program={program} members={members} compact />
          <AssignmentCounter program={program} />
          {members.length === 0 && (
            <div className="rounded-xl border border-church-gold/30 bg-church-gold-soft/50 p-4 text-sm text-amber-900">
              No hay miembros registrados.{' '}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => navigate('/configuracion')}
              >
                Agregar en Configuración
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
