import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { DayEvent, Member, ProgramDay, WeeklyProgram } from '@/types'
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

const colors = {
  white: '#ffffff',
  border: '#e5e7eb',
  navy: '#1a4d7c',
  navyDark: '#0f2d4a',
  navySoft: '#e8f0f7',
  gold: '#c47a2c',
  goldSoft: '#fef7ed',
  goldBorder: '#f0c987',
  special: '#b45309',
  specialSoft: '#fffbeb',
  specialBorder: '#f59e0b',
  text: '#1c1917',
  textSoft: '#57534e',
  textMuted: '#78716c',
  partBg: '#fafaf9',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 24,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: colors.text,
  },
  header: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 3,
    alignItems: 'center',
  },
  headerAccent: {
    width: 32,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 1,
    marginBottom: 2,
  },
  churchName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: colors.navyDark,
    lineHeight: 1.1,
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 2,
  },
  themePill: {
    backgroundColor: colors.navySoft,
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  themeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.navyDark,
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 5,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    marginTop: 2,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginRight: 6,
  },
  dayHeaderText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.navyDark,
  },
  announcementCard: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 4,
    marginLeft: 12,
  },
  announcementTag: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.gold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  announcementText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.gold,
    lineHeight: 1.35,
  },
  announcementLocation: {
    fontSize: 11,
    color: colors.textSoft,
    marginTop: 2,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 4,
    marginLeft: 12,
  },
  eventCardSpecial: {
    borderColor: colors.specialBorder,
    borderWidth: 1,
    backgroundColor: colors.specialSoft,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  timeChip: {
    backgroundColor: colors.navySoft,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
  },
  timeChipText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
  },
  eventTitle: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    lineHeight: 1,
  },
  specialHeadline: {
    fontSize: 13.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.special,
    lineHeight: 1,
    marginBottom: 1,
  },
  eventLocation: {
    fontSize: 12,
    color: colors.textSoft,
    marginBottom: 2,
    marginTop: 1,
  },
  partsBox: {
    backgroundColor: colors.partBg,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginTop: 1,
  },
  partRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  partName: {
    width: 105,
    fontSize: 12.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.navyDark,
  },
  partMembers: {
    flex: 1,
    fontSize: 12.5,
    color: colors.text,
  },
  footer: {
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.goldBorder,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.gold,
  },
  footerSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 12,
    right: 28,
    fontSize: 8,
    color: colors.textMuted,
  },
  birthdaysBox: {
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginTop: 5,
    marginBottom: 4,
  },
  birthdaysTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#9d174d',
    marginBottom: 3,
  },
  birthdayRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  birthdayDay: {
    width: 76,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#831843',
  },
  birthdayNames: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
  },
})


function PdfHeader({
  program,
  churchName,
}: {
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

function AnnouncementBlock({ event }: { event: DayEvent }) {
  const title = event.title.trim() || 'Anuncio'
  const location = event.location?.trim()

  return (
    <View style={styles.announcementCard} wrap={false}>
      <Text style={styles.announcementText}>{title}</Text>
      {location ? <Text style={styles.announcementLocation}>{location}</Text> : null}
    </View>
  )
}

function ServiceBlock({ event }: { event: DayEvent }) {
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

function PdfEventBlock({ event }: { event: DayEvent }) {
  if (event.isSimpleAnnouncement) {
    return <AnnouncementBlock event={event} />
  }
  return <ServiceBlock event={event} />
}

function PdfBirthdaysSection({
  program,
  members,
}: {
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

function PdfDaySection({ day }: { day: ProgramDay }) {
  if (day.events.length === 0) return null

  const [firstEvent, ...restEvents] = sortEventsByTime(day.events)

  return (
    <View style={styles.daySection}>
      <View wrap={false}>
        <View style={styles.dayHeaderRow}>
          <View style={styles.dayDot} />
          <Text style={styles.dayHeaderText}>{getDayLabel(day)}</Text>
        </View>
        <PdfEventBlock event={firstEvent} />
      </View>
      {restEvents.map((event) => (
        <PdfEventBlock key={event.id} event={event} />
      ))}
    </View>
  )
}

interface ProgramPdfDocumentProps {
  program: WeeklyProgram
  churchName: string
  members: Member[]
}

export function ProgramPdfDocument({ program, churchName, members }: ProgramPdfDocumentProps) {
  const daysWithEvents = program.days.filter((day) => day.events.length > 0)

  return (
    <Document title={`Programa ${program.weekStartDate}`}>
      <Page size="LETTER" style={styles.page} wrap>
        <PdfHeader program={program} churchName={churchName} />
        {daysWithEvents.map((day) => (
          <PdfDaySection key={day.dayIndex} day={day} />
        ))}
        <PdfBirthdaysSection program={program} members={members} />
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
