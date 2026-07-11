import { StyleSheet } from '@react-pdf/renderer'
import { pdfColors, scaleSize } from '@/lib/pdf-document-styles'
import { clampCardFontScale } from '@/lib/card-font-scale'

export const cardColors = {
  ...pdfColors,
  cream: '#faf6ef',
  creamBorder: '#e8dcc8',
  goldMuted: '#d4a574',
  ornament: '#1a4d7c',
} as const

export function createCardPdfStyles(compact = false, fontScaleInput = 1) {
  const fontScale = clampCardFontScale(fontScaleInput)
  const fs = (size: number) => scaleSize(size, fontScale)

  return StyleSheet.create({
    page: {
      backgroundColor: cardColors.cream,
      paddingVertical: compact ? 28 : 36,
      paddingHorizontal: 40,
      fontFamily: 'Helvetica',
      fontSize: fs(11),
      color: cardColors.text,
    },
    outerFrame: {
      flex: 1,
      borderWidth: 2,
      borderColor: cardColors.gold,
      padding: 3,
    },
    innerFrame: {
      flex: 1,
      borderWidth: 1,
      borderColor: cardColors.creamBorder,
      paddingVertical: compact ? 18 : 28,
      paddingHorizontal: 32,
      alignItems: 'stretch',
    },
    ornamentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: fs(10),
      width: '100%',
      alignSelf: 'center',
    },
    ornamentLine: {
      height: 1,
      flex: 1,
      backgroundColor: cardColors.goldMuted,
      maxWidth: scaleSize(80, fontScale),
    },
    ornamentDiamond: {
      fontSize: fs(10),
      color: cardColors.gold,
      marginHorizontal: 8,
    },
    councilName: {
      fontSize: fs(13),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.navyDark,
      textAlign: 'center',
      letterSpacing: 0.6,
      marginBottom: 4,
      alignSelf: 'center',
      maxWidth: scaleSize(420, fontScale),
    },
    councilAddress: {
      fontSize: fs(9),
      color: cardColors.textSoft,
      textAlign: 'center',
      lineHeight: 1.35,
      marginBottom: compact ? fs(10) : fs(14),
      alignSelf: 'center',
      maxWidth: scaleSize(420, fontScale),
    },
    templateBadge: {
      backgroundColor: cardColors.navySoft,
      borderRadius: 12,
      paddingVertical: 3,
      paddingHorizontal: 12,
      marginBottom: compact ? fs(10) : fs(14),
      alignSelf: 'center',
    },
    templateBadgeText: {
      fontSize: fs(8),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.navy,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    documentDateLine: {
      fontSize: fs(10),
      color: cardColors.text,
      marginBottom: fs(10),
      width: '100%',
      textAlign: 'right',
    },
    recipient: {
      fontSize: fs(10),
      color: cardColors.textSoft,
      marginBottom: 8,
      fontStyle: 'italic',
      width: '100%',
    },
    title: {
      fontSize: fs(20),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.navyDark,
      lineHeight: 1.2,
      marginBottom: 6,
      width: '100%',
    },
    subtitle: {
      fontSize: fs(12),
      color: cardColors.navy,
      marginBottom: compact ? fs(10) : fs(14),
      width: '100%',
    },
    divider: {
      width: scaleSize(48, fontScale),
      height: 2,
      backgroundColor: cardColors.gold,
      marginBottom: compact ? fs(10) : fs(16),
      alignSelf: 'center',
    },
    bodyWrap: {
      width: '100%',
      marginBottom: compact ? fs(10) : fs(16),
    },
    body: {
      color: cardColors.text,
    },
    eventBox: {
      backgroundColor: cardColors.white,
      borderWidth: 1,
      borderColor: cardColors.creamBorder,
      borderRadius: 8,
      paddingVertical: fs(10),
      paddingHorizontal: 16,
      marginBottom: compact ? fs(10) : fs(16),
      width: '100%',
      maxWidth: scaleSize(360, fontScale),
      alignSelf: 'center',
      alignItems: 'center',
    },
    eventDate: {
      fontSize: fs(12),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.navyDark,
      textAlign: 'center',
      marginBottom: 2,
    },
    eventTime: {
      fontSize: fs(11),
      color: cardColors.navy,
      textAlign: 'center',
    },
    eventLocation: {
      fontSize: fs(10),
      color: cardColors.textSoft,
      textAlign: 'center',
      marginTop: 4,
    },
    closing: {
      fontSize: fs(11),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.gold,
      marginBottom: compact ? fs(12) : fs(20),
      width: '100%',
    },
    footerOrnament: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      marginTop: 'auto',
      width: '100%',
      alignSelf: 'center',
    },
    footerText: {
      fontSize: fs(10),
      fontFamily: 'Helvetica-Bold',
      color: cardColors.navyDark,
      textAlign: 'center',
      alignSelf: 'center',
    },
    footerSub: {
      fontSize: fs(8.5),
      color: cardColors.textMuted,
      textAlign: 'center',
      marginTop: 2,
      alignSelf: 'center',
    },
    continuationLabel: {
      fontSize: fs(9),
      color: cardColors.textMuted,
      fontStyle: 'italic',
      marginBottom: 8,
      width: '100%',
    },
  })
}

export type CardPdfStyles = ReturnType<typeof createCardPdfStyles>
