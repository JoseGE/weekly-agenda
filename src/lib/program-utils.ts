import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { v4 as uuidv4 } from 'uuid'
import {
  DAY_NAMES,
  DEFAULT_MINISTRIES,
  DEFAULT_SETTINGS,
  type AppData,
  type DayEvent,
  type Member,
  type ProgramDay,
  type WeeklyProgram,
} from '@/types'

export function getMondayOfWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function formatProgramDate(dateStr: string): string {
  return format(new Date(dateStr + 'T12:00:00'), 'dd/MM/yy')
}

export function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate + 'T12:00:00')
  const end = addDays(start, 6)
  return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`
}

export function createEmptyEvent(): DayEvent {
  return {
    id: uuidv4(),
    time: '',
    title: '',
    location: '',
    isSpecial: false,
    isSimpleAnnouncement: false,
    assignments: [],
  }
}

export function createEmptyDays(weekStartDate: string): ProgramDay[] {
  const start = new Date(weekStartDate + 'T12:00:00')
  return DAY_NAMES.map((_, index) => ({
    dayIndex: index,
    date: format(addDays(start, index), 'yyyy-MM-dd'),
    events: [],
  }))
}

export function createWeeklyProgram(
  weekStartDate: string,
  churchName: string,
  monthlyTheme: string,
): WeeklyProgram {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    churchName,
    monthlyTheme,
    weekStartDate,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    days: createEmptyDays(weekStartDate),
  }
}

export function getDefaultAppData(): AppData {
  return {
    members: [],
    ministries: DEFAULT_MINISTRIES,
    programs: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function sortMembersByName(members: Member[]): Member[] {
  return [...members].sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  )
}

export function formatNamesList(names: string[]): string {
  const cleaned = names.map((n) => n.trim()).filter(Boolean)
  if (cleaned.length === 0) return ''
  if (cleaned.length === 1) return cleaned[0]
  if (cleaned.length === 2) return `${cleaned[0]} y ${cleaned[1]}`
  return `${cleaned.slice(0, -1).join(', ')} y ${cleaned[cleaned.length - 1]}`
}

export function getDayLabel(day: ProgramDay): string {
  return `${DAY_NAMES[day.dayIndex]}: ${formatProgramDate(day.date)}`
}

/** Formats stored time (HH:mm) for display in PDF; passes through legacy text values. */
export function formatTimeForDisplay(time: string): string {
  if (!time) return ''
  if (/am|pm/i.test(time)) return time
  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return time
  const hours = Number(match[1])
  const minutes = match[2]
  const period = hours >= 12 ? 'pm' : 'am'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${period}`
}

export function getEventSummary(event: DayEvent): string {
  const title = event.title.trim() || 'Sin título'
  if (event.isSimpleAnnouncement) return title
  const time = formatTimeForDisplay(event.time)
  return time ? `${time} — ${title}` : title
}
