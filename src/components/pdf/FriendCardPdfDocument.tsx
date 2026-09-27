import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { ChurchCard } from '@/types'
import { createFriendCardPdfStyles } from '@/lib/friend-card-document-styles'
import { formatCardEventTime, getCardFontScale } from '@/lib/card-utils'
import { getFriendEventDateLabel } from '@/lib/card-layout'

interface FriendCardPdfDocumentProps {
  card: ChurchCard
  churchName: string
}

export function FriendCardPdfDocument({ card, churchName }: FriendCardPdfDocumentProps) {
  const fontScale = getCardFontScale(card)
  const styles = createFriendCardPdfStyles(fontScale)
  const eventDateLabel = getFriendEventDateLabel(card)
  const eventTimeLabel = card.eventTime ? formatCardEventTime(card.eventTime) : ''
  const showEventRow = Boolean(eventDateLabel || eventTimeLabel)

  return (
    <Document title={card.title.trim() || 'Carta para amigos'}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            <Text style={styles.churchName}>{churchName}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Invitación</Text>
            </View>

            <Text style={styles.title}>{card.title.trim() || 'Una invitación especial'}</Text>
            <View style={styles.titleDivider} />

            {card.greeting?.trim() ? (
              <Text style={styles.greeting}>{card.greeting.trim()}</Text>
            ) : null}

            {card.body.trim() ? <Text style={styles.body}>{card.body.trim()}</Text> : null}

            {card.quote?.trim() ? (
              <View style={styles.quoteBox}>
                <Text style={styles.quoteMark}>“</Text>
                <Text style={styles.quoteText}>{card.quote.trim()}</Text>
                {card.quoteReference?.trim() ? (
                  <Text style={styles.quoteReference}>{card.quoteReference.trim()}</Text>
                ) : null}
              </View>
            ) : null}

            {card.subtitle?.trim() ? (
              <Text style={styles.scriptTitle}>{card.subtitle.trim()}</Text>
            ) : null}

            {showEventRow ? (
              <View style={styles.eventRow}>
                <View style={[styles.eventCell, styles.eventCellBorder]}>
                  <Text style={styles.eventIcon}>📅</Text>
                  <Text style={styles.eventText}>{eventDateLabel || '—'}</Text>
                </View>
                <View style={[styles.eventCell, styles.eventCellBorder]}>
                  <Text style={styles.eventIcon}>🕐</Text>
                  <Text style={styles.eventText}>{eventTimeLabel || '—'}</Text>
                </View>
                <View style={styles.eventCell}>
                  <Text style={styles.eventIcon}>♥</Text>
                </View>
              </View>
            ) : null}

            {card.closing?.trim() ? (
              <Text style={styles.closing}>
                {card.closing.trim()} ♥
              </Text>
            ) : null}

            {card.friendSignature?.trim() ? (
              <View style={styles.signatureWrap}>
                <Text style={styles.friendSignature}>{card.friendSignature.trim()}</Text>
                <View style={styles.signatureLine} />
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  )
}
