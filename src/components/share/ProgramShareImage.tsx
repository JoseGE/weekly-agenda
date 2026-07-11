import {
  formatAssignmentMembers,
  formatTimeForDisplay,
  getDayLabel,
  hasAssignmentContent,
  getOrderedEvents,
} from '@/lib/program-utils'
import { getProgramShareFontSizes, PROGRAM_SHARE_IMAGE_WIDTH, type ProgramShareFontSizes } from '@/lib/program-share-font-scale'
import { formatBirthdayDayLabel, getBirthdaysByProgramDay } from '@/lib/birthday-utils'
import type { DayEvent, Member, ProgramDay, WeeklyProgram } from '@/types'

export { PROGRAM_SHARE_IMAGE_WIDTH, PROGRAM_SHARE_IMAGE_PIXEL_RATIO } from '@/lib/program-share-font-scale'

interface ProgramShareImageProps {
  program: WeeklyProgram
  churchName: string
  members: Member[]
  fontScale?: number
}

function ShareEvent({ event, sizes }: { event: DayEvent; sizes: ProgramShareFontSizes }) {
  const cardStyle = {
    padding: sizes.cardPadding,
    borderRadius: sizes.cardRadius,
    border: `${sizes.borderWidth}px solid`,
  }

  if (event.isSimpleAnnouncement) {
    return (
      <div
        style={{
          ...cardStyle,
          borderColor: '#f0c987',
          backgroundColor: '#fef7ed',
        }}
      >
        <p
          className="font-bold text-[#b45309]"
          style={{ fontSize: sizes.eventTitle, lineHeight: sizes.lineHeight }}
        >
          {event.title.trim() || 'Anuncio'}
        </p>
        {event.location?.trim() ? (
          <p
            className="text-stone-700"
            style={{
              fontSize: sizes.eventLocation,
              lineHeight: sizes.lineHeight,
              marginTop: sizes.eventGap * 0.5,
            }}
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
  const isSpecial = event.isSpecial

  return (
    <div
      style={{
        ...cardStyle,
        borderColor: isSpecial ? '#f59e0b' : '#d6d3d1',
        backgroundColor: isSpecial ? '#fffbeb' : '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: sizes.eventGap }}>
        {timeLabel ? (
          <div
            style={{
              flexShrink: 0,
              backgroundColor: '#e8f0f7',
              borderRadius: sizes.cardRadius * 0.6,
              padding: `${sizes.eventGap * 0.35}px ${sizes.eventGap * 0.7}px`,
            }}
          >
            <span
              className="font-bold text-[#1a4d7c]"
              style={{ fontSize: sizes.timeChip, lineHeight: 1.2, whiteSpace: 'nowrap' }}
            >
              {timeLabel}
            </span>
          </div>
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="font-bold"
            style={{
              fontSize: sizes.eventTitle,
              lineHeight: sizes.lineHeight,
              color: isSpecial ? '#b45309' : '#1c1917',
            }}
          >
            {title}
          </p>
          {event.location?.trim() ? (
            <p
              className="text-stone-700"
              style={{
                fontSize: sizes.eventLocation,
                lineHeight: sizes.lineHeight,
                marginTop: sizes.eventGap * 0.4,
              }}
            >
              {event.location}
            </p>
          ) : null}
        </div>
      </div>

      {parts.length > 0 ? (
        <div
          style={{
            marginTop: sizes.eventGap,
            padding: sizes.eventGap * 0.8,
            borderRadius: sizes.cardRadius * 0.6,
            border: `${sizes.borderWidth}px solid #e7e5e4`,
            backgroundColor: '#fafaf9',
          }}
        >
          {parts.map((assignment, index) => (
            <p
              key={assignment.roleId}
              className="text-stone-900"
              style={{
                fontSize: sizes.partText,
                lineHeight: sizes.lineHeight,
                marginBottom: index < parts.length - 1 ? sizes.eventGap * 0.5 : 0,
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

function ShareDaySection({ day, sizes }: { day: ProgramDay; sizes: ProgramShareFontSizes }) {
  if (day.events.length === 0) return null

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: sizes.eventGap }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: sizes.eventGap * 0.8 }}>
        <span
          style={{
            flexShrink: 0,
            borderRadius: 9999,
            backgroundColor: '#c47a2c',
            width: sizes.dayDot,
            height: sizes.dayDot,
          }}
        />
        <h3 className="font-bold text-[#0f2d4a]" style={{ fontSize: sizes.dayHeader, lineHeight: 1.2 }}>
          {getDayLabel(day)}
        </h3>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: sizes.eventGap,
          paddingLeft: sizes.eventIndent,
        }}
      >
        {getOrderedEvents(day).map((event) => (
          <ShareEvent key={event.id} event={event} sizes={sizes} />
        ))}
      </div>
    </section>
  )
}

export function ProgramShareImage({
  program,
  churchName,
  members,
  fontScale = 1,
}: ProgramShareImageProps) {
  const daysWithEvents = program.days.filter((day) => day.events.length > 0)
  const birthdays = getBirthdaysByProgramDay(program, members)
  const sizes = getProgramShareFontSizes(fontScale)

  return (
    <div
      data-program-share-image
      style={{
        boxSizing: 'border-box',
        width: PROGRAM_SHARE_IMAGE_WIDTH,
        minWidth: PROGRAM_SHARE_IMAGE_WIDTH,
        maxWidth: PROGRAM_SHARE_IMAGE_WIDTH,
        padding: `${sizes.pagePaddingY}px ${sizes.pagePaddingX}px`,
        backgroundColor: '#ffffff',
        color: '#1c1917',
        fontFamily: '"Source Sans 3", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          border: `${sizes.borderWidth}px solid #e7e5e4`,
          borderRadius: sizes.cardRadius,
          padding: sizes.cardPadding,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            margin: '0 auto',
            marginBottom: sizes.eventGap,
            borderRadius: 9999,
            backgroundColor: '#c47a2c',
            width: sizes.headerAccentWidth,
            height: sizes.headerAccentHeight,
          }}
        />
        <h1
          className="font-bold text-[#0f2d4a]"
          style={{ fontSize: sizes.churchName, lineHeight: 1.15 }}
        >
          {churchName}
        </h1>
        <p
          className="font-bold text-[#1a4d7c]"
          style={{ fontSize: sizes.headerSubtitle, lineHeight: 1.2, marginTop: sizes.eventGap * 0.5 }}
        >
          Programa de la semana
        </p>
        {program.monthlyTheme ? (
          <p
            className="inline-block font-bold text-[#0f2d4a]"
            style={{
              fontSize: sizes.themeText,
              lineHeight: 1.25,
              marginTop: sizes.eventGap,
              padding: `${sizes.eventGap * 0.35}px ${sizes.eventGap}px`,
              borderRadius: 9999,
              backgroundColor: '#e8f0f7',
            }}
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
          <ShareDaySection key={day.dayIndex} day={day} sizes={sizes} />
        ))}
      </div>

      {birthdays.length > 0 ? (
        <div
          style={{
            marginTop: sizes.sectionGap,
            padding: sizes.cardPadding,
            borderRadius: sizes.cardRadius,
            border: `${sizes.borderWidth}px solid #f9a8d4`,
            backgroundColor: '#fdf2f8',
          }}
        >
          <p className="font-bold text-pink-900" style={{ fontSize: sizes.birthdaysTitle }}>
            Cumpleaños esta semana
          </p>
          <div style={{ marginTop: sizes.eventGap * 0.6 }}>
            {birthdays.map(({ day, members: dayMembers }) => (
              <p
                key={day.dayIndex}
                className="text-stone-900"
                style={{ fontSize: sizes.birthdayRow, lineHeight: sizes.lineHeight, marginTop: sizes.eventGap * 0.3 }}
              >
                <span className="font-bold text-pink-900">{formatBirthdayDayLabel(day)}:</span>{' '}
                {dayMembers.map((member) => member.name).join(', ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div
        style={{
          marginTop: sizes.sectionGap,
          paddingTop: sizes.sectionGap * 0.8,
          borderTop: `${sizes.borderWidth}px solid #f0c987`,
          textAlign: 'center',
        }}
      >
        <p className="font-bold text-[#c47a2c]" style={{ fontSize: sizes.footer }}>
          ¡Dios les bendiga!
        </p>
        <p className="text-stone-600" style={{ fontSize: sizes.footerSub, marginTop: sizes.eventGap * 0.4 }}>
          {churchName}
        </p>
      </div>
    </div>
  )
}
