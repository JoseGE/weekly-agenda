export type RoleId =
  | 'dirige'
  | 'devocional'
  | 'mensaje'
  | 'especial'
  | 'la-palabra'
  | 'coro-ofrenda'
  | 'cultural'
  | 'himnos'
  | 'culto-altar'

export interface RoleDefinition {
  id: RoleId
  name: string
  allowMultiple: boolean
}

export const FIXED_ROLES: RoleDefinition[] = [
  { id: 'dirige', name: 'Dirige', allowMultiple: false },
  { id: 'devocional', name: 'Devocional', allowMultiple: false },
  { id: 'mensaje', name: 'Mensaje', allowMultiple: false },
  { id: 'especial', name: 'Especial', allowMultiple: false },
  { id: 'la-palabra', name: 'La palabra', allowMultiple: false },
  { id: 'coro-ofrenda', name: 'Coro de ofrenda', allowMultiple: false },
  { id: 'cultural', name: 'Cultural', allowMultiple: true },
  { id: 'himnos', name: 'Himnos', allowMultiple: true },
  { id: 'culto-altar', name: 'Culto de Altar', allowMultiple: true },
]

export const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const

export const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export interface Member {
  id: string
  name: string
  active: boolean
  address?: string
  birthDate?: string
  positionId?: string
}

export interface MemberPosition {
  id: string
  name: string
  active: boolean
}

export interface Ministry {
  id: string
  name: string
  description?: string
  active: boolean
}

export interface RoleAssignment {
  roleId: RoleId
  roleName: string
  members: string[]
}

export interface WeekTemplateEvent {
  id: string
  time: string
  title: string
  location?: string
  isSpecial: boolean
  isSimpleAnnouncement: boolean
  ministryId?: string
}

export interface WeekTemplateDay {
  dayIndex: number
  events: WeekTemplateEvent[]
}

export interface DayEvent {
  id: string
  time: string
  title: string
  location?: string
  isSpecial: boolean
  isSimpleAnnouncement: boolean
  ministryId?: string
  assignments: RoleAssignment[]
}

export interface ProgramDay {
  dayIndex: number
  date: string
  events: DayEvent[]
}

export interface WeeklyProgram {
  id: string
  churchName: string
  monthlyTheme: string
  weekStartDate: string
  status: 'draft' | 'complete'
  createdAt: string
  updatedAt: string
  days: ProgramDay[]
}

export interface AppSettings {
  churchName: string
  defaultMonthlyTheme: string
}

export interface AppData {
  members: Member[]
  ministries: Ministry[]
  positions: MemberPosition[]
  programs: WeeklyProgram[]
  weekTemplate: WeekTemplateDay[]
  settings: AppSettings
}

export const DEFAULT_SETTINGS: AppSettings = {
  churchName: 'Iglesia Evangélica Pentecostal Central, INC',
  defaultMonthlyTheme: '',
}

export const DEFAULT_MINISTRIES: Ministry[] = [
  { id: 'general', name: 'Culto General', active: true },
  { id: 'caballeros', name: 'Ministerio de los Caballeros', active: true },
  { id: 'damas', name: 'Ministerio de las Damas', active: true },
  { id: 'jovenes', name: 'Ministerio de los Jóvenes', active: true },
  { id: 'infantil', name: 'Ministerio Infantil', active: true },
  { id: 'social', name: 'Ministerio de Ayuda Social', active: true },
]

export const DEFAULT_MEMBER_POSITIONS: MemberPosition[] = [
  { id: 'pastor', name: 'Pastor/a', active: true },
  { id: 'pastor-asociado', name: 'Pastor/a Asociado', active: true },
  { id: 'presbitero', name: 'Presbítero', active: true },
  { id: 'presidente-damas', name: 'Presidente de damas', active: true },
  { id: 'presidente-caballeros', name: 'Presidente de caballeros', active: true },
  { id: 'secretaria-damas', name: 'Secretaria de damas', active: true },
  { id: 'secretario-caballeros', name: 'Secretario de caballeros', active: true },
  { id: 'evangelista', name: 'Evangelista', active: true },
  { id: 'vicepresidente-damas', name: 'Vicepresidente de damas', active: true },
  { id: 'vicepresidente-caballeros', name: 'Vicepresidente de caballeros', active: true },
  { id: 'vicepresidente-jovenes', name: 'Vicepresidente de jóvenes', active: true },
  { id: 'presidente-jovenes', name: 'Presidente de jóvenes', active: true },
  { id: 'secretario-jovenes', name: 'Secretario de jóvenes', active: true },
  { id: 'maestro', name: 'Maestro', active: true },
  { id: 'misionero', name: 'Misionero/a', active: true },
  { id: 'diacono', name: 'Diácono/a', active: true },
  { id: 'obrero', name: 'Obrero', active: true },
  { id: 'tesorero', name: 'Tesorero', active: true },
  { id: 'secretario-general', name: 'Secretario general', active: true },
]

export const STORAGE_KEY = 'weekly-agenda-data'
export const MAX_WEEKLY_ASSIGNMENTS = 2
