import type { ChurchCard } from '@/types'
import {
  CENTRAL_CARD_TAGLINE,
  cardAlignClassName,
  formatCardEventDate,
  formatCardEventTime,
  getCardFieldAlign,
  getCardTemplateDefinition,
} from '@/lib/card-utils'
import { cn } from '@/lib/utils'

interface ChurchCardShareImageProps {
  card: ChurchCard
  churchName: string
}

function OrnamentDivider() {
  return (
    <div className="flex w-full items-center justify-center gap-3">
      <span className="h-px max-w-20 flex-1 bg-[#d4a574]" />
      <span className="inline-block h-2 w-2 rotate-45 bg-[#c47a2c]" />
      <span className="h-px max-w-20 flex-1 bg-[#d4a574]" />
    </div>
  )
}

export function ChurchCardShareImage({ card, churchName }: ChurchCardShareImageProps) {
  const templateDef = getCardTemplateDefinition(card.template)
  const title = card.title.trim() || templateDef.name
  const showEvent =
    card.template === 'invitacion' ||
    card.template === 'anuncio' ||
    card.template === 'oracion'

  const recipientAlign = getCardFieldAlign(card, 'recipient')
  const titleAlign = getCardFieldAlign(card, 'title')
  const subtitleAlign = getCardFieldAlign(card, 'subtitle')
  const bodyAlign = getCardFieldAlign(card, 'body')

  return (
    <div
      data-church-card-share
      className="box-border bg-[#faf6ef] text-stone-900"
      style={{
        width: 1080,
        minHeight: 1350,
        padding: 48,
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <div className="flex min-h-[1254px] flex-col border-2 border-[#c47a2c] p-1">
        <div className="flex flex-1 flex-col items-center border border-[#e8dcc8] px-10 py-12 text-center">
          <OrnamentDivider />

          <p className="mt-4 text-xl font-bold tracking-wide text-[#0f2d4a]">{churchName}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#c47a2c]">
            {CENTRAL_CARD_TAGLINE}
          </p>

          <span className="mt-6 inline-block rounded-full bg-[#e8f0f7] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#1a4d7c]">
            {templateDef.name}
          </span>

          {card.recipient?.trim() ? (
            <p
              className={cn(
                'mt-5 w-full max-w-2xl text-lg italic text-stone-600',
                cardAlignClassName(recipientAlign),
              )}
            >
              Para: {card.recipient.trim()}
            </p>
          ) : null}

          <h1
            className={cn(
              'mt-4 w-full max-w-2xl text-4xl font-bold leading-tight text-[#0f2d4a]',
              cardAlignClassName(titleAlign),
            )}
          >
            {title}
          </h1>
          {card.subtitle?.trim() ? (
            <p
              className={cn(
                'mt-2 w-full max-w-2xl text-xl text-[#1a4d7c]',
                cardAlignClassName(subtitleAlign),
              )}
            >
              {card.subtitle.trim()}
            </p>
          ) : null}

          <div className="my-6 h-0.5 w-12 rounded-full bg-[#c47a2c]" />

          {card.body.trim() ? (
            <div
              className={cn(
                'w-full max-w-2xl',
                bodyAlign === 'left' && 'self-stretch',
                cardAlignClassName(bodyAlign),
              )}
            >
              <p className="whitespace-pre-line text-2xl leading-relaxed text-stone-800">
                {card.body.trim()}
              </p>
            </div>
          ) : null}

          {showEvent && (card.eventDate || card.eventTime || card.location) ? (
            <div className="mt-8 w-full max-w-xl rounded-xl border border-[#e8dcc8] bg-white px-6 py-5 text-center shadow-sm">
              {card.eventDate ? (
                <p className="text-2xl font-bold capitalize text-[#0f2d4a]">
                  {formatCardEventDate(card.eventDate)}
                </p>
              ) : null}
              {card.eventTime ? (
                <p className="mt-1 text-xl font-semibold text-[#1a4d7c]">
                  {formatCardEventTime(card.eventTime)}
                </p>
              ) : null}
              {card.location?.trim() ? (
                <p className="mt-2 text-lg text-stone-600">{card.location.trim()}</p>
              ) : null}
            </div>
          ) : null}

          {card.closing?.trim() ? (
            <p className="mt-8 text-2xl font-bold text-[#c47a2c]">{card.closing.trim()}</p>
          ) : null}

          <div className="mt-auto w-full pt-10">
            <OrnamentDivider />
            <p className="mt-4 text-xl font-bold text-[#0f2d4a]">
              Iglesia Evangélica Pentecostal Central
            </p>
            <p className="mt-1 text-base text-stone-500">{churchName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
