import { StyleSheet } from '@react-pdf/renderer'
import { clampPdfFontScale } from '@/lib/pdf-font-scale'

export const pdfColors = {
  white: '#ffffff',
  border: '#e5e7eb',
  navy: '#1a4d7c',
  navyDark: '#0f2d4a',
  navySoft: '#e8f0f7',
  gold: '#c47a2c',
  goldSoft: '#fef7ed',
  goldBorder: '#f0c987',
  special: '#b45309',
  specialSoft: '#fffbeb',
  specialBorder: '#f59e0b',
  text: '#1c1917',
  textSoft: '#57534e',
  textMuted: '#78716c',
  partBg: '#fafaf9',
} as const

function scaleSize(value: number, fontScale: number): number {
  return Math.round(value * fontScale * 10) / 10
}

export function createPdfStyles(fontScaleInput = 1) {
  const fontScale = clampPdfFontScale(fontScaleInput)
  const fs = (size: number) => scaleSize(size, fontScale)

  return StyleSheet.create({
    page: {
      backgroundColor: pdfColors.white,
      paddingTop: 10,
      paddingBottom: 18,
      paddingHorizontal: 24,
      fontFamily: 'Helvetica',
      fontSize: fs(12),
      color: pdfColors.text,
    },
    header: {
      borderWidth: 1,
      borderColor: pdfColors.border,
      borderRadius: 6,
      paddingVertical: 3,
      paddingHorizontal: 8,
      marginBottom: 3,
      alignItems: 'center',
    },
    headerAccent: {
      width: 32,
      height: 2,
      backgroundColor: pdfColors.gold,
      borderRadius: 1,
      marginBottom: 2,
    },
    churchName: {
      fontSize: fs(16),
      fontFamily: 'Helvetica-Bold',
      textAlign: 'center',
      color: pdfColors.navyDark,
      lineHeight: 1.1,
      marginBottom: 1,
    },
    headerSubtitle: {
      fontSize: fs(12),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.navy,
      textAlign: 'center',
      marginBottom: 2,
    },
    themePill: {
      backgroundColor: pdfColors.navySoft,
      borderRadius: 12,
      paddingVertical: 1,
      paddingHorizontal: 6,
    },
    themeText: {
      fontSize: fs(9),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.navyDark,
      textAlign: 'center',
    },
    daySection: {
      marginBottom: 5,
    },
    dayHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
      marginTop: 2,
    },
    dayDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: pdfColors.gold,
      marginRight: 6,
    },
    dayHeaderText: {
      fontSize: fs(13),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.navyDark,
    },
    announcementCard: {
      backgroundColor: pdfColors.goldSoft,
      borderWidth: 1,
      borderColor: pdfColors.goldBorder,
      borderRadius: 6,
      paddingVertical: 2,
      paddingHorizontal: 4,
      marginBottom: 4,
      marginLeft: 12,
    },
    announcementText: {
      fontSize: fs(13),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.gold,
      lineHeight: 1.35,
    },
    announcementLocation: {
      fontSize: fs(11),
      color: pdfColors.textSoft,
      marginTop: 2,
    },
    eventCard: {
      backgroundColor: pdfColors.white,
      borderWidth: 1,
      borderColor: pdfColors.border,
      borderRadius: 6,
      paddingVertical: 2,
      paddingHorizontal: 4,
      marginBottom: 4,
      marginLeft: 12,
    },
    eventCardSpecial: {
      borderColor: pdfColors.specialBorder,
      borderWidth: 1,
      backgroundColor: pdfColors.specialSoft,
    },
    headlineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 1,
    },
    timeChip: {
      backgroundColor: pdfColors.navySoft,
      borderRadius: 5,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginRight: 6,
    },
    timeChipText: {
      fontSize: fs(12),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.navy,
    },
    eventTitle: {
      flex: 1,
      fontSize: fs(13.5),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.text,
      lineHeight: 1,
    },
    specialHeadline: {
      fontSize: fs(13.5),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.special,
      lineHeight: 1,
      marginBottom: 1,
    },
    eventLocation: {
      fontSize: fs(12),
      color: pdfColors.textSoft,
      marginBottom: 2,
      marginTop: 1,
    },
    partsBox: {
      backgroundColor: pdfColors.partBg,
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: pdfColors.border,
      paddingVertical: 2,
      paddingHorizontal: 4,
      marginTop: 1,
    },
    partRow: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    partName: {
      width: scaleSize(105, fontScale),
      fontSize: fs(12.5),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.navyDark,
    },
    partMembers: {
      flex: 1,
      fontSize: fs(12.5),
      color: pdfColors.text,
    },
    footer: {
      marginTop: 10,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: pdfColors.goldBorder,
      alignItems: 'center',
    },
    footerText: {
      fontSize: fs(14),
      fontFamily: 'Helvetica-Bold',
      color: pdfColors.gold,
    },
    pageNumber: {
      position: 'absolute',
      bottom: 12,
      right: 28,
      fontSize: fs(8),
      color: pdfColors.textMuted,
    },
    birthdaysBox: {
      backgroundColor: '#fdf2f8',
      borderWidth: 1,
      borderColor: '#f9a8d4',
      borderRadius: 6,
      paddingVertical: 5,
      paddingHorizontal: 7,
      marginTop: 5,
      marginBottom: 4,
    },
    birthdaysTitle: {
      fontSize: fs(11),
      fontFamily: 'Helvetica-Bold',
      color: '#9d174d',
      marginBottom: 3,
    },
    birthdayRow: {
      flexDirection: 'row',
      marginBottom: 1,
    },
    birthdayDay: {
      width: scaleSize(76, fontScale),
      fontSize: fs(11),
      fontFamily: 'Helvetica-Bold',
      color: '#831843',
    },
    birthdayNames: {
      flex: 1,
      fontSize: fs(11),
      color: pdfColors.text,
    },
  })
}

export type PdfStyles = ReturnType<typeof createPdfStyles>
