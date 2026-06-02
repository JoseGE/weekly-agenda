import { formatProgramDate } from '@/lib/program-utils'
import { DAY_SHORT, type Member, type ProgramDay, type WeeklyProgram } from '@/types'

export interface DayBirthdays {
  day: ProgramDay
  members: Member[]
}

/** Members whose birth month/day falls on a program day (ignores birth year). */
export function getBirthdaysByProgramDay(
  program: WeeklyProgram,
  members: Member[],
): DayBirthdays[] {
  const withBirthday = members.filter((m) => m.active && m.birthDate?.trim())

  return program.days
    .map((day) => {
      const [, month, dayNum] = day.date.split('-').map(Number)
      const matching = withBirthday.filter((member) => {
        const [, bMonth, bDay] = member.birthDate!.split('-').map(Number)
        return bMonth === month && bDay === dayNum
      })
      matching.sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
      )
      return matching.length > 0 ? { day, members: matching } : null
    })
    .filter((entry): entry is DayBirthdays => entry !== null)
}

export function formatBirthdayDayLabel(day: ProgramDay): string {
  return `${DAY_SHORT[day.dayIndex]} ${formatProgramDate(day.date)}`
}
