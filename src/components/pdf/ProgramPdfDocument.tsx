import {
  Document,
  Page,
  Text,
  View,
} from '@react-pdf/renderer'
import type { DayEvent, Member, ProgramDay, WeeklyProgram } from '@/types'
import { createPdfStyles, type PdfStyles } from '@/lib/pdf-document-styles'
import { PDF_FONT_SCALE_DEFAULT } from '@/lib/pdf-font-scale'
import {
  formatAssignmentMembers,
  formatTimeForDisplay,
  getDayLabel,
  hasAssignmentContent,
  sortEventsByTime,
} from '@/lib/program-utils'
import {
  formatBirthdayDayLabel,
  getBirthdaysByProgramDay,
} from '@/lib/birthday-utils'

function PdfHeader({
  styles,
  program,
  churchName,
}: {
  styles: PdfStyles
  program: WeeklyProgram
  churchName: string
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerAccent} />
      <Text style={styles.churchName}>{churchName}</Text>
      <Text style={styles.headerSubtitle}>Programa de la semana</Text>
      {program.monthlyTheme ? (
        <View style={styles.themePill}>
          <Text style={styles.themeText}>{program.monthlyTheme}</Text>
        </View>
      ) : null}
    </View>
  )
}

function AnnouncementBlock({ styles, event }: { styles: PdfStyles; event: DayEvent }) {
  const title = event.title.trim() || 'Anuncio'
  const location = event.location?.trim()

  return (
    <View style={styles.announcementCard} wrap={false}>
      <Text style={styles.announcementText}>{title}</Text>
      {location ? <Text style={styles.announcementLocation}>{location}</Text> : null}
    </View>
  )
}

function ServiceBlock({ styles, event }: { styles: PdfStyles; event: DayEvent }) {
  const title = event.title.trim() || 'Actividad'
  const timeLabel = formatTimeForDisplay(event.time)
  const location = event.location?.trim()
  const parts = event.assignments.filter(hasAssignmentContent)
  const isSpecial = event.isSpecial

  return (
    <View style={[styles.eventCard, isSpecial ? styles.eventCardSpecial : {}]} wrap={false}>
      {isSpecial ? (
        <Text style={styles.specialHeadline}>
          {timeLabel ? `${timeLabel} · ${title}` : title}
        </Text>
      ) : (
        <View style={styles.headlineRow}>
          {timeLabel ? (
            <View style={styles.timeChip}>
              <Text style={styles.timeChipText}>{timeLabel}</Text>
            </View>
          ) : null}
          <Text style={styles.eventTitle}>{title}</Text>
        </View>
      )}

      {location ? <Text style={styles.eventLocation}>{location}</Text> : null}

      {parts.length > 0 ? (
        <View style={styles.partsBox}>
          {parts.map((assignment) => (
            <View key={assignment.roleId} style={styles.partRow}>
              <Text style={styles.partName}>{assignment.roleName}:</Text>
              <Text style={styles.partMembers}>
                {formatAssignmentMembers(assignment)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

function PdfEventBlock({ styles, event }: { styles: PdfStyles; event: DayEvent }) {
  if (event.isSimpleAnnouncement) {
    return <AnnouncementBlock styles={styles} event={event} />
  }
  return <ServiceBlock styles={styles} event={event} />
}

function PdfBirthdaysSection({
  styles,
  program,
  members,
}: {
  styles: PdfStyles
  program: WeeklyProgram
  members: Member[]
}) {
  const birthdays = getBirthdaysByProgramDay(program, members)
  if (birthdays.length === 0) return null

  return (
    <View style={styles.birthdaysBox} wrap={false}>
      <Text style={styles.birthdaysTitle}>Cumpleaños esta semana</Text>
      {birthdays.map(({ day, members: dayMembers }) => (
        <View key={day.dayIndex} style={styles.birthdayRow}>
          <Text style={styles.birthdayDay}>{formatBirthdayDayLabel(day)}</Text>
          <Text style={styles.birthdayNames}>
            {dayMembers.map((m) => m.name).join(', ')}
          </Text>
        </View>
      ))}
    </View>
  )
}

function PdfDaySection({ styles, day }: { styles: PdfStyles; day: ProgramDay }) {
  if (day.events.length === 0) return null

  const [firstEvent, ...restEvents] = sortEventsByTime(day.events)

  return (
    <View style={styles.daySection}>
      <View wrap={false}>
        <View style={styles.dayHeaderRow}>
          <View style={styles.dayDot} />
          <Text style={styles.dayHeaderText}>{getDayLabel(day)}</Text>
        </View>
        <PdfEventBlock styles={styles} event={firstEvent} />
      </View>
      {restEvents.map((event) => (
        <PdfEventBlock key={event.id} styles={styles} event={event} />
      ))}
    </View>
  )
}

export interface ProgramPdfDocumentProps {
  program: WeeklyProgram
  churchName: string
  members: Member[]
  fontScale?: number
}

export function ProgramPdfDocument({
  program,
  churchName,
  members,
  fontScale = PDF_FONT_SCALE_DEFAULT,
}: ProgramPdfDocumentProps) {
  const styles = createPdfStyles(fontScale)
  const daysWithEvents = program.days.filter((day) => day.events.length > 0)

  return (
    <Document title={`Programa ${program.weekStartDate}`}>
      <Page size="LETTER" style={styles.page} wrap>
        <PdfHeader styles={styles} program={program} churchName={churchName} />
        {daysWithEvents.map((day) => (
          <PdfDaySection key={day.dayIndex} styles={styles} day={day} />
        ))}
        <PdfBirthdaysSection styles={styles} program={program} members={members} />
        <View style={styles.footer} wrap={false}>
          <Text style={styles.footerText}>¡Dios les bendiga!</Text>
        </View>
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber }) => `${pageNumber}`}
        />
      </Page>
    </Document>
  )
}
