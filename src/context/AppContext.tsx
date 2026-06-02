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
import { createWeeklyProgram, getMondayOfWeek, sortMembersByName, sortPositionsByName } from '@/lib/program-utils'
import type {
  AppData,
  AppSettings,
  DayEvent,
  Member,
  MemberPosition,
  Ministry,
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
  ensureMember: (name: string) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  addMinistry: (name: string, description?: string) => Ministry
  updateMinistry: (id: string, updates: Partial<Ministry>) => void
  deleteMinistry: (id: string) => void
  addPosition: (name: string) => MemberPosition
  updatePosition: (id: string, updates: Partial<MemberPosition>) => void
  deletePosition: (id: string) => void
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
      const member: Member = { id: uuidv4(), name: name.trim(), active: true }
      updateData((prev) => ({ ...prev, members: [...prev.members, member] }))
      return member
    },
    [updateData],
  )

  const ensureMember = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return

      updateData((prev) => {
        const existing = findMemberByName(prev.members, trimmed)
        if (existing) {
          if (existing.active) return prev
          return {
            ...prev,
            members: prev.members.map((m) =>
              m.id === existing.id ? { ...m, active: true } : m,
            ),
          }
        }

        return {
          ...prev,
          members: [...prev.members, { id: uuidv4(), name: trimmed, active: true }],
        }
      })
    },
    [updateData],
  )

  const updateMember = useCallback(
    (id: string, updates: Partial<Member>) => {
      updateData((prev) => ({
        ...prev,
        members: prev.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      }))
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
      const monday = weekStartDate ?? getMondayOfWeek().toISOString().slice(0, 10)
      const program = createWeeklyProgram(
        monday,
        data.settings.churchName,
        monthlyTheme ?? data.settings.defaultMonthlyTheme,
      )
      updateData((prev) => ({ ...prev, programs: [program, ...prev.programs] }))
      return program
    },
    [data.settings.churchName, data.settings.defaultMonthlyTheme, updateData],
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
