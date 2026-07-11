import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { ChurchCard } from '@/types'
import { CardBodyPdfContent } from '@/components/pdf/CardBodyPdfContent'
import { createCardPdfStyles, cardColors } from '@/lib/card-document-styles'
import {
  CARD_COUNCIL_ADDRESS,
  CARD_COUNCIL_NAME,
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
  shouldUseCardSecondPage,
  shouldUseCompactCardLayout,
  splitCardBodyForPdf,
} from '@/lib/card-utils'
import type { CardTextAlign } from '@/types'

interface ChurchCardPdfDocumentProps {
  card: ChurchCard
  churchName: string
}

function OrnamentDivider({ styles }: { styles: ReturnType<typeof createCardPdfStyles> }) {
  return (
    <View style={styles.ornamentRow}>
      <View style={styles.ornamentLine} />
      <Text style={styles.ornamentDiamond}>◆</Text>
      <View style={styles.ornamentLine} />
    </View>
  )
}

function CardFooter({
  styles,
  churchName,
}: {
  styles: ReturnType<typeof createCardPdfStyles>
  churchName: string
}) {
  return (
    <>
      <View style={styles.footerOrnament}>
        <View style={styles.ornamentLine} />
        <Text style={styles.ornamentDiamond}>◆</Text>
        <View style={styles.ornamentLine} />
      </View>
      <Text style={styles.footerText}>{churchName}</Text>
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
  const fontScale = getCardFontScale(card)
  const compact = shouldUseCompactCardLayout(card.body)
  const styles = createCardPdfStyles(compact, fontScale)
  const templateDef = getCardTemplateDefinition(card.template)
  const title = card.title.trim() || templateDef.name
  const documentDate = card.documentDate || getDefaultCardDocumentDate()

  const recipientAlign = getCardFieldAlign(card, 'recipient')
  const titleAlign = getCardFieldAlign(card, 'title')
  const subtitleAlign = getCardFieldAlign(card, 'subtitle')
  const bodyAlign = getCardFieldAlign(card, 'body')
  const closingAlign = getCardFieldAlign(card, 'closing')
  const bodyTypography = getCardBodyTypography(card.body, fontScale)

  const alignStyle = (align: CardTextAlign) => ({ textAlign: align })
  const bodyTextStyle = {
    fontSize: bodyTypography.pdfFontSize,
    lineHeight: bodyTypography.pdfLineHeight,
  }

  const useSecondPage = shouldUseCardSecondPage(card.body)
  const [bodyFirstPage, bodySecondPage] = splitCardBodyForPdf(card.body)

  const renderHeader = () => (
    <>
      <OrnamentDivider styles={styles} />
      <Text style={styles.councilName}>{CARD_COUNCIL_NAME}</Text>
      <Text style={styles.councilAddress}>{CARD_COUNCIL_ADDRESS}</Text>

      <View style={styles.templateBadge}>
        <Text style={styles.templateBadgeText}>{templateDef.name}</Text>
      </View>

      <Text style={styles.documentDateLine}>{formatCardDocumentLine(documentDate)}</Text>

      {card.recipient?.trim() ? (
        <Text
          style={[
            styles.recipient,
            cardPdfBlockStyle(recipientAlign),
            alignStyle(recipientAlign),
          ]}
        >
          Para: {card.recipient.trim()}
        </Text>
      ) : null}

      <Text style={[styles.title, cardPdfBlockStyle(titleAlign), alignStyle(titleAlign)]}>
        {title}
      </Text>
      {card.subtitle?.trim() ? (
        <Text
          style={[styles.subtitle, cardPdfBlockStyle(subtitleAlign), alignStyle(subtitleAlign)]}
        >
          {card.subtitle.trim()}
        </Text>
      ) : null}

      <View style={styles.divider} />
    </>
  )

  const renderBody = (text: string, continuation = false) => {
    if (!text.trim()) return null

    return (
      <View style={[styles.bodyWrap, cardPdfBlockStyle(bodyAlign)]}>
        {continuation ? (
          <Text style={[styles.continuationLabel, alignStyle(bodyAlign)]}>(continúa)</Text>
        ) : null}
        <CardBodyPdfContent
          body={text}
          fontSize={bodyTextStyle.fontSize}
          lineHeight={bodyTextStyle.lineHeight}
          align={bodyAlign}
          color={cardColors.text}
        />
      </View>
    )
  }

  const renderClosing = () =>
    card.closing?.trim() ? (
      <Text style={[styles.closing, cardPdfBlockStyle(closingAlign), alignStyle(closingAlign)]}>
        {card.closing.trim()}
      </Text>
    ) : null

  if (useSecondPage) {
    return (
      <Document title={title}>
        <Page size="LETTER" style={styles.page}>
          <View style={styles.outerFrame}>
            <View style={styles.innerFrame}>
              {renderHeader()}
              {renderBody(bodyFirstPage)}
            </View>
          </View>
        </Page>
        <Page size="LETTER" style={styles.page}>
          <View style={styles.outerFrame}>
            <View style={styles.innerFrame}>
              {renderBody(bodySecondPage, true)}
              <EventBlock card={card} styles={styles} />
              {renderClosing()}
              <CardFooter styles={styles} churchName={churchName} />
            </View>
          </View>
        </Page>
      </Document>
    )
  }

  return (
    <Document title={title}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            {renderHeader()}
            {renderBody(bodyFirstPage)}
            <EventBlock card={card} styles={styles} />
            {renderClosing()}
            <CardFooter styles={styles} churchName={churchName} />
          </View>
        </View>
      </Page>
    </Document>
  )
}
