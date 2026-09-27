import { StyleSheet } from '@react-pdf/renderer'
import { cardColors } from '@/lib/card-document-styles'
import { clampCardFontScale } from '@/lib/card-font-scale'
import { scaleSize } from '@/lib/pdf-document-styles'

export function createFriendCardPdfStyles(fontScaleInput = 1) {
  const fontScale = clampCardFontScale(fontScaleInput)
  const fs = (size: number) => scaleSize(size, fontScale)

  return StyleSheet.create({
    page: {
      backgroundColor: cardColors.cream,
      paddingVertical: 28,
      paddingHorizontal: 36,
      fontFamily: 'Times-Roman',
      color: cardColors.navyDark,
    },
    outerFrame: {
      flex: 1,
      borderWidth: 2,
      borderColor: cardColors.gold,
      padding: 2,
    },
    innerFrame: {
      flex: 1,
      borderWidth: 1,
      borderColor: cardColors.creamBorder,
      paddingVertical: 28,
      paddingHorizontal: 36,
      alignItems: 'center',
    },
    churchName: {
      fontSize: fs(11),
      fontFamily: 'Times-Bold',
      textAlign: 'center',
      marginBottom: fs(10),
    },
    badge: {
      backgroundColor: cardColors.navySoft,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 14,
      marginBottom: fs(14),
    },
    badgeText: {
      fontSize: fs(8),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.navy,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: fs(22),
      fontFamily: 'Times-Bold',
      textAlign: 'center',
      marginBottom: fs(8),
    },
    titleDivider: {
      width: scaleSize(40, fontScale),
      height: 1,
      backgroundColor: cardColors.goldMuted,
      marginBottom: fs(14),
    },
    greeting: {
      fontSize: fs(12),
      fontStyle: 'italic',
      textAlign: 'center',
      marginBottom: fs(10),
    },
    body: {
      fontSize: fs(11),
      lineHeight: 1.55,
      textAlign: 'center',
      marginBottom: fs(12),
      maxWidth: scaleSize(420, fontScale),
    },
    quoteBox: {
      width: '100%',
      maxWidth: scaleSize(420, fontScale),
      borderWidth: 1,
      borderColor: cardColors.goldMuted,
      borderRadius: 10,
      backgroundColor: '#f3f7fb',
      paddingVertical: fs(14),
      paddingHorizontal: fs(18),
      marginBottom: fs(12),
      alignItems: 'center',
    },
    quoteMark: {
      fontSize: fs(18),
      color: cardColors.gold,
      marginBottom: fs(4),
    },
    quoteText: {
      fontSize: fs(12),
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: 1.45,
    },
    quoteReference: {
      fontSize: fs(10),
      color: cardColors.textSoft,
      marginTop: fs(6),
      textAlign: 'center',
    },
    scriptTitle: {
      fontSize: fs(24),
      fontFamily: 'Times-BoldItalic',
      color: cardColors.gold,
      textAlign: 'center',
      marginBottom: fs(12),
    },
    eventRow: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: scaleSize(420, fontScale),
      borderWidth: 1.5,
      borderColor: cardColors.gold,
      borderRadius: 8,
      marginBottom: fs(14),
    },
    eventCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: fs(14),
      paddingHorizontal: fs(10),
    },
    eventCellBorder: {
      borderRightWidth: 1,
      borderRightColor: cardColors.goldMuted,
    },
    eventIcon: {
      fontSize: fs(16),
      marginBottom: fs(6),
    },
    eventText: {
      fontSize: fs(12),
      fontFamily: 'Times-Bold',
      textAlign: 'center',
      lineHeight: 1.4,
    },
    closing: {
      fontSize: fs(12),
      textAlign: 'center',
      marginTop: fs(8),
      marginBottom: fs(10),
    },
    signatureWrap: {
      alignItems: 'center',
      marginTop: fs(6),
    },
    friendSignature: {
      fontSize: fs(28),
      fontFamily: 'Times-BoldItalic',
      textAlign: 'center',
    },
    signatureLine: {
      width: scaleSize(120, fontScale),
      height: 1,
      backgroundColor: cardColors.navyDark,
      marginTop: fs(4),
      opacity: 0.7,
    },
  })
}

export type FriendCardPdfStyles = ReturnType<typeof createFriendCardPdfStyles>
