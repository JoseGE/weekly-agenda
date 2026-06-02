import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPlus, Download, FileText, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { downloadProgramPdf } from '@/lib/download-program-pdf'
import { formatWeekRange, getMondayOfWeek } from '@/lib/program-utils'

export function HomePage() {
  const navigate = useNavigate()
  const { programs, createProgram, deleteProgram, settings, members } = useApp()
  const [weekStart, setWeekStart] = useState(getMondayOfWeek().toISOString().slice(0, 10))
  const [monthlyTheme, setMonthlyTheme] = useState(settings.defaultMonthlyTheme)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const handleCreate = () => {
    const program = createProgram(weekStart, monthlyTheme)
    navigate(`/programa/${program.id}`)
  }

  const handleDownloadPdf = async (programId: string) => {
    const program = programs.find((p) => p.id === programId)
    if (!program) return

    setGeneratingId(programId)
    try {
      await downloadProgramPdf(program, settings.churchName, members)
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-stone-900">Programas de la semana</h2>
        <p className="mt-1 text-stone-600">
          Crea y administra el programa semanal de la iglesia con validación de asignaciones.
        </p>
      </section>

      <Card className="border-church-gold/30 bg-cream/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-church-gold" />
            Nuevo programa
          </CardTitle>
          <CardDescription>La semana siempre comienza el lunes</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="week-start">Semana (lunes)</Label>
            <Input
              id="week-start"
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="monthly-theme">Tema del mes</Label>
            <Input
              id="monthly-theme"
              placeholder="Ej: Junio: Mes de ayuno y oración"
              value={monthlyTheme}
              onChange={(e) => setMonthlyTheme(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={handleCreate}>
              <CalendarPlus className="h-4 w-4" />
              Crear programa
            </Button>
          </div>
        </CardContent>
      </Card>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-4 text-stone-500">No hay programas guardados aún.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <Card key={program.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{formatWeekRange(program.weekStartDate)}</CardTitle>
                    <CardDescription className="mt-1">{settings.churchName}</CardDescription>
                  </div>
                  <Badge variant={program.status === 'complete' ? 'default' : 'secondary'}>
                    {program.status === 'complete' ? 'Completo' : 'Borrador'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.monthlyTheme && (
                  <p className="text-sm font-medium text-church-gold">{program.monthlyTheme}</p>
                )}
                <p className="text-xs text-stone-500">
                  Actualizado:{' '}
                  {format(new Date(program.updatedAt), "d MMM yyyy, HH:mm", { locale: es })}
                </p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/programa/${program.id}`}>Editar</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadPdf(program.id)}
                    disabled={generatingId === program.id}
                    title="Descargar PDF"
                  >
                    <Download className="h-4 w-4" />
                    {generatingId === program.id ? '...' : 'PDF'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm('¿Eliminar este programa?')) deleteProgram(program.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
