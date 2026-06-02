import { DAY_NAMES } from '@/types'
import type { WeeklyProgram } from '@/types'

export type ProgramIssueKind =
  | 'missing-title'
  | 'missing-time'
  | 'missing-assignment-member'
  | 'no-events'

export interface ProgramIssue {
  kind: ProgramIssueKind
  dayIndex: number
  eventId?: string
  roleName?: string
  message: string
}

export function getProgramIssues(program: WeeklyProgram): ProgramIssue[] {
  const issues: ProgramIssue[] = []
  const totalEvents = program.days.reduce((sum, day) => sum + day.events.length, 0)

  if (totalEvents === 0) {
    issues.push({
      kind: 'no-events',
      dayIndex: 0,
      message: 'El programa no tiene eventos. Agrega al menos uno.',
    })
    return issues
  }

  for (const day of program.days) {
    for (const event of day.events) {
      const dayLabel = DAY_NAMES[day.dayIndex]

      if (!event.title.trim()) {
        issues.push({
          kind: 'missing-title',
          dayIndex: day.dayIndex,
          eventId: event.id,
          message: `${dayLabel}: evento sin título`,
        })
      }

      if (event.isSimpleAnnouncement) continue

      if (!event.time.trim()) {
        issues.push({
          kind: 'missing-time',
          dayIndex: day.dayIndex,
          eventId: event.id,
          message: `${dayLabel}: «${event.title.trim() || 'Sin título'}» sin hora`,
        })
      }

      for (const assignment of event.assignments) {
        const hasMember = assignment.members.some((name) => name.trim())
        if (!hasMember) {
          issues.push({
            kind: 'missing-assignment-member',
            dayIndex: day.dayIndex,
            eventId: event.id,
            roleName: assignment.roleName,
            message: `${dayLabel}: «${assignment.roleName}» sin persona asignada`,
          })
        }
      }
    }
  }

  return issues
}

export function isProgramReadyToComplete(program: WeeklyProgram): boolean {
  return getProgramIssues(program).length === 0
}
