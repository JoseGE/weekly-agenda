import {
  formatAssignmentMembers,
  formatTimeForDisplay,
  getDayLabel,
  getOrderedEvents,
  hasAssignmentContent,
} from '@/lib/program-utils'
import {
  getProgramMobileViewFontSizes,
  type ProgramShareFontSizes,
} from '@/lib/program-share-font-scale'
import { formatBirthdayDayLabel, getBirthdaysByProgramDay } from '@/lib/birthday-utils'
import type { DayEvent, Member, ProgramDay, WeeklyProgram } from '@/types'

interface ProgramShareViewProps {
  program: WeeklyProgram
  churchName: string
  members: Member[]
  fontScale?: number
}

function ViewEvent({ event, sizes }: { event: DayEvent; sizes: ProgramShareFontSizes }) {
  if (event.isSimpleAnnouncement) {
    return (
      <div className="rounded-lg border-2 border-[#f0c987] bg-[#fef7ed] px-3.5 py-3">
        <p
          className="font-bold text-[#c47a2c]"
          style={{ fontSize: sizes.announcement, lineHeight: sizes.lineHeight }}
        >
          {event.title.trim() || 'Anuncio'}
        </p>
        {event.location?.trim() ? (
          <p
            className="mt-1.5 text-stone-700"
            style={{ fontSize: sizes.announcementLocation, lineHeight: sizes.lineHeight }}
          >
            {event.location}
          </p>
        ) : null}
      </div>
    )
  }

  const title = event.title.trim() || 'Actividad'
  const timeLabel = formatTimeForDisplay(event.time)
  const parts = event.assignments.filter(hasAssignmentContent)

  return (
    <div
      className={`rounded-lg border-2 px-3.5 py-3 ${
        event.isSpecial ? 'border-[#f59e0b] bg-[#fffbeb]' : 'border-stone-300 bg-white'
      }`}
    >
      {event.isSpecial ? (
        <p
          className="font-bold text-[#b45309]"
          style={{ fontSize: sizes.specialHeadline, lineHeight: sizes.lineHeight }}
        >
          {timeLabel ? `${timeLabel} · ${title}` : title}
        </p>
      ) : (
        <div className="flex flex-wrap items-start gap-2">
          {timeLabel ? (
            <span
              className="shrink-0 rounded-md bg-[#e8f0f7] px-2.5 py-1 font-bold text-[#1a4d7c]"
              style={{ fontSize: sizes.timeChip }}
            >
              {timeLabel}
            </span>
          ) : null}
          <p
            className="min-w-0 flex-1 font-bold text-stone-900"
            style={{ fontSize: sizes.eventTitle, lineHeight: sizes.lineHeight }}
          >
            {title}
          </p>
        </div>
      )}
      {event.location?.trim() ? (
        <p
          className="mt-1.5 text-stone-700"
          style={{ fontSize: sizes.eventLocation, lineHeight: sizes.lineHeight }}
        >
          {event.location}
        </p>
      ) : null}
      {parts.length > 0 ? (
        <div className="mt-2.5 rounded-md border border-stone-300 bg-stone-50 px-3 py-2.5">
          {parts.map((assignment) => (
            <p
              key={assignment.roleId}
              className="text-stone-900"
              style={{
                fontSize: sizes.partText,
                lineHeight: sizes.lineHeight,
                marginBottom: sizes.eventGap * 0.4,
              }}
            >
              <span className="font-bold text-[#0f2d4a]">{assignment.roleName}:</span>{' '}
              {formatAssignmentMembers(assignment)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ViewDaySection({ day, sizes }: { day: ProgramDay; sizes: ProgramShareFontSizes }) {
  if (day.events.length === 0) return null

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: sizes.eventGap }}>
      <div className="flex items-center gap-2.5">
        <span
          className="shrink-0 rounded-full bg-[#c47a2c]"
          style={{ width: sizes.dayDot, height: sizes.dayDot }}
        />
        <h3 className="font-bold text-[#0f2d4a]" style={{ fontSize: sizes.dayHeader }}>
          {getDayLabel(day)}
        </h3>
      </div>
      <div
        style={{
          marginLeft: sizes.eventIndent,
          display: 'flex',
          flexDirection: 'column',
          gap: sizes.eventGap,
        }}
      >
        {getOrderedEvents(day).map((event) => (
          <ViewEvent key={event.id} event={event} sizes={sizes} />
        ))}
      </div>
    </section>
  )
}

export function ProgramShareView({
  program,
  churchName,
  members,
  fontScale = 1,
}: ProgramShareViewProps) {
  const daysWithEvents = program.days.filter((day) => day.events.length > 0)
  const birthdays = getBirthdaysByProgramDay(program, members)
  const sizes = getProgramMobileViewFontSizes(fontScale)

  return (
    <article
      className="mx-auto w-full max-w-3xl px-4 py-4 font-serif text-stone-900"
      style={{ fontSize: sizes.partText, lineHeight: sizes.lineHeight }}
    >
      <div className="rounded-lg border-2 border-stone-300 bg-white px-3 py-4 text-center">
        <div
          className="mx-auto mb-2.5 rounded-full bg-[#c47a2c]"
          style={{ width: sizes.headerAccentWidth, height: sizes.headerAccentHeight }}
        />
        <h2
          className="font-bold leading-tight text-[#0f2d4a]"
          style={{ fontSize: sizes.churchName }}
        >
          {churchName}
        </h2>
        <p className="mt-1.5 font-bold text-[#1a4d7c]" style={{ fontSize: sizes.headerSubtitle }}>
          Programa de la semana
        </p>
        {program.monthlyTheme ? (
          <p
            className="mx-auto mt-2.5 inline-block rounded-full bg-[#e8f0f7] px-4 py-1.5 font-bold text-[#0f2d4a]"
            style={{ fontSize: sizes.themeText }}
          >
            {program.monthlyTheme}
          </p>
        ) : null}
      </div>

      <div
        style={{
          marginTop: sizes.sectionGap,
          display: 'flex',
          flexDirection: 'column',
          gap: sizes.sectionGap,
        }}
      >
        {daysWithEvents.map((day) => (
          <ViewDaySection key={day.dayIndex} day={day} sizes={sizes} />
        ))}
      </div>

      {birthdays.length > 0 ? (
        <div
          className="rounded-lg border-2 border-pink-300 bg-pink-50 px-3.5 py-3"
          style={{ marginTop: sizes.sectionGap }}
        >
          <p className="font-bold text-pink-900" style={{ fontSize: sizes.birthdaysTitle }}>
            Cumpleaños esta semana
          </p>
          <div className="mt-2 space-y-1.5">
            {birthdays.map(({ day, members: dayMembers }) => (
              <p
                key={day.dayIndex}
                className="text-stone-900"
                style={{ fontSize: sizes.birthdayRow, lineHeight: sizes.lineHeight }}
              >
                <span className="font-bold text-pink-900">{formatBirthdayDayLabel(day)}:</span>{' '}
                {dayMembers.map((member) => member.name).join(', ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="border-t-2 border-[#f0c987] pt-4 text-center"
        style={{ marginTop: sizes.sectionGap }}
      >
        <p className="font-bold text-[#c47a2c]" style={{ fontSize: sizes.footer }}>
          ¡Dios les bendiga!
        </p>
        <p className="mt-1.5 text-stone-600" style={{ fontSize: sizes.footerSub }}>
          {churchName}
        </p>
      </div>
    </article>
  )
}
