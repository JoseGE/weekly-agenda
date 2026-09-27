import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { ChurchCard } from '@/types'
import { CardRichTextPdfContent } from '@/components/pdf/CardRichTextPdfContent'
import { CardSignaturesPdf } from '@/components/pdf/CardSignaturesPdf'
import { createCardPdfStyles, cardColors } from '@/lib/card-document-styles'
import {
  CARD_COUNCIL_ADDRESS,
  CARD_COUNCIL_PHONES,
  cardPdfBlockStyle,
  formatCardDocumentLine,
  formatCardEventDate,
  formatCardEventTime,
  getCardBodyTypography,
  getCardFieldAlign,
  getCardFontScale,
  getCardTemplateDefinition,
  getDefaultCardDocumentDate,
  shouldShowCardEventBlock,
  shouldShowCardSeal,
  shouldShowCardTemplateBadge,
  shouldUseCompactCardLayout,
} from '@/lib/card-utils'
import { resolveCardSealSource } from '@/lib/card-seal'
import type { CardTextAlign } from '@/types'
import {
  cardRichTextToPlainText,
  formatCardRecipientLine,
  getCardRichTextDocument,
  shouldShowCardTitle,
} from '@/lib/card-rich-text'
import { getCardPdfFontFamily, getCardSectionTextStyle } from '@/lib/card-text-styles'
import { registerCardPdfFonts } from '@/lib/card-pdf-fonts'

registerCardPdfFonts()

interface ChurchCardPdfDocumentProps {
  card: ChurchCard
  churchName: string
}

function OrnamentDivider({ styles }: { styles: ReturnType<typeof createCardPdfStyles> }) {
  return (
    <View style={styles.ornamentRow}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  )
}

function CardFooter({ styles }: { styles: ReturnType<typeof createCardPdfStyles> }) {
  return (
    <View style={styles.footerOrnament}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  )
}

function PageFrame({ styles }: { styles: ReturnType<typeof createCardPdfStyles> }) {
  return (
    <>
      <View style={styles.fixedOuterFrameTop} fixed />
      <View style={styles.fixedOuterFrameRight} fixed />
      <View style={styles.fixedOuterFrameBottom} fixed />
      <View style={styles.fixedOuterFrameLeft} fixed />
      <View style={styles.fixedInnerFrameTop} fixed />
      <View style={styles.fixedInnerFrameRight} fixed />
      <View style={styles.fixedInnerFrameBottom} fixed />
      <View style={styles.fixedInnerFrameLeft} fixed />
    </>
  )
}

function EventBlock({
  card,
  styles,
}: {
  card: ChurchCard
  styles: ReturnType<typeof createCardPdfStyles>
}) {
  if (!shouldShowCardEventBlock(card)) return null

  return (
    <View style={styles.eventBox}>
      {card.eventDate ? (
        <Text style={styles.eventDate}>{formatCardEventDate(card.eventDate)}</Text>
      ) : null}
      {card.eventTime ? (
        <Text style={styles.eventTime}>{formatCardEventTime(card.eventTime)}</Text>
      ) : null}
      {card.location?.trim() ? (
        <Text style={styles.eventLocation}>{card.location.trim()}</Text>
      ) : null}
    </View>
  )
}

export function ChurchCardPdfDocument({ card, churchName }: ChurchCardPdfDocumentProps) {
  const bodyDocument = getCardRichTextDocument(card)
  const bodyPlainText = cardRichTextToPlainText(bodyDocument)
  const fontScale = getCardFontScale(card)
  const compact = shouldUseCompactCardLayout(bodyPlainText)
  const styles = createCardPdfStyles(compact, fontScale)
  const templateDef = getCardTemplateDefinition(card.template)
  const title = card.title.trim() || templateDef.name
  const titleVisible = shouldShowCardTitle(card)
  const documentDate = card.documentDate || getDefaultCardDocumentDate()

  const recipientAlign = getCardFieldAlign(card, 'recipient')
  const titleAlign = getCardFieldAlign(card, 'title')
  const subtitleAlign = getCardFieldAlign(card, 'subtitle')
  const bodyAlign = getCardFieldAlign(card, 'body')
  const closingAlign = getCardFieldAlign(card, 'closing')
  const bodyTypography = getCardBodyTypography(card.body, fontScale)
  const recipientStyle = getCardSectionTextStyle(card, 'recipient')
  const titleStyle = getCardSectionTextStyle(card, 'title')
  const subtitleStyle = getCardSectionTextStyle(card, 'subtitle')
  const closingStyle = getCardSectionTextStyle(card, 'closing')
  const recipientLine = formatCardRecipientLine(card)

  const alignStyle = (align: CardTextAlign) => ({ textAlign: align })
  const bodyTextStyle = {
    fontSize: bodyTypography.pdfFontSize,
    lineHeight: bodyTypography.pdfLineHeight,
  }
  const sectionStyle = (style: ReturnType<typeof getCardSectionTextStyle>) => ({
    fontSize: style.fontSizePt,
    color: style.color,
    fontFamily: getCardPdfFontFamily(style.fontFamily),
    fontStyle: style.italic ? ('italic' as const) : ('normal' as const),
    fontWeight: style.bold ? (700 as const) : (400 as const),
    textDecoration: style.underline ? ('underline' as const) : ('none' as const),
  })

  const renderHeader = () => (
    <>
      <OrnamentDivider styles={styles} />
      <Text style={styles.councilName}>{churchName}</Text>
      <Text style={styles.councilAddress}>{CARD_COUNCIL_ADDRESS}</Text>
      <Text style={styles.councilPhones}>{CARD_COUNCIL_PHONES}</Text>

      {shouldShowCardTemplateBadge(card) ? (
        <View style={styles.templateBadge}>
          <Text style={styles.templateBadgeText}>{templateDef.name}</Text>
        </View>
      ) : null}

      <Text style={styles.documentDateLine}>{formatCardDocumentLine(documentDate)}</Text>

      {recipientLine ? (
        <Text
          style={[
            styles.recipient,
            cardPdfBlockStyle(recipientAlign),
            alignStyle(recipientAlign),
            sectionStyle(recipientStyle),
          ]}
        >
          {recipientLine}
        </Text>
      ) : null}

      {titleVisible ? (
        <Text
          style={[
            styles.title,
            cardPdfBlockStyle(titleAlign),
            alignStyle(titleAlign),
            sectionStyle(titleStyle),
          ]}
        >
          {title}
        </Text>
      ) : null}
      {card.subtitle?.trim() ? (
        <Text
          style={[
            styles.subtitle,
            cardPdfBlockStyle(subtitleAlign),
            alignStyle(subtitleAlign),
            sectionStyle(subtitleStyle),
          ]}
        >
          {card.subtitle.trim()}
        </Text>
      ) : null}

      {titleVisible || card.subtitle?.trim() ? <View style={styles.divider} /> : null}
    </>
  )

  const renderBody = () => {
    if (!bodyPlainText.trim()) return null

    return (
      <View style={[styles.bodyWrap, cardPdfBlockStyle(bodyAlign)]}>
        <CardRichTextPdfContent
          document={bodyDocument}
          defaultFontSize={bodyTextStyle.fontSize}
          lineHeight={bodyTextStyle.lineHeight}
          align={bodyAlign}
          color={cardColors.text}
          fontScale={fontScale}
        />
      </View>
    )
  }

  const renderClosing = () =>
    card.closing?.trim() ? (
      <Text
        style={[
          styles.closing,
          cardPdfBlockStyle(closingAlign),
          alignStyle(closingAlign),
          sectionStyle(closingStyle),
        ]}
      >
        {card.closing.trim()}
      </Text>
    ) : null

  const renderSignatures = () => <CardSignaturesPdf card={card} styles={styles} />

  const renderSeal = () =>
    shouldShowCardSeal(card) ? (
      <View style={styles.sealWrap}>
        <Image src={resolveCardSealSource()} style={styles.sealImage} />
      </View>
    ) : null

  return (
    <Document title={title}>
      <Page size="LETTER" style={styles.page} wrap>
        <PageFrame styles={styles} />
        {renderHeader()}
        {renderBody()}
        <EventBlock card={card} styles={styles} />
        {renderClosing()}
        {renderSignatures()}
        {renderSeal()}
        <CardFooter styles={styles} />
      </Page>
    </Document>
  )
}
