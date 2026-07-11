import { lazy, Suspense, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Download, ExternalLink, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { ProgramShareView } from '@/components/share/ProgramShareView'
import { Button } from '@/components/ui/button'
import { downloadProgramPdf, createProgramPdfUrl } from '@/lib/download-program-pdf'
import { parsePreviewFontScale } from '@/lib/program-preview-url'
import { formatWeekRange } from '@/lib/program-utils'
import { setPdfFontScale } from '@/lib/pdf-font-scale'

const ProgramPdfPreview = lazy(() =>
  import('@/components/pdf/ProgramPdfPreview').then((module) => ({
    default: module.ProgramPdfPreview,
  })),
)

const MOBILE_FOOTER_SPACE = 'calc(9.5rem + env(safe-area-inset-bottom, 0px))'

export function ProgramPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { getProgram, members, settings, loading } = useApp()
  const [fontScale, setFontScale] = useState(() => parsePreviewFontScale(searchParams))
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [openingPdf, setOpeningPdf] = useState(false)

  const program = id ? getProgram(id) : undefined

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-church-gold" />
          <p className="text-sm text-stone-600">Cargando programa...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
        <p className="text-stone-500">Programa no encontrado.</p>
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  const handleFontScaleChange = (scale: number) => {
    setFontScale(scale)
    setPdfFontScale(scale)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      setPdfFontScale(fontScale)
      await downloadProgramPdf(program, settings.churchName, members, fontScale)
    } finally {
      setDownloading(false)
    }
  }

  const handleOpenPdf = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
      return
    }

    setOpeningPdf(true)
    try {
      setPdfFontScale(fontScale)
      const url = await createProgramPdfUrl(program, settings.churchName, members, fontScale)
      setPdfUrl(url)
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setOpeningPdf(false)
    }
  }

  const footer = (
    <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200/80 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:shrink-0 sm:shadow-none">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:hidden"
          onClick={handleOpenPdf}
          disabled={openingPdf || downloading}
        >
          <ExternalLink className="h-4 w-4" />
          {openingPdf ? 'Abriendo...' : 'Abrir PDF'}
        </Button>
        <Button
          type="button"
          className="w-full"
          onClick={handleDownload}
          disabled={downloading || openingPdf}
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Preparando...' : 'Descargar PDF'}
        </Button>
      </div>
    </footer>
  )

  return (
    <div className="bg-stone-100 sm:flex sm:min-h-dvh sm:flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-church-gold">
            {settings.churchName}
          </p>
          <h1 className="font-display text-base font-semibold text-navy-dark sm:text-lg">
            {formatWeekRange(program.weekStartDate)}
          </h1>
        </div>
      </header>

      {/* Mobile: scroll natural del documento */}
      <div className="sm:hidden" style={{ paddingBottom: MOBILE_FOOTER_SPACE }}>
        <ProgramShareView
          program={program}
          churchName={settings.churchName}
          members={members}
          fontScale={fontScale}
        />
      </div>

      {/* Desktop: PDF en panel con scroll interno */}
      <main className="hidden min-h-0 flex-1 sm:flex sm:flex-col">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-stone-500">
              <Loader2 className="h-8 w-8 animate-spin text-church-gold" />
            </div>
          }
        >
          <ProgramPdfPreview
            variant="page"
            program={program}
            churchName={settings.churchName}
            members={members}
            fontScale={fontScale}
            onFontScaleChange={handleFontScaleChange}
            onPdfUrlChange={setPdfUrl}
          />
        </Suspense>
      </main>

      {footer}
    </div>
  )
}
