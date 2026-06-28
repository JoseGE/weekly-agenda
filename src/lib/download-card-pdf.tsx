import { pdf } from '@react-pdf/renderer'
import { ChurchCardPdfDocument } from '@/components/pdf/ChurchCardPdfDocument'
import type { ChurchCard } from '@/types'

export async function downloadCardPdf(card: ChurchCard, churchName: string): Promise<void> {
  const blob = await pdf(
    <ChurchCardPdfDocument card={card} churchName={churchName} />,
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `carta-${card.template}-${card.id.slice(0, 8)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
