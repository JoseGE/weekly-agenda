import type { DayEvent, WeekTemplateDay, WeekTemplateEvent } from '@/types'

export function dayEventToTemplateEvent(
  event: DayEvent,
  templateEventId: string,
): WeekTemplateEvent {
  return {
    id: templateEventId,
    time: event.time,
    title: event.title,
    location: event.location?.trim() ? event.location.trim() : undefined,
    isSpecial: event.isSpecial,
    isSimpleAnnouncement: event.isSimpleAnnouncement,
    ministryId: event.ministryId,
  }
}

export function isEventInWeekTemplate(
  template: WeekTemplateDay[],
  templateEventId: string | undefined,
): boolean {
  if (!templateEventId) return false
  return template.some((day) => day.events.some((event) => event.id === templateEventId))
}

export function upsertTemplateEvent(
  template: WeekTemplateDay[],
  dayIndex: number,
  templateEvent: WeekTemplateEvent,
): WeekTemplateDay[] {
  const day = template.find((entry) => entry.dayIndex === dayIndex)
  if (!day) return template

  const existingIndex = day.events.findIndex((event) => event.id === templateEvent.id)
  const events =
    existingIndex === -1
      ? [...day.events, templateEvent]
      : day.events.map((event, index) => (index === existingIndex ? templateEvent : event))

  return template.map((entry) => (entry.dayIndex === dayIndex ? { ...entry, events } : entry))
}

export function removeTemplateEvent(
  template: WeekTemplateDay[],
  templateEventId: string,
): WeekTemplateDay[] {
  return template.map((day) => ({
    ...day,
    events: day.events.filter((event) => event.id !== templateEventId),
  }))
}
