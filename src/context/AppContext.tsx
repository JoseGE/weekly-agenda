import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useAppData } from '@/hooks/useAppData'
import { findMemberByName } from '@/lib/assignment-rules'
import { deduplicateAllMembers } from '@/lib/member-utils'
import { createWeeklyProgram, getMondayOfWeek, sortMembersByName, sortPositionsByName } from '@/lib/program-utils'
import type {
  AppData,
  AppSettings,
  DayEvent,
  Member,
  MemberPosition,
  Ministry,
  WeekTemplateDay,
  WeeklyProgram,
} from '@/types'

interface AppContextValue {
  data: AppData
  members: Member[]
  ministries: Ministry[]
  positions: MemberPosition[]
  programs: WeeklyProgram[]
  settings: AppSettings
  loading: boolean
  isSyncing: boolean
  syncError: string | null
  isRemoteEnabled: boolean
  addMember: (name: string) => Member
  ensureMember: (name: string) => Member | undefined
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  addMinistry: (name: string, description?: string) => Ministry
  updateMinistry: (id: string, updates: Partial<Ministry>) => void
  deleteMinistry: (id: string) => void
  addPosition: (name: string) => MemberPosition
  updatePosition: (id: string, updates: Partial<MemberPosition>) => void
  deletePosition: (id: string) => void
  updateWeekTemplate: (template: WeekTemplateDay[]) => void
  updateSettings: (updates: Partial<AppSettings>) => void
  createProgram: (weekStartDate?: string, monthlyTheme?: string) => WeeklyProgram
  updateProgram: (program: WeeklyProgram) => void
  deleteProgram: (id: string) => void
  getProgram: (id: string) => WeeklyProgram | undefined
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData, { loading, isSyncing, syncError, isRemoteEnabled }] = useAppData()

  const updateData = useCallback(
    (updater: (prev: AppData) => AppData) => {
      setData((prev) => updater(prev))
    },
    [setData],
  )

  const addMember = useCallback(
    (name: string): Member => {
      const trimmed = name.trim()
      const now = new Date().toISOString()
      let resolved: Member = { id: uuidv4(), name: trimmed, active: true, createdAt: now }

      updateData((prev) => {
        const sameSpelling = prev.members.find((member) => member.name.trim() === trimmed)
        let next: AppData = prev

        if (sameSpelling) {
          resolved = sameSpelling.active
            ? sameSpelling
            : { ...sameSpelling, active: true }
          if (!sameSpelling.active) {
            next = {
              ...prev,
              members: prev.members.map((member) =>
                member.id === sameSpelling.id ? { ...member, active: true } : member,
              ),
            }
          }
        } else {
          const member: Member = {
            id: uuidv4(),
            name: trimmed,
            active: true,
            createdAt: now,
          }
          resolved = member
          next = { ...prev, members: [...prev.members, member] }
        }

        const deduped = deduplicateAllMembers(next)
        const matched = findMemberByName(deduped.members, trimmed)
        if (matched) resolved = matched
        return deduped
      })

      return resolved
    },
    [updateData],
  )

  const ensureMember = useCallback(
    (name: string): Member | undefined => {
      const trimmed = name.trim()
      if (!trimmed) return undefined
      const now = new Date().toISOString()
      let resolved: Member | undefined

      updateData((prev) => {
        const existing = findMemberByName(prev.members, trimmed)
        let next: AppData = prev

        if (existing && existing.name.trim() === trimmed) {
          resolved = existing.active
            ? existing
            : { ...existing, active: true }
          if (!existing.active) {
            next = {
              ...prev,
              members: prev.members.map((member) =>
                member.id === existing.id ? { ...member, active: true } : member,
              ),
            }
          }
        } else {
          const member: Member = {
            id: uuidv4(),
            name: trimmed,
            active: true,
            createdAt: now,
          }
          resolved = member
          next = { ...prev, members: [...prev.members, member] }
        }

        const deduped = deduplicateAllMembers(next)
        const matched = findMemberByName(deduped.members, trimmed)
        if (matched) resolved = matched
        return deduped
      })

      return resolved
    },
    [updateData],
  )

  const updateMember = useCallback(
    (id: string, updates: Partial<Member>) => {
      updateData((prev) => {
        if (updates.name !== undefined) {
          const trimmed = updates.name.trim()
          const conflict = prev.members.find(
            (member) => member.id !== id && findMemberByName([member], trimmed),
          )
          if (conflict) return prev
        }

        const next: AppData = {
          ...prev,
          members: prev.members.map((member) =>
            member.id === id ? { ...member, ...updates } : member,
          ),
        }
        return deduplicateAllMembers(next)
      })
    },
    [updateData],
  )

  const deleteMember = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
      }))
    },
    [updateData],
  )

  const addMinistry = useCallback(
    (name: string, description?: string): Ministry => {
      const ministry: Ministry = {
        id: uuidv4(),
        name: name.trim(),
        description,
        active: true,
      }
      updateData((prev) => ({ ...prev, ministries: [...prev.ministries, ministry] }))
      return ministry
    },
    [updateData],
  )

  const updateMinistry = useCallback(
    (id: string, updates: Partial<Ministry>) => {
      updateData((prev) => ({
        ...prev,
        ministries: prev.ministries.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }))
    },
    [updateData],
  )

  const deleteMinistry = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        ministries: prev.ministries.filter((m) => m.id !== id),
      }))
    },
    [updateData],
  )

  const addPosition = useCallback(
    (name: string): MemberPosition => {
      const position: MemberPosition = {
        id: uuidv4(),
        name: name.trim(),
        active: true,
      }
      updateData((prev) => ({ ...prev, positions: [...prev.positions, position] }))
      return position
    },
    [updateData],
  )

  const updatePosition = useCallback(
    (id: string, updates: Partial<MemberPosition>) => {
      updateData((prev) => ({
        ...prev,
        positions: prev.positions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }))
    },
    [updateData],
  )

  const deletePosition = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        positions: prev.positions.filter((p) => p.id !== id),
        members: prev.members.map((m) =>
          m.positionId === id ? { ...m, positionId: undefined } : m,
        ),
      }))
    },
    [updateData],
  )

  const updateWeekTemplate = useCallback(
    (template: WeekTemplateDay[]) => {
      updateData((prev) => ({ ...prev, weekTemplate: template }))
    },
    [updateData],
  )

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      updateData((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }))
    },
    [updateData],
  )

  const createProgram = useCallback(
    (weekStartDate?: string, monthlyTheme?: string): WeeklyProgram => {
      const program = createWeeklyProgram(
        weekStartDate ?? getMondayOfWeek().toISOString().slice(0, 10),
        data.settings.churchName,
        monthlyTheme ?? data.settings.defaultMonthlyTheme,
        data.weekTemplate,
      )
      updateData((prev) => ({ ...prev, programs: [program, ...prev.programs] }))
      return program
    },
    [data.settings.churchName, data.settings.defaultMonthlyTheme, data.weekTemplate, updateData],
  )

  const updateProgram = useCallback(
    (program: WeeklyProgram) => {
      const updated = { ...program, updatedAt: new Date().toISOString() }
      updateData((prev) => ({
        ...prev,
        programs: prev.programs.map((p) => (p.id === updated.id ? updated : p)),
      }))
    },
    [updateData],
  )

  const deleteProgram = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        programs: prev.programs.filter((p) => p.id !== id),
      }))
    },
    [updateData],
  )

  const getProgram = useCallback(
    (id: string) => data.programs.find((p) => p.id === id),
    [data.programs],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      members: sortMembersByName(data.members),
      ministries: data.ministries.filter((m) => m.active),
      positions: sortPositionsByName(data.positions.filter((p) => p.active)),
      programs: data.programs,
      settings: data.settings,
      loading,
      isSyncing,
      syncError,
      isRemoteEnabled,
      addMember,
      ensureMember,
      updateMember,
      deleteMember,
      addMinistry,
      updateMinistry,
      deleteMinistry,
      addPosition,
      updatePosition,
      deletePosition,
      updateWeekTemplate,
      updateSettings,
      createProgram,
      updateProgram,
      deleteProgram,
      getProgram,
    }),
    [
      data,
      loading,
      isSyncing,
      syncError,
      isRemoteEnabled,
      addMember,
      ensureMember,
      updateMember,
      deleteMember,
      addMinistry,
      updateMinistry,
      deleteMinistry,
      addPosition,
      updatePosition,
      deletePosition,
      updateWeekTemplate,
      updateSettings,
      createProgram,
      updateProgram,
      deleteProgram,
      getProgram,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export type { DayEvent, WeeklyProgram }
