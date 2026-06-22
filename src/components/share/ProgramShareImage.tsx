import {
  formatAssignmentMembers,
  formatTimeForDisplay,
  getDayLabel,
  hasAssignmentContent,
  sortEventsByTime,
} from '@/lib/program-utils'
import { formatBirthdayDayLabel, getBirthdaysByProgramDay } from '@/lib/birthday-utils'
import type { DayEvent, Member, ProgramDay, WeeklyProgram } from '@/types'

interface ProgramShareImageProps {
  program: WeeklyProgram
  churchName: string
  members: Member[]
}

function ShareEvent({ event }: { event: DayEvent }) {
  if (event.isSimpleAnnouncement) {
    return (
      <div className="rounded-md border border-[#f0c987] bg-[#fef7ed] px-3.5 py-2.5">
        <p className="text-base font-bold tracking-wide text-[#c47a2c]">ANUNCIO ESPECIAL</p>
        <p className="text-2xl font-bold text-[#c47a2c]">{event.title.trim() || 'Anuncio'}</p>
        {event.location?.trim() ? (
          <p className="mt-1.5 text-lg text-stone-600">{event.location}</p>
        ) : null}
      </div>
    )
  }

  const title = event.title.trim() || 'Actividad'
  const timeLabel = formatTimeForDisplay(event.time)
  const parts = event.assignments.filter(hasAssignmentContent)

  return (
    <div
      className={`rounded-md border px-3.5 py-2.5 ${
        event.isSpecial
          ? 'border-[#f59e0b] bg-[#fffbeb]'
          : 'border-stone-200 bg-white'
      }`}
    >
      {event.isSpecial ? (
        <p className="text-2xl font-bold text-[#b45309]">
          {timeLabel ? `${timeLabel} · ${title}` : title}
        </p>
      ) : (
        <div className="flex items-start gap-2.5">
          {timeLabel ? (
            <span className="shrink-0 rounded bg-[#e8f0f7] px-2.5 py-1 text-lg font-bold text-[#1a4d7c]">
              {timeLabel}
            </span>
          ) : null}
          <p className="text-2xl font-bold text-stone-900">{title}</p>
        </div>
      )}
      {event.location?.trim() ? (
        <p className="mt-1.5 text-lg text-stone-600">{event.location}</p>
      ) : null}
      {parts.length > 0 ? (
        <div className="mt-2.5 rounded border border-stone-200 bg-stone-50 px-3 py-2">
          <p className="mb-1.5 text-base font-bold tracking-wide text-[#1a4d7c]">
            PARTES DEL CULTO
          </p>
          {parts.map((assignment) => (
            <p key={assignment.roleId} className="text-xl leading-snug text-stone-800">
              <span className="font-bold text-[#0f2d4a]">{assignment.roleName}:</span>{' '}
              {formatAssignmentMembers(assignment)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ShareDaySection({ day }: { day: ProgramDay }) {
  if (day.events.length === 0) return null

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <span className="h-3 w-3 rounded-full bg-[#c47a2c]" />
        <h3 className="text-3xl font-bold text-[#0f2d4a]">{getDayLabel(day)}</h3>
      </div>
      <div className="ml-4 space-y-2.5">
        {sortEventsByTime(day.events).map((event) => (
          <ShareEvent key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}

export function ProgramShareImage({ program, churchName, members }: ProgramShareImageProps) {
  const daysWithEvents = program.days.filter((day) => day.events.length > 0)
  const birthdays = getBirthdaysByProgramDay(program, members)

  return (
    <div
      data-program-share-image
      className="box-border bg-white text-stone-900"
      style={{ width: 1080, padding: '20px 28px', fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <div className="rounded-lg border border-stone-200 px-4 py-4 text-center">
        <div className="mx-auto mb-2.5 h-1.5 w-16 rounded-full bg-[#c47a2c]" />
        <h1 className="text-[48px] font-bold leading-tight text-[#0f2d4a]">{churchName}</h1>
        <p className="mt-2 text-3xl font-bold text-[#1a4d7c]">Programa de la semana</p>
        {program.monthlyTheme ? (
          <p className="mx-auto mt-2.5 inline-block rounded-full bg-[#e8f0f7] px-5 py-1.5 text-2xl font-bold text-[#0f2d4a]">
            {program.monthlyTheme}
          </p>
        ) : null}
      </div>

      <div className="mt-3 space-y-3">
        {daysWithEvents.map((day) => (
          <ShareDaySection key={day.dayIndex} day={day} />
        ))}
      </div>

      {birthdays.length > 0 ? (
        <div className="mt-3 rounded-md border border-pink-200 bg-pink-50 px-3.5 py-3">
          <p className="text-2xl font-bold text-pink-900">Cumpleaños esta semana</p>
          <div className="mt-2 space-y-1.5">
            {birthdays.map(({ day, members: dayMembers }) => (
              <p key={day.dayIndex} className="text-xl text-stone-800">
                <span className="font-bold text-pink-900">{formatBirthdayDayLabel(day)}:</span>{' '}
                {dayMembers.map((member) => member.name).join(', ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 border-t border-[#f0c987] pt-4 text-center">
        <p className="text-3xl font-bold text-[#c47a2c]">¡Dios les bendiga!</p>
        <p className="mt-1.5 text-xl text-stone-500">{churchName}</p>
      </div>
    </div>
  )
}
