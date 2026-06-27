import { useEffect, useMemo, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Download, Loader2, Minus, Plus, X } from 'lucide-react'
import { ProgramPdfDocument } from '@/components/pdf/ProgramPdfDocument'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { downloadProgramPdf } from '@/lib/download-program-pdf'
import {
  clampPdfFontScale,
  formatPdfFontScaleLabel,
  PDF_FONT_SCALE_MAX,
  PDF_FONT_SCALE_MIN,
  setPdfFontScale,
} from '@/lib/pdf-font-scale'
import type { Member, WeeklyProgram } from '@/types'

interface ProgramPdfPreviewProps {
  program: WeeklyProgram
  churchName: string
  members: Member[]
  fontScale: number
  onFontScaleChange: (scale: number) => void
  onClose: () => void
}

export function ProgramPdfPreview({
  program,
  churchName,
  members,
  fontScale,
  onFontScaleChange,
  onClose,
}: ProgramPdfPreviewProps) {
  const [renderScale, setRenderScale] = useState(fontScale)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const timer = window.setTimeout(() => setRenderScale(fontScale), 200)
    return () => window.clearTimeout(timer)
  }, [fontScale])

  const documentNode = useMemo(
    () => (
      <ProgramPdfDocument
        program={program}
        churchName={churchName}
        members={members}
        fontScale={renderScale}
      />
    ),
    [program, churchName, members, renderScale],
  )

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    setLoading(true)
    setError(null)

    pdf(documentNode)
      .toBlob()
      .then((blob) => {
        if (cancelled) {
          URL.revokeObjectURL(URL.createObjectURL(blob))
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setPdfUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous)
          return objectUrl
        })
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('No se pudo generar la vista previa.')
        setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [documentNode])

  useEffect(
    () => () => {
      setPdfUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return null
      })
    },
    [],
  )

  const adjustScale = (delta: number) => {
    const next = clampPdfFontScale(Math.round((fontScale + delta) * 100) / 100)
    onFontScaleChange(next)
    setPdfFontScale(next)
  }

  const handleDownload = async () => {
    setPdfFontScale(fontScale)
    await downloadProgramPdf(program, churchName, members, fontScale)
  }

  const isUpdating = loading || renderScale !== fontScale

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/30 backdrop-blur-[2px]">
      <header className="shrink-0 border-b border-stone-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <div className="app-accent-bar mb-2" />
            <h2 className="font-display text-xl font-semibold text-navy-dark sm:text-2xl">
              Vista previa del PDF
            </h2>
            <p className="mt-0.5 text-sm text-stone-500">
              Ajusta el tamaño de fuente y descarga cuando esté listo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-paper px-3 py-2 shadow-sm">
              <Label htmlFor="pdf-font-scale" className="shrink-0 text-sm font-medium text-stone-600">
                Fuente
              </Label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustScale(-0.05)}
                disabled={fontScale <= PDF_FONT_SCALE_MIN}
                aria-label="Reducir tamaño de fuente"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                id="pdf-font-scale"
                type="range"
                min={PDF_FONT_SCALE_MIN}
                max={PDF_FONT_SCALE_MAX}
                step={0.05}
                value={fontScale}
                onChange={(event) => {
                  const next = clampPdfFontScale(Number(event.target.value))
                  onFontScaleChange(next)
                  setPdfFontScale(next)
                }}
                className="w-24 accent-church-gold sm:w-32"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustScale(0.05)}
                disabled={fontScale >= PDF_FONT_SCALE_MAX}
                aria-label="Aumentar tamaño de fuente"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="min-w-12 text-center text-sm font-semibold tabular-nums text-navy-dark">
                {formatPdfFontScaleLabel(fontScale)}
              </span>
            </div>

            <Button type="button" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Descargar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar vista previa"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-gradient-to-b from-cream/90 via-paper to-cream-dark/80 p-3 sm:p-6">
        <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-stone-200/70 bg-white shadow-[var(--shadow-card-hover)]">
          {error ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-stone-500">
              {error}
            </div>
          ) : isUpdating || !pdfUrl ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="h-8 w-8 animate-spin text-church-gold" />
              <p className="text-sm">Generando vista previa…</p>
            </div>
          ) : (
            <iframe
              title="Vista previa del programa PDF"
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="h-full w-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  )
}
