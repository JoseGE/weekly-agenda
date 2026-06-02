import { insforge, isInsForgeConfigured } from '@/lib/insforge'
import { getDefaultAppData } from '@/lib/program-utils'
import { STORAGE_KEY, type AppData } from '@/types'

const STATE_ID = 'default'
const TABLE = 'weekly_agenda_state'

export function normalizeAppData(raw: Partial<AppData> | null | undefined): AppData {
  const defaults = getDefaultAppData()
  if (!raw) return defaults

  return {
    members: Array.isArray(raw.members) ? raw.members : defaults.members,
    ministries:
      Array.isArray(raw.ministries) && raw.ministries.length > 0
        ? raw.ministries
        : defaults.ministries,
    positions:
      Array.isArray(raw.positions) && raw.positions.length > 0
        ? raw.positions
        : defaults.positions,
    programs: Array.isArray(raw.programs) ? raw.programs : defaults.programs,
    weekTemplate:
      Array.isArray(raw.weekTemplate) && raw.weekTemplate.length === 7
        ? raw.weekTemplate
        : defaults.weekTemplate,
    settings: { ...defaults.settings, ...raw.settings },
  }
}

function readLocalAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeAppData(JSON.parse(raw) as Partial<AppData>)
  } catch {
    return null
  }
}

function writeLocalAppData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function isEmptyRemotePayload(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return true
  const data = payload as Partial<AppData>
  const programs = Array.isArray(data.programs) ? data.programs : []
  const members = Array.isArray(data.members) ? data.members : []
  return programs.length === 0 && members.length === 0
}

function hasLocalData(data: AppData): boolean {
  return data.programs.length > 0 || data.members.length > 0
}

export async function loadAppData(): Promise<AppData> {
  const defaults = getDefaultAppData()
  const local = readLocalAppData()

  if (!isInsForgeConfigured || !insforge) {
    return local ?? defaults
  }

  const { data, error } = await insforge.database
    .from(TABLE)
    .select('payload')
    .eq('id', STATE_ID)
    .maybeSingle()

  if (error) {
    console.error('Error loading agenda from InsForge:', error)
    return local ?? defaults
  }

  const remotePayload = (data as { payload?: Partial<AppData> } | null)?.payload
  const remote = normalizeAppData(remotePayload)

  if (isEmptyRemotePayload(remotePayload) && local && hasLocalData(local)) {
    await saveAppData(local)
    writeLocalAppData(local)
    return local
  }

  writeLocalAppData(remote)
  return remote
}

export async function saveAppData(data: AppData): Promise<void> {
  const normalized = normalizeAppData(data)
  writeLocalAppData(normalized)

  if (!isInsForgeConfigured || !insforge) return

  const payload = {
    payload: normalized,
    updated_at: new Date().toISOString(),
  }

  const { data: updated, error: updateError } = await insforge.database
    .from(TABLE)
    .update(payload)
    .eq('id', STATE_ID)
    .select('id')

  if (updateError) {
    throw updateError
  }

  if (!updated?.length) {
    const { error: insertError } = await insforge.database.from(TABLE).insert({
      id: STATE_ID,
      ...payload,
    })

    if (insertError) {
      throw insertError
    }
  }
}
