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
      <div className="rounded-lg border border-[#f0c987] bg-[#fef7ed] px-3 py-2">
        <p className="text-[10px] font-bold tracking-wide text-[#c47a2c]">ANUNCIO ESPECIAL</p>
        <p className="text-sm font-bold text-[#c47a2c]">{event.title.trim() || 'Anuncio'}</p>
        {event.location?.trim() ? (
          <p className="mt-1 text-xs text-stone-600">{event.location}</p>
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
      className={`rounded-lg border px-3 py-2 ${
        event.isSpecial
          ? 'border-[#f59e0b] bg-[#fffbeb]'
          : 'border-stone-200 bg-white'
      }`}
    >
      {event.isSpecial ? (
        <p className="text-sm font-bold text-[#b45309]">
          {timeLabel ? `${timeLabel} · ${title}` : title}
        </p>
      ) : (
        <div className="flex items-start gap-2">
          {timeLabel ? (
            <span className="shrink-0 rounded-md bg-[#e8f0f7] px-2 py-0.5 text-xs font-bold text-[#1a4d7c]">
              {timeLabel}
            </span>
          ) : null}
          <p className="text-sm font-bold text-stone-900">{title}</p>
        </div>
      )}
      {event.location?.trim() ? (
        <p className="mt-1 text-xs text-stone-600">{event.location}</p>
      ) : null}
      {parts.length > 0 ? (
        <div className="mt-2 rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5">
          <p className="mb-1 text-[10px] font-bold tracking-wide text-[#1a4d7c]">
            PARTES DEL CULTO
          </p>
          {parts.map((assignment) => (
            <p key={assignment.roleId} className="text-xs leading-relaxed text-stone-800">
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
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#c47a2c]" />
        <h3 className="text-base font-bold text-[#0f2d4a]">{getDayLabel(day)}</h3>
      </div>
      <div className="ml-4 space-y-2">
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
      style={{ width: 1080, padding: '32px 40px', fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      <div className="rounded-xl border border-stone-200 px-6 py-5 text-center">
        <div className="mx-auto mb-3 h-1 w-14 rounded-full bg-[#c47a2c]" />
        <h1 className="text-[28px] font-bold leading-tight text-[#0f2d4a]">{churchName}</h1>
        <p className="mt-2 text-lg font-bold text-[#1a4d7c]">Programa de la semana</p>
        {program.monthlyTheme ? (
          <p className="mx-auto mt-3 inline-block rounded-full bg-[#e8f0f7] px-4 py-1 text-sm font-bold text-[#0f2d4a]">
            {program.monthlyTheme}
          </p>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {daysWithEvents.map((day) => (
          <ShareDaySection key={day.dayIndex} day={day} />
        ))}
      </div>

      {birthdays.length > 0 ? (
        <div className="mt-5 rounded-lg border border-pink-200 bg-pink-50 px-4 py-3">
          <p className="text-sm font-bold text-pink-900">Cumpleaños esta semana</p>
          <div className="mt-2 space-y-1">
            {birthdays.map(({ day, members: dayMembers }) => (
              <p key={day.dayIndex} className="text-sm text-stone-800">
                <span className="font-bold text-pink-900">{formatBirthdayDayLabel(day)}:</span>{' '}
                {dayMembers.map((member) => member.name).join(', ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-[#f0c987] pt-4 text-center">
        <p className="text-lg font-bold text-[#c47a2c]">¡Dios les bendiga!</p>
        <p className="mt-1 text-sm text-stone-500">{churchName}</p>
      </div>
    </div>
  )
}
