import { Cake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatBirthdayDayLabel,
  getBirthdaysByProgramDay,
} from '@/lib/birthday-utils'
import type { Member, WeeklyProgram } from '@/types'

interface BirthdaysSectionProps {
  program: WeeklyProgram
  members: Member[]
  compact?: boolean
}

export function BirthdaysSection({ program, members, compact }: BirthdaysSectionProps) {
  const birthdays = getBirthdaysByProgramDay(program, members)

  if (birthdays.length === 0) return null

  if (compact) {
    return (
      <div className="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-3 text-sm shadow-sm">
        <p className="mb-2 flex items-center gap-1.5 font-semibold text-rose-900">
          <Cake className="h-4 w-4" />
          Cumpleaños esta semana
        </p>
        <ul className="space-y-1.5 text-rose-950/90">
          {birthdays.map(({ day, members: dayMembers }) => (
            <li key={day.dayIndex}>
              <span className="font-medium">{formatBirthdayDayLabel(day)}:</span>{' '}
              {dayMembers.map((m) => m.name).join(', ')}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <Card className="border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-rose-900">
          <Cake className="h-4 w-4" />
          Cumpleaños esta semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {birthdays.map(({ day, members: dayMembers }) => (
          <div key={day.dayIndex} className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="font-medium text-rose-900">{formatBirthdayDayLabel(day)}</span>
            <span className="text-rose-950/90">{dayMembers.map((m) => m.name).join(', ')}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
