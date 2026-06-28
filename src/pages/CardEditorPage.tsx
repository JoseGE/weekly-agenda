import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, ImageDown } from 'lucide-react'
import { CardFieldAlign } from '@/components/cards/CardFieldAlign'
import { ChurchCardShareImage } from '@/components/share/ChurchCardShareImage'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CENTRAL_CARD_TAGLINE, getCardFieldAlign, getCardTemplateDefinition } from '@/lib/card-utils'
import { downloadCardImage } from '@/lib/download-card-image'
import { downloadCardPdf } from '@/lib/download-card-pdf'
import type { CardTextAlign, ChurchCard, ChurchCardAlign } from '@/types'

export function CardEditorPage() {
  const { id } = useParams<{ id: string }>()
  const { getCard, updateCard, settings } = useApp()
  const card = id ? getCard(id) : undefined
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)

  const templateDef = useMemo(
    () => (card ? getCardTemplateDefinition(card.template) : null),
    [card],
  )

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
            <Textarea
              id="card-body"
              value={card.body}
              onChange={(e) => save({ body: e.target.value })}
              rows={6}
              placeholder={templateDef.defaultBody}
            />
          </div>

          {showEventFields ? (
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
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="card-closing">Cierre</Label>
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
            <p className="text-sm font-medium text-stone-600">Vista previa</p>
            <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-stone-100 shadow-[var(--shadow-card)]">
              <div className="relative mx-auto h-[459px] w-full max-w-[368px] overflow-hidden">
                <div className="absolute left-0 top-0 origin-top-left scale-[0.34]">
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
