import type { ChurchCard } from '@/types'
import { CardBodyContent } from '@/components/cards/CardBodyContent'
import { getCardFontSizes } from '@/lib/card-font-scale'
import {
  CARD_COUNCIL_ADDRESS,
  CARD_COUNCIL_NAME,
  cardBlockClassName,
  formatCardDocumentLine,
  formatCardEventDate,
  formatCardEventTime,
  getCardFieldAlign,
  getCardFontScale,
  getCardTemplateDefinition,
  getDefaultCardDocumentDate,
  shouldShowCardEventBlock,
} from '@/lib/card-utils'
import { cn } from '@/lib/utils'

interface ChurchCardShareImageProps {
  card: ChurchCard
  churchName: string
}

function OrnamentDivider() {
  return (
    <div className="flex w-full items-center justify-center gap-3 self-center">
      <span className="h-px max-w-20 flex-1 bg-[#d4a574]" />
      <span className="inline-block h-2 w-2 rotate-45 bg-[#c47a2c]" />
      <span className="h-px max-w-20 flex-1 bg-[#d4a574]" />
    </div>
  )
}

export function ChurchCardShareImage({ card, churchName }: ChurchCardShareImageProps) {
  const templateDef = getCardTemplateDefinition(card.template)
  const title = card.title.trim() || templateDef.name
  const showEventBlock = shouldShowCardEventBlock(card)

  const fontScale = getCardFontScale(card)
  const sizes = getCardFontSizes(card.body, fontScale)
  const documentDate = card.documentDate || getDefaultCardDocumentDate()

  const recipientAlign = getCardFieldAlign(card, 'recipient')
  const titleAlign = getCardFieldAlign(card, 'title')
  const subtitleAlign = getCardFieldAlign(card, 'subtitle')
  const bodyAlign = getCardFieldAlign(card, 'body')
  const closingAlign = getCardFieldAlign(card, 'closing')

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
        <div className="flex flex-1 flex-col items-stretch border border-[#e8dcc8] px-10 py-12">
          <OrnamentDivider />

          <p
            className="mt-4 self-center text-center font-bold tracking-wide text-[#0f2d4a]"
            style={{ fontSize: sizes.councilName }}
          >
            {CARD_COUNCIL_NAME}
          </p>
          <p
            className="mt-2 self-center max-w-2xl text-center leading-snug text-stone-600"
            style={{ fontSize: sizes.councilAddress }}
          >
            {CARD_COUNCIL_ADDRESS}
          </p>

          <span
            className="mt-6 self-center rounded-full bg-[#e8f0f7] px-4 py-1 text-center font-bold uppercase tracking-wider text-[#1a4d7c]"
            style={{ fontSize: sizes.badge }}
          >
            {templateDef.name}
          </span>

          <p
            className="mt-6 w-full text-right text-stone-800"
            style={{ fontSize: sizes.documentDate }}
          >
            {formatCardDocumentLine(documentDate)}
          </p>

          {card.recipient?.trim() ? (
            <p
              className={cn(
                'mt-4 break-words italic text-stone-600',
                cardBlockClassName(recipientAlign),
              )}
              style={{ fontSize: sizes.recipient }}
            >
              Para: {card.recipient.trim()}
            </p>
          ) : null}

          <h1
            className={cn(
              'mt-4 break-words font-bold leading-tight text-[#0f2d4a]',
              cardBlockClassName(titleAlign),
            )}
            style={{ fontSize: sizes.title }}
          >
            {title}
          </h1>
          {card.subtitle?.trim() ? (
            <p
              className={cn('mt-2 break-words text-[#1a4d7c]', cardBlockClassName(subtitleAlign))}
              style={{ fontSize: sizes.subtitle }}
            >
              {card.subtitle.trim()}
            </p>
          ) : null}

          <div className="my-6 h-0.5 w-12 self-center rounded-full bg-[#c47a2c]" />

          {card.body.trim() ? (
            <div className={cn('break-words', cardBlockClassName(bodyAlign))}>
              <CardBodyContent
                body={card.body}
                fontSize={sizes.body}
                lineHeight={sizes.bodyLineHeight}
                className="text-stone-800"
              />
            </div>
          ) : null}

          {showEventBlock ? (
            <div className="mt-8 w-full max-w-xl self-center rounded-xl border border-[#e8dcc8] bg-white px-6 py-5 text-center shadow-sm">
              {card.eventDate ? (
                <p
                  className="font-bold capitalize text-[#0f2d4a]"
                  style={{ fontSize: sizes.eventDate }}
                >
                  {formatCardEventDate(card.eventDate)}
                </p>
              ) : null}
              {card.eventTime ? (
                <p
                  className="mt-1 font-semibold text-[#1a4d7c]"
                  style={{ fontSize: sizes.eventTime }}
                >
                  {formatCardEventTime(card.eventTime)}
                </p>
              ) : null}
              {card.location?.trim() ? (
                <p
                  className="mt-2 break-words text-stone-600"
                  style={{ fontSize: sizes.eventLocation }}
                >
                  {card.location.trim()}
                </p>
              ) : null}
            </div>
          ) : null}

          {card.closing?.trim() ? (
            <p
              className={cn(
                'mt-8 break-words font-bold text-[#c47a2c]',
                cardBlockClassName(closingAlign),
              )}
              style={{ fontSize: sizes.closing }}
            >
              {card.closing.trim()}
            </p>
          ) : null}

          <div className="mt-auto w-full self-stretch pt-10">
            <OrnamentDivider />
            <p
              className="mt-4 text-center font-bold text-[#0f2d4a]"
              style={{ fontSize: sizes.footerTitle }}
            >
              {churchName}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
