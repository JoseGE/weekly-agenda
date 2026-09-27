import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Copy, Download, Heart, ImageDown, MailPlus, Sparkles, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFormalCardTemplates, getFriendCardTemplates } from '@/lib/card-layout'
import { createParadaNinoCristianoSample, getCardSummary } from '@/lib/card-utils'
import { downloadCardImage } from '@/lib/download-card-image'
import { downloadCardPdf } from '@/lib/download-card-pdf'
import { CHURCH_CARD_TEMPLATES } from '@/types'

export function CardsHomePage() {
  const navigate = useNavigate()
  const { cards, createCard, duplicateCard, deleteCard, settings } = useApp()
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null)
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null)

  const formalTemplates = getFormalCardTemplates()
  const friendTemplates = getFriendCardTemplates()

  const handleCreate = (template: (typeof CHURCH_CARD_TEMPLATES)[number]['id']) => {
    const card = createCard(template)
    navigate(`/cartas/${card.id}`)
  }

  const handleCreateParadaSample = () => {
    const sample = createParadaNinoCristianoSample()
    const card = createCard('anuncio', sample)
    navigate(`/cartas/${card.id}`)
  }

  const handleDuplicate = (cardId: string) => {
    const copy = duplicateCard(cardId)
    if (copy) navigate(`/cartas/${copy.id}`)
  }

  const handleDownloadPdf = async (cardId: string) => {
    const card = cards.find((item) => item.id === cardId)
    if (!card) return
    setGeneratingPdfId(cardId)
    try {
      await downloadCardPdf(card, settings.churchName)
    } finally {
      setGeneratingPdfId(null)
    }
  }

  const handleDownloadImage = async (cardId: string) => {
    const card = cards.find((item) => item.id === cardId)
    if (!card) return
    setGeneratingImageId(cardId)
    try {
      await downloadCardImage(card, settings.churchName)
    } finally {
      setGeneratingImageId(null)
    }
  }

  const renderSavedCards = (filter: 'formal' | 'friends' | 'all') => {
    const filtered = cards.filter((card) => {
      const template = CHURCH_CARD_TEMPLATES.find((item) => item.id === card.template)
      if (filter === 'all') return true
      if (filter === 'friends') return template?.category === 'friends'
      return template?.category !== 'friends'
    })

    if (filtered.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-stone-300/80 bg-white/50 py-10 text-center text-sm text-stone-500">
          {filter === 'friends'
            ? 'Aún no hay cartas para amigos.'
            : 'Aún no hay cartas formales.'}
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {filtered.map((card) => {
          const template = CHURCH_CARD_TEMPLATES.find((item) => item.id === card.template)
          return (
            <Card key={card.id} className="app-card-hover overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="gold">{template?.name ?? card.template}</Badge>
                    <span className="text-xs text-stone-500">
                      {format(new Date(card.updatedAt), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="font-display text-lg font-semibold text-navy-dark">
                    {getCardSummary(card)}
                  </p>
                  {card.body.trim() ? (
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">{card.body.trim()}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/cartas/${card.id}`}>Editar</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(card.id)}>
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPdf(card.id)}
                    disabled={generatingPdfId === card.id}
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadImage(card.id)}
                    disabled={generatingImageId === card.id}
                  >
                    <ImageDown className="h-4 w-4" />
                    Imagen
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('¿Eliminar esta carta?')) deleteCard(card.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Cartas Central"
        description="Cartas formales para la iglesia y cartas personales para amigos, con la identidad visual de Central."
      />

      <Card className="page-enter stagger-1 overflow-hidden border-church-gold/30 bg-gradient-to-br from-[#faf6ef] via-white to-navy-soft/25">
        <div className="h-1 bg-gradient-to-r from-navy-dark via-church-gold to-church-gold-light" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-church-gold" />
            Cartas para amigos
          </CardTitle>
          <CardDescription>
            Invitaciones cálidas y personales con cita bíblica, detalles del evento y firma especial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {friendTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleCreate(template.id)}
                className="group rounded-xl border border-[#d4a574]/50 bg-gradient-to-br from-[#faf6ef] to-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-church-gold/50 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-church-gold" />
                  <span className="font-semibold text-navy-dark">{template.name}</span>
                </div>
                <p className="text-sm text-stone-500">{template.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="page-enter stagger-2 overflow-hidden border-church-gold/30 bg-gradient-to-br from-[#faf6ef] via-white to-navy-soft/25">
        <div className="h-1 bg-gradient-to-r from-navy-dark via-church-gold to-church-gold-light" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-church-gold" />
            Cartas formales
          </CardTitle>
          <CardDescription>
            Invitaciones, anuncios y comunicaciones oficiales con el marco dorado de Central.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {formalTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleCreate(template.id)}
                className="group rounded-xl border border-stone-200/80 bg-white/90 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-church-gold/40 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <MailPlus className="h-4 w-4 text-church-gold" />
                  <span className="font-semibold text-navy-dark">{template.name}</span>
                </div>
                <p className="text-sm text-stone-500">{template.description}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-200/80 pt-4">
            <p className="text-sm text-stone-500">¿Quieres ver cómo queda una carta completa?</p>
            <Button type="button" variant="outline" size="sm" onClick={handleCreateParadaSample}>
              Ejemplo: Parada del Niño Cristiano
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="page-enter stagger-3 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-navy-dark">Cartas para amigos</h3>
          <Badge variant="secondary">{cards.filter((c) => c.template === 'amigos').length}</Badge>
        </div>
        {renderSavedCards('friends')}
      </section>

      <section className="page-enter stagger-3 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-navy-dark">Cartas formales guardadas</h3>
          <Badge variant="secondary">
            {cards.filter((c) => c.template !== 'amigos').length}
          </Badge>
        </div>
        {renderSavedCards('formal')}
      </section>
    </div>
  )
}
