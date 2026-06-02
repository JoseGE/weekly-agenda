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
      <div className="rounded-lg border border-pink-200 bg-pink-50 p-3 text-sm">
        <p className="mb-2 flex items-center gap-1.5 font-semibold text-pink-900">
          <Cake className="h-4 w-4" />
          Cumpleaños esta semana
        </p>
        <ul className="space-y-1.5 text-pink-950">
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
    <Card className="border-pink-200 bg-pink-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-pink-900">
          <Cake className="h-4 w-4" />
          Cumpleaños esta semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {birthdays.map(({ day, members: dayMembers }) => (
          <div key={day.dayIndex} className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="font-medium text-pink-900">{formatBirthdayDayLabel(day)}</span>
            <span className="text-pink-950">{dayMembers.map((m) => m.name).join(', ')}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
