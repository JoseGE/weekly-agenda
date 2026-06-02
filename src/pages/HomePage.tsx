import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPlus, Download, FileText, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
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
    <div className="space-y-10">
      <PageHeader
        title="Programas de la semana"
        description="Crea y administra el programa semanal con validación de asignaciones y exportación a PDF."
      />

      <Card className="page-enter stagger-1 overflow-hidden border-church-gold/25 bg-gradient-to-br from-church-gold-soft/80 via-white to-navy-soft/30">
        <div className="h-1 bg-gradient-to-r from-navy-dark via-church-gold to-transparent" />
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
            <Button onClick={handleCreate} size="lg">
              <CalendarPlus className="h-4 w-4" />
              Crear programa
            </Button>
          </div>
        </CardContent>
      </Card>

      {programs.length === 0 ? (
        <Card className="page-enter stagger-2">
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-soft">
              <FileText className="h-8 w-8 text-navy/60" />
            </div>
            <p className="mt-5 font-display text-lg text-navy-dark">No hay programas guardados aún</p>
            <p className="mt-1 text-sm text-stone-500">Crea el primero con el formulario de arriba.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="page-enter stagger-2 space-y-4">
          <h3 className="font-display text-lg font-semibold text-navy-dark">
            Programas guardados
            <span className="ml-2 text-sm font-normal text-stone-500">({programs.length})</span>
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="app-card-hover overflow-hidden border-l-4 border-l-church-gold"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl">{formatWeekRange(program.weekStartDate)}</CardTitle>
                      <CardDescription className="mt-1.5 line-clamp-1">{settings.churchName}</CardDescription>
                    </div>
                    <Badge variant={program.status === 'complete' ? 'gold' : 'secondary'}>
                      {program.status === 'complete' ? 'Completo' : 'Borrador'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {program.monthlyTheme && (
                    <p className="rounded-lg bg-church-gold-soft/60 px-3 py-2 text-sm font-medium text-church-gold">
                      {program.monthlyTheme}
                    </p>
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
        </div>
      )}
    </div>
  )
}
