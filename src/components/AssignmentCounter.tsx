import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { countPersonAppearances } from '@/lib/assignment-rules'
import type { WeeklyProgram } from '@/types'

interface AssignmentCounterProps {
  program: WeeklyProgram
}

export function AssignmentCounter({ program }: AssignmentCounterProps) {
  const counts = useMemo(() => {
    const map = countPersonAppearances(program)
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [program])

  const atLimit = counts.filter((p) => p.atLimit)

  if (counts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Apariciones esta semana</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">Aún no hay asignaciones.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Apariciones esta semana</CardTitle>
          {atLimit.length > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {atLimit.length} al límite
            </Badge>
          )}
        </div>
        <p className="text-xs text-stone-500">Máximo 2 apariciones por persona en toda la semana</p>
      </CardHeader>
      <CardContent className="max-h-80 space-y-2 overflow-y-auto">
        {counts.map((person) => (
          <div
            key={person.name}
            className="flex items-center justify-between rounded-md border border-stone-100 px-3 py-2 text-sm"
          >
            <span className={person.atLimit ? 'font-medium text-red-700' : 'text-stone-800'}>
              {person.name}
            </span>
            <Badge variant={person.atLimit ? 'destructive' : person.count === 1 ? 'secondary' : 'warning'}>
              {person.count}/2
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
