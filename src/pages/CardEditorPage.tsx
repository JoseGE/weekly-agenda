import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, ImageDown } from 'lucide-react'
import { CardFieldAlign } from '@/components/cards/CardFieldAlign'
import { CardBodyFormatToolbar } from '@/components/cards/CardBodyFormatToolbar'
import { CardFontScaleControl } from '@/components/cards/CardFontScaleControl'
import { ChurchCardShareImage } from '@/components/share/ChurchCardShareImage'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { indentTextareaBulletLines } from '@/lib/card-body-format'
import {
  CENTRAL_CARD_TAGLINE,
  getCardFieldAlign,
  getCardFontScale,
  getCardTemplateDefinition,
  getDefaultCardDocumentDate,
} from '@/lib/card-utils'
import { downloadCardImage } from '@/lib/download-card-image'
import { downloadCardPdf } from '@/lib/download-card-pdf'
import type { CardTextAlign, ChurchCard, ChurchCardAlign } from '@/types'

const PREVIEW_SCALE = 0.34

function useAutoResizeTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, 192)}px`
  }, [])

  useEffect(() => {
    resize()
  }, [value, resize])

  return { ref, resize }
}

function usePreviewHeight(scale: number) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [scaledHeight, setScaledHeight] = useState(459)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const update = () => {
      setScaledHeight(Math.ceil(el.offsetHeight * scale))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [scale])

  return { contentRef, scaledHeight }
}

export function CardEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { getCard, updateCard, settings } = useApp()
  const card = id ? getCard(id) : undefined
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)

  const bodyTextarea = useAutoResizeTextarea(card?.body ?? '')
  const preview = usePreviewHeight(PREVIEW_SCALE)

  const templateDef = useMemo(
    () => (card ? getCardTemplateDefinition(card.template) : null),
    [card],
  )

  const bodyStats = useMemo(() => {
    if (!card) return { lines: 0, chars: 0 }
    const text = card.body
    const lines = text ? text.split('\n').length : 0
    return { lines, chars: text.length }
  }, [card])

  const showEventFields =
    card &&
    (card.template === 'invitacion' ||
      card.template === 'anuncio' ||
      card.template === 'oracion')

  if (!card || !templateDef) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-500">Carta no encontrada.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/cartas">Volver a cartas</Link>
        </Button>
      </div>
    )
  }

  const save = (updates: Partial<ChurchCard>) => {
    updateCard({ ...card, ...updates })
  }

  const saveAlign = (field: keyof ChurchCardAlign, align: CardTextAlign) => {
    save({ align: { ...card.align, [field]: align } })
  }

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true)
    try {
      await downloadCardPdf(card, settings.churchName)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleDownloadImage = async () => {
    setGeneratingImage(true)
    try {
      await downloadCardImage(card, settings.churchName)
    } finally {
      setGeneratingImage(false)
    }
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link to="/cartas">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadImage} disabled={generatingImage}>
            <ImageDown className="h-4 w-4" />
            {generatingImage ? 'Generando...' : 'Imagen'}
          </Button>
          <Button onClick={handleDownloadPdf} disabled={generatingPdf}>
            <Download className="h-4 w-4" />
            {generatingPdf ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="app-panel space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold">{templateDef.name}</Badge>
            <span className="text-xs uppercase tracking-wider text-church-gold">
              {CENTRAL_CARD_TAGLINE}
            </span>
          </div>

          <CardFontScaleControl
            value={getCardFontScale(card)}
            onChange={(fontScale) => save({ fontScale })}
          />

          <div className="space-y-2">
            <Label htmlFor="card-document-date">Fecha de la carta</Label>
            <Input
              id="card-document-date"
              type="date"
              value={card.documentDate ?? getDefaultCardDocumentDate()}
              onChange={(e) => save({ documentDate: e.target.value })}
            />
            <p className="text-xs text-stone-400">
              Aparece como &quot;Santo Domingo Norte, [fecha]&quot; arriba del destinatario
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="card-recipient">Destinatario (opcional)</Label>
              <CardFieldAlign
                value={getCardFieldAlign(card, 'recipient')}
                onChange={(align) => saveAlign('recipient', align)}
              />
            </div>
            <Input
              id="card-recipient"
              value={card.recipient ?? ''}
              onChange={(e) => save({ recipient: e.target.value })}
              placeholder="Ej: Familia Pérez, Hermanos y hermanas"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="card-title">Título</Label>
              <CardFieldAlign
                value={getCardFieldAlign(card, 'title')}
                onChange={(align) => saveAlign('title', align)}
              />
            </div>
            <Input
              id="card-title"
              value={card.title}
              onChange={(e) => save({ title: e.target.value })}
              placeholder={templateDef.defaultTitle}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="card-subtitle">Subtítulo (opcional)</Label>
              <CardFieldAlign
                value={getCardFieldAlign(card, 'subtitle')}
                onChange={(align) => saveAlign('subtitle', align)}
              />
            </div>
            <Input
              id="card-subtitle"
              value={card.subtitle ?? ''}
              onChange={(e) => save({ subtitle: e.target.value })}
              placeholder="Ej: Culto especial de aniversario"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="card-body">Mensaje</Label>
              <CardFieldAlign
                value={getCardFieldAlign(card, 'body')}
                onChange={(align) => saveAlign('body', align)}
              />
            </div>
            <CardBodyFormatToolbar
              textareaRef={bodyTextarea.ref}
              onChange={(value) => save({ body: value })}
            />
            <Textarea
              ref={bodyTextarea.ref}
              id="card-body"
              value={card.body}
              onChange={(e) => save({ body: e.target.value })}
              onInput={bodyTextarea.resize}
              onKeyDown={(e) => {
                if (e.key !== 'Tab') return
                e.preventDefault()
                const textarea = e.currentTarget
                const { value, selectionStart, selectionEnd } = indentTextareaBulletLines(
                  textarea,
                  e.shiftKey ? -1 : 1,
                )
                save({ body: value })
                requestAnimationFrame(() => {
                  textarea.focus()
                  textarea.setSelectionRange(selectionStart, selectionEnd)
                })
              }}
              className="min-h-48 resize-y leading-relaxed"
              placeholder={templateDef.defaultBody}
            />
            <p className="text-xs text-stone-400">
              {bodyStats.lines} {bodyStats.lines === 1 ? 'línea' : 'líneas'} · {bodyStats.chars}{' '}
              {bodyStats.chars === 1 ? 'carácter' : 'caracteres'}
            </p>
          </div>

          {showEventFields ? (
            <div className="space-y-4 rounded-lg border border-stone-200/80 bg-stone-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="card-show-event-block">Bloque de fecha y lugar</Label>
                  <p className="text-xs text-stone-500">
                    Muestra la caja con fecha, hora y lugar en la carta
                  </p>
                </div>
                <Switch
                  id="card-show-event-block"
                  checked={card.showEventBlock !== false}
                  onCheckedChange={(checked) => save({ showEventBlock: checked })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="card-date">Fecha del evento</Label>
                <Input
                  id="card-date"
                  type="date"
                  value={card.eventDate ?? ''}
                  onChange={(e) => save({ eventDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-time">Hora</Label>
                <Input
                  id="card-time"
                  type="time"
                  value={card.eventTime ?? ''}
                  onChange={(e) => save({ eventTime: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-location">Lugar</Label>
                <Input
                  id="card-location"
                  value={card.location ?? ''}
                  onChange={(e) => save({ location: e.target.value })}
                  placeholder="Ej: Templo principal"
                />
              </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="card-closing">Cierre</Label>
              <CardFieldAlign
                value={getCardFieldAlign(card, 'closing')}
                onChange={(align) => saveAlign('closing', align)}
              />
            </div>
            <Input
              id="card-closing"
              value={card.closing ?? ''}
              onChange={(e) => save({ closing: e.target.value })}
              placeholder={templateDef.defaultClosing}
            />
          </div>
        </div>

        <aside className="min-w-0">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-stone-600">Vista previa</p>
              <span className="text-xs text-stone-400">
                {Math.round(getCardFontScale(card) * 100)}%
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-stone-100 shadow-[var(--shadow-card)]">
              <div
                className="relative mx-auto w-full max-w-[368px] overflow-y-auto max-h-[70vh]"
                style={{ height: preview.scaledHeight }}
              >
                <div
                  ref={preview.contentRef}
                  className="absolute left-0 top-0 origin-top-left"
                  style={{ transform: `scale(${PREVIEW_SCALE})` }}
                >
                  <ChurchCardShareImage card={card} churchName={settings.churchName} />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
