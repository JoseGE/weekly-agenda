import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Download, ImageDown } from 'lucide-react'
import { CardFontScaleControl } from '@/components/cards/CardFontScaleControl'
import { CardSectionStyleControls } from '@/components/cards/CardSectionStyleControls'
import { CardSignaturesEditor } from '@/components/cards/CardSignaturesEditor'
import { FriendCardEditorFields } from '@/components/cards/FriendCardEditorFields'
import { ChurchCardShareImage } from '@/components/share/ChurchCardShareImage'
import { useApp } from '@/context/AppContext'
import { isFriendCard } from '@/lib/card-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CARD_SEAL_SRC } from '@/lib/card-seal'
import { getCardRichTextDocument } from '@/lib/card-rich-text'
import { getCardSectionTextStyle } from '@/lib/card-text-styles'
import {
  CENTRAL_CARD_TAGLINE,
  getCardFieldAlign,
  getCardFontScale,
  getCardSignatures,
  getCardTemplateDefinition,
  getDefaultCardDocumentDate,
} from '@/lib/card-utils'
import { downloadCardImage } from '@/lib/download-card-image'
import { downloadCardPdf } from '@/lib/download-card-pdf'
import type {
  CardTextAlign,
  CardTextStyle,
  CardTextStyleSection,
  ChurchCard,
  ChurchCardAlign,
} from '@/types'

const PREVIEW_SCALE = 0.34

const CardRichTextEditor = lazy(() =>
  import('@/components/cards/CardRichTextEditor').then((module) => ({
    default: module.CardRichTextEditor,
  })),
)

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
  const navigate = useNavigate()
  const { getCard, updateCard, duplicateCard, settings, members, data } = useApp()
  const card = id ? getCard(id) : undefined
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)

  const { contentRef: previewContentRef, scaledHeight: previewScaledHeight } =
    usePreviewHeight(PREVIEW_SCALE)

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
    !isFriendCard(card) &&
    (card.template === 'invitacion' ||
      card.template === 'anuncio' ||
      card.template === 'oracion')

  const isFriend = card ? isFriendCard(card) : false

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

  const saveTextStyle = (section: CardTextStyleSection, style?: CardTextStyle) => {
    const textStyles = { ...card.textStyles }
    if (style) textStyles[section] = style
    else delete textStyles[section]
    save({ textStyles })
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
          <Button
            variant="outline"
            onClick={() => {
              const copy = duplicateCard(card.id)
              if (copy) navigate(`/cartas/${copy.id}`)
            }}
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
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
            {!isFriend ? (
              <div className="ml-auto flex items-center gap-2">
                <Label htmlFor="card-show-template-badge" className="text-xs font-normal text-stone-500">
                  Mostrar etiqueta
                </Label>
                <Switch
                  id="card-show-template-badge"
                  checked={card.showTemplateBadge !== false}
                  onCheckedChange={(checked) => save({ showTemplateBadge: checked })}
                />
              </div>
            ) : null}
          </div>

          <CardFontScaleControl
            value={getCardFontScale(card)}
            onChange={(fontScale) => save({ fontScale })}
          />

          {isFriend ? (
            <FriendCardEditorFields card={card} onSave={save} />
          ) : (
            <>
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
            <Label htmlFor="card-recipient">Destinatario (opcional)</Label>
            <div className="grid gap-2 sm:grid-cols-[minmax(120px,0.4fr)_minmax(0,1fr)]">
              <Input
                id="card-recipient-label"
                value={card.recipientLabel ?? 'Para:'}
                onChange={(e) => save({ recipientLabel: e.target.value })}
                placeholder="Distinguido Pastor:"
                aria-label="Etiqueta del destinatario"
              />
              <Input
                id="card-recipient"
                value={card.recipient ?? ''}
                onChange={(e) => save({ recipient: e.target.value })}
                placeholder="Ezequiel Molina Rosario"
              />
            </div>
            <p className="text-xs text-stone-400">
              La etiqueta incluye su puntuación. Déjala vacía para mostrar solo el nombre.
            </p>
            <CardSectionStyleControls
              label="Destinatario"
              style={card.textStyles?.recipient}
              resolved={getCardSectionTextStyle(card, 'recipient')}
              align={getCardFieldAlign(card, 'recipient')}
              onStyleChange={(style) => saveTextStyle('recipient', style)}
              onAlignChange={(align) => saveAlign('recipient', align)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="card-title">Título</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="card-show-title" className="text-xs font-normal text-stone-500">
                  Mostrar título
                </Label>
                <Switch
                  id="card-show-title"
                  checked={card.showTitle !== false}
                  onCheckedChange={(checked) => save({ showTitle: checked })}
                />
              </div>
            </div>
            <Input
              id="card-title"
              value={card.title}
              onChange={(e) => save({ title: e.target.value })}
              placeholder={templateDef.defaultTitle}
            />
            <CardSectionStyleControls
              label="Título"
              style={card.textStyles?.title}
              resolved={getCardSectionTextStyle(card, 'title')}
              align={getCardFieldAlign(card, 'title')}
              onStyleChange={(style) => saveTextStyle('title', style)}
              onAlignChange={(align) => saveAlign('title', align)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-subtitle">Subtítulo (opcional)</Label>
            <Input
              id="card-subtitle"
              value={card.subtitle ?? ''}
              onChange={(e) => save({ subtitle: e.target.value })}
              placeholder="Ej: Culto especial de aniversario"
            />
            <CardSectionStyleControls
              label="Subtítulo"
              style={card.textStyles?.subtitle}
              resolved={getCardSectionTextStyle(card, 'subtitle')}
              align={getCardFieldAlign(card, 'subtitle')}
              onStyleChange={(style) => saveTextStyle('subtitle', style)}
              onAlignChange={(align) => saveAlign('subtitle', align)}
            />
          </div>

          <div className="space-y-2">
            <Label>Mensaje</Label>
            <Suspense fallback={<div className="h-64 animate-pulse rounded-xl border border-stone-200 bg-stone-50" />}>
              <CardRichTextEditor
                key={card.id}
                value={getCardRichTextDocument(card)}
                onChange={(bodyRich, body) => save({ bodyRich, body })}
              />
            </Suspense>
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
            <Label htmlFor="card-closing">Cierre</Label>
            <Input
              id="card-closing"
              value={card.closing ?? ''}
              onChange={(e) => save({ closing: e.target.value })}
              placeholder={templateDef.defaultClosing}
            />
            <CardSectionStyleControls
              label="Cierre"
              style={card.textStyles?.closing}
              resolved={getCardSectionTextStyle(card, 'closing')}
              align={getCardFieldAlign(card, 'closing')}
              onStyleChange={(style) => saveTextStyle('closing', style)}
              onAlignChange={(align) => saveAlign('closing', align)}
            />
          </div>

          <CardSignaturesEditor
            signatures={getCardSignatures(card)}
            members={members}
            positions={data.positions}
            onChange={(signatures) => save({ signatures })}
          />

          <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200/80 bg-stone-50/60 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={CARD_SEAL_SRC}
                alt=""
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div className="space-y-0.5">
                <Label htmlFor="card-show-seal">Sello del concilio</Label>
                <p className="text-xs text-stone-500">
                  Lo coloca abajo a la derecha, después de las firmas
                </p>
              </div>
            </div>
            <Switch
              id="card-show-seal"
              checked={card.showSeal === true}
              onCheckedChange={(checked) => save({ showSeal: checked })}
            />
          </div>
            </>
          )}
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
                style={{ height: previewScaledHeight }}
              >
                <div
                  ref={previewContentRef}
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
