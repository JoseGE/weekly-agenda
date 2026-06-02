import { useCallback, useEffect, useRef, useState } from 'react'
import { loadAppData, saveAppData } from '@/lib/agenda-repository'
import { getDefaultAppData } from '@/lib/program-utils'
import { isInsForgeConfigured } from '@/lib/insforge'
import type { AppData } from '@/types'

const SAVE_DEBOUNCE_MS = 600

export interface AppDataState {
  data: AppData
  loading: boolean
  isSyncing: boolean
  syncError: string | null
  isRemoteEnabled: boolean
}

export function useAppData(): [
  AppData,
  (value: AppData | ((prev: AppData) => AppData)) => void,
  Omit<AppDataState, 'data'>,
] {
  const [data, setDataState] = useState<AppData>(getDefaultAppData())
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestDataRef = useRef(data)

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  useEffect(() => {
    let cancelled = false

    loadAppData()
      .then((loaded) => {
        if (!cancelled) {
          setDataState(loaded)
          setSyncError(null)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : 'Error al cargar datos')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const flushSave = useCallback(async (next: AppData) => {
    if (!isInsForgeConfigured) return

    setIsSyncing(true)
    try {
      await saveAppData(next)
      setSyncError(null)
    } catch (error: unknown) {
      setSyncError(error instanceof Error ? error.message : 'Error al guardar en la nube')
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const setData = useCallback(
    (value: AppData | ((prev: AppData) => AppData)) => {
      setDataState((prev) => {
        const next = value instanceof Function ? value(prev) : value
        latestDataRef.current = next

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          void flushSave(next)
        }, SAVE_DEBOUNCE_MS)

        return next
      })
    },
    [flushSave],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  return [
    data,
    setData,
    {
      loading,
      isSyncing,
      syncError,
      isRemoteEnabled: isInsForgeConfigured,
    },
  ]
}
