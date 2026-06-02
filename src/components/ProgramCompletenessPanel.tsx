import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProgramIssues, isProgramReadyToComplete } from '@/lib/program-validation'
import type { WeeklyProgram } from '@/types'

interface ProgramCompletenessPanelProps {
  program: WeeklyProgram
}

export function ProgramCompletenessPanel({ program }: ProgramCompletenessPanelProps) {
  const issues = getProgramIssues(program)
  const ready = isProgramReadyToComplete(program)

  return (
    <Card className={ready ? 'border-emerald-200/80 bg-emerald-50/40' : 'border-amber-200/80 bg-amber-50/40'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {ready ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
          Checklist del programa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ready ? (
          <p className="text-sm text-emerald-800">
            Todo listo. Puedes marcar el programa como completo.
          </p>
        ) : (
          <>
            <p className="text-sm text-amber-900">
              Corrige estos puntos antes de marcar como completo:
            </p>
            <ul className="space-y-2">
              {issues.map((issue, index) => (
                <li
                  key={`${issue.kind}-${issue.dayIndex}-${issue.eventId ?? index}`}
                  className="flex items-start gap-2 text-sm text-stone-700"
                >
                  <Badge variant="outline" className="mt-0.5 shrink-0 text-xs">
                    {issues.length - index}
                  </Badge>
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
