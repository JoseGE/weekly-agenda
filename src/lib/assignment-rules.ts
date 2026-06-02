import type { WeeklyProgram } from '@/types'
import { normalizeName } from '@/lib/program-utils'

export interface PersonCount {
  name: string
  count: number
  atLimit: boolean
}

export function countPersonAppearances(
  program: WeeklyProgram,
  exclude?: { eventId: string; roleId?: string; memberIndex?: number },
): Map<string, PersonCount> {
  const counts = new Map<string, PersonCount>()

  for (const day of program.days) {
    for (const event of day.events) {
      for (const assignment of event.assignments) {
        assignment.members.forEach((member, memberIndex) => {
          const trimmed = member.trim()
          if (!trimmed) return

          if (
            exclude &&
            event.id === exclude.eventId &&
            assignment.roleId === exclude.roleId &&
            memberIndex === exclude.memberIndex
          ) {
            return
          }

          const key = normalizeName(trimmed)
          const existing = counts.get(key)
          if (existing) {
            existing.count += 1
            existing.atLimit = existing.count >= 2
          } else {
            counts.set(key, { name: trimmed, count: 1, atLimit: false })
          }
        })
      }
    }
  }

  for (const entry of counts.values()) {
    entry.atLimit = entry.count >= 2
  }

  return counts
}

export function getPersonCount(
  program: WeeklyProgram,
  personName: string,
  exclude?: { eventId: string; roleId?: string; memberIndex?: number },
): number {
  const normalized = normalizeName(personName)
  const counts = countPersonAppearances(program, exclude)
  return counts.get(normalized)?.count ?? 0
}

export function isPersonAtLimit(
  program: WeeklyProgram,
  personName: string,
  exclude?: { eventId: string; roleId?: string; memberIndex?: number },
): boolean {
  return getPersonCount(program, personName, exclude) >= 2
}

export function getPeopleAtLimit(program: WeeklyProgram): PersonCount[] {
  return [...countPersonAppearances(program).values()].filter((p) => p.atLimit)
}

export function findMemberByName(
  members: { id: string; name: string; active: boolean }[],
  name: string,
): { id: string; name: string; active: boolean } | undefined {
  const normalized = normalizeName(name)
  return members.find((m) => normalizeName(m.name) === normalized)
}
