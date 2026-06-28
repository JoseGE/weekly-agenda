import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { ChurchCard } from '@/types'
import { createCardPdfStyles } from '@/lib/card-document-styles'
import {
  CENTRAL_CARD_TAGLINE,
  formatCardEventDate,
  formatCardEventTime,
  getCardFieldAlign,
  getCardTemplateDefinition,
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

export function ChurchCardPdfDocument({ card, churchName }: ChurchCardPdfDocumentProps) {
  const styles = createCardPdfStyles()
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

  const alignStyle = (align: CardTextAlign) => ({ textAlign: align })

  return (
    <Document title={title}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            <OrnamentDivider styles={styles} />
            <Text style={styles.churchName}>{churchName}</Text>
            <Text style={styles.tagline}>{CENTRAL_CARD_TAGLINE}</Text>

            <View style={styles.templateBadge}>
              <Text style={styles.templateBadgeText}>{templateDef.name}</Text>
            </View>

            {card.recipient?.trim() ? (
              <Text style={[styles.recipient, alignStyle(recipientAlign)]}>
                Para: {card.recipient.trim()}
              </Text>
            ) : null}

            <Text style={[styles.title, alignStyle(titleAlign)]}>{title}</Text>
            {card.subtitle?.trim() ? (
              <Text style={[styles.subtitle, alignStyle(subtitleAlign)]}>
                {card.subtitle.trim()}
              </Text>
            ) : null}

            <View style={styles.divider} />

            {card.body.trim() ? (
              <View style={styles.bodyWrap}>
                <Text style={[styles.body, alignStyle(bodyAlign)]}>{card.body.trim()}</Text>
              </View>
            ) : null}

            {showEvent && (card.eventDate || card.eventTime || card.location) ? (
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
            ) : null}

            {card.closing?.trim() ? (
              <Text style={styles.closing}>{card.closing.trim()}</Text>
            ) : null}

            <View style={styles.footerOrnament}>
              <View style={styles.ornamentLine} />
              <Text style={styles.ornamentDiamond}>◆</Text>
              <View style={styles.ornamentLine} />
            </View>
            <Text style={styles.footerText}>Iglesia Evangélica Pentecostal Central</Text>
            <Text style={styles.footerSub}>{churchName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
