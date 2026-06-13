import { formatNamesList, formatTimeForDisplay, getDayLabel } from '@/lib/program-utils'
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
      <div className="rounded-md border border-[#f0c987] bg-[#fef7ed] px-2.5 py-1.5">
        <p className="text-[11px] font-bold tracking-wide text-[#c47a2c]">ANUNCIO ESPECIAL</p>
        <p className="text-base font-bold text-[#c47a2c]">{event.title.trim() || 'Anuncio'}</p>
        {event.location?.trim() ? (
          <p className="mt-0.5 text-sm text-stone-600">{event.location}</p>
        ) : null}
      </div>
    )
  }

  const title = event.title.trim() || 'Actividad'
  const timeLabel = formatTimeForDisplay(event.time)
  const parts = event.assignments.filter((assignment) =>
    assignment.members.some((member) => member.trim()),
  )

  return (
    <div
      className={`rounded-md border px-2.5 py-1.5 ${
        event.isSpecial
          ? 'border-[#f59e0b] bg-[#fffbeb]'
          : 'border-stone-200 bg-white'
      }`}
    >
      {event.isSpecial ? (
        <p className="text-base font-bold text-[#b45309]">
          {timeLabel ? `${timeLabel} · ${title}` : title}
        </p>
      ) : (
        <div className="flex items-start gap-1.5">
          {timeLabel ? (
            <span className="shrink-0 rounded bg-[#e8f0f7] px-1.5 py-0.5 text-sm font-bold text-[#1a4d7c]">
              {timeLabel}
            </span>
          ) : null}
          <p className="text-base font-bold text-stone-900">{title}</p>
        </div>
      )}
      {event.location?.trim() ? (
        <p className="mt-0.5 text-sm text-stone-600">{event.location}</p>
      ) : null}
      {parts.length > 0 ? (
        <div className="mt-1.5 rounded border border-stone-200 bg-stone-50 px-2 py-1">
          <p className="mb-0.5 text-[11px] font-bold tracking-wide text-[#1a4d7c]">
            PARTES DEL CULTO
          </p>
          {parts.map((assignment) => (
            <p key={assignment.roleId} className="text-sm leading-snug text-stone-800">
              <span className="font-bold text-[#0f2d4a]">{assignment.roleName}:</span>{' '}
              {formatNamesList(assignment.members)}
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
    <section className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#c47a2c]" />
        <h3 className="text-lg font-bold text-[#0f2d4a]">{getDayLabel(day)}</h3>
      </div>
      <div className="ml-3.5 space-y-1.5">
        {day.events.map((event) => (
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
      <div className="rounded-lg border border-stone-200 px-4 py-3 text-center">
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-[#c47a2c]" />
        <h1 className="text-[32px] font-bold leading-tight text-[#0f2d4a]">{churchName}</h1>
        <p className="mt-1 text-xl font-bold text-[#1a4d7c]">Programa de la semana</p>
        {program.monthlyTheme ? (
          <p className="mx-auto mt-2 inline-block rounded-full bg-[#e8f0f7] px-3 py-0.5 text-base font-bold text-[#0f2d4a]">
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
        <div className="mt-3 rounded-md border border-pink-200 bg-pink-50 px-3 py-2">
          <p className="text-base font-bold text-pink-900">Cumpleaños esta semana</p>
          <div className="mt-1 space-y-0.5">
            {birthdays.map(({ day, members: dayMembers }) => (
              <p key={day.dayIndex} className="text-base text-stone-800">
                <span className="font-bold text-pink-900">{formatBirthdayDayLabel(day)}:</span>{' '}
                {dayMembers.map((member) => member.name).join(', ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 border-t border-[#f0c987] pt-3 text-center">
        <p className="text-xl font-bold text-[#c47a2c]">¡Dios les bendiga!</p>
        <p className="mt-0.5 text-base text-stone-500">{churchName}</p>
      </div>
    </div>
  )
}
