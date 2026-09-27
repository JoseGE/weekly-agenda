import type { ChurchCard } from '@/types'
import { CardRichTextContent } from '@/components/cards/CardRichTextContent'
import { CardSignaturesDisplay } from '@/components/cards/CardSignaturesDisplay'
import { FriendCardShareImage } from '@/components/share/FriendCardShareImage'
import { getCardFontSizes } from '@/lib/card-font-scale'
import { isFriendCard } from '@/lib/card-layout'
import { CARD_SEAL_SRC } from '@/lib/card-seal'
import {
  CARD_COUNCIL_ADDRESS,
  CARD_COUNCIL_PHONES,
  cardBlockClassName,
  formatCardDocumentLine,
  formatCardEventDate,
  formatCardEventTime,
  getCardFieldAlign,
  getCardFontScale,
  getCardTemplateDefinition,
  getDefaultCardDocumentDate,
  shouldShowCardEventBlock,
  shouldShowCardSeal,
  shouldShowCardTemplateBadge,
} from '@/lib/card-utils'
import {
  cardRichTextToPlainText,
  formatCardRecipientLine,
  getCardRichTextDocument,
  shouldShowCardTitle,
} from '@/lib/card-rich-text'
import { getCardFontCss, getCardSectionTextStyle } from '@/lib/card-text-styles'
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
  if (isFriendCard(card)) {
    return <FriendCardShareImage card={card} churchName={churchName} />
  }

  const templateDef = getCardTemplateDefinition(card.template)
  const title = card.title.trim() || templateDef.name
  const titleVisible = shouldShowCardTitle(card)
  const showEventBlock = shouldShowCardEventBlock(card)
  const bodyDocument = getCardRichTextDocument(card)
  const bodyPlainText = cardRichTextToPlainText(bodyDocument)

  const fontScale = getCardFontScale(card)
  const sizes = getCardFontSizes(bodyPlainText, fontScale)
  const documentDate = card.documentDate || getDefaultCardDocumentDate()

  const recipientAlign = getCardFieldAlign(card, 'recipient')
  const titleAlign = getCardFieldAlign(card, 'title')
  const subtitleAlign = getCardFieldAlign(card, 'subtitle')
  const bodyAlign = getCardFieldAlign(card, 'body')
  const closingAlign = getCardFieldAlign(card, 'closing')
  const recipientStyle = getCardSectionTextStyle(card, 'recipient')
  const titleStyle = getCardSectionTextStyle(card, 'title')
  const subtitleStyle = getCardSectionTextStyle(card, 'subtitle')
  const closingStyle = getCardSectionTextStyle(card, 'closing')
  const recipientLine = formatCardRecipientLine(card)

  const blockTextStyle = (style: ReturnType<typeof getCardSectionTextStyle>) => ({
    fontSize: style.fontSizePt * 2,
    color: style.color,
    fontFamily: getCardFontCss(style.fontFamily),
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecorationLine: style.underline ? 'underline' : 'none',
  } as const)

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
            {churchName}
          </p>
          <p
            className="mt-2 self-center max-w-2xl text-center leading-snug text-stone-600"
            style={{ fontSize: sizes.councilAddress }}
          >
            {CARD_COUNCIL_ADDRESS}
          </p>
          <p
            className="mt-1 self-center text-center text-stone-600"
            style={{ fontSize: sizes.councilAddress }}
          >
            {CARD_COUNCIL_PHONES}
          </p>

          {shouldShowCardTemplateBadge(card) ? (
            <span
              className="mt-6 self-center rounded-full bg-[#e8f0f7] px-4 py-1 text-center font-bold uppercase tracking-wider text-[#1a4d7c]"
              style={{ fontSize: sizes.badge }}
            >
              {templateDef.name}
            </span>
          ) : null}

          <p
            className="mt-6 w-full text-right text-stone-800"
            style={{ fontSize: sizes.documentDate }}
          >
            {formatCardDocumentLine(documentDate)}
          </p>

          {recipientLine ? (
            <p
              className={cn(
                'mt-4 break-words',
                cardBlockClassName(recipientAlign),
              )}
              style={blockTextStyle(recipientStyle)}
            >
              {recipientLine}
            </p>
          ) : null}

          {titleVisible ? (
            <h1
              className={cn(
                'mt-4 break-words leading-tight',
                cardBlockClassName(titleAlign),
              )}
              style={blockTextStyle(titleStyle)}
            >
              {title}
            </h1>
          ) : null}
          {card.subtitle?.trim() ? (
            <p
              className={cn('mt-2 break-words', cardBlockClassName(subtitleAlign))}
              style={blockTextStyle(subtitleStyle)}
            >
              {card.subtitle.trim()}
            </p>
          ) : null}

          {titleVisible || card.subtitle?.trim() ? (
            <div className="my-6 h-0.5 w-12 self-center rounded-full bg-[#c47a2c]" />
          ) : (
            <div className="h-5" aria-hidden />
          )}

          {bodyPlainText.trim() ? (
            <div className={cn('break-words', cardBlockClassName(bodyAlign))}>
              <CardRichTextContent
                document={bodyDocument}
                defaultFontSize={sizes.body}
                defaultLineHeight={sizes.bodyLineHeight}
                defaultAlign={bodyAlign}
                defaultColor="#292524"
                fontScale={fontScale}
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
                'mt-8 break-words',
                cardBlockClassName(closingAlign),
              )}
              style={blockTextStyle(closingStyle)}
            >
              {card.closing.trim()}
            </p>
          ) : null}

          <CardSignaturesDisplay card={card} sizes={sizes} />

          {shouldShowCardSeal(card) ? (
            <div className="mt-6 flex w-full justify-end opacity-70">
              <img
                src={CARD_SEAL_SRC}
                alt="Sello del concilio"
                className="pointer-events-none h-[220px] w-[220px] object-contain"
                style={{ transform: 'rotate(-7deg)' }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
