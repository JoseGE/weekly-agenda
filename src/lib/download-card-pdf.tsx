import { pdf } from '@react-pdf/renderer'
import { ChurchCardPdfDocument } from '@/components/pdf/ChurchCardPdfDocument'
import { FriendCardPdfDocument } from '@/components/pdf/FriendCardPdfDocument'
import { isFriendCard } from '@/lib/card-layout'
import type { ChurchCard } from '@/types'

export async function downloadCardPdf(card: ChurchCard, churchName: string): Promise<void> {
  await document.fonts.ready
  const pdfDocument = isFriendCard(card) ? (
    <FriendCardPdfDocument card={card} churchName={churchName} />
  ) : (
    <ChurchCardPdfDocument card={card} churchName={churchName} />
  )

  const blob = await pdf(pdfDocument).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `carta-${card.template}-${card.id.slice(0, 8)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
