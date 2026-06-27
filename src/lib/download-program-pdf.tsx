import { pdf } from '@react-pdf/renderer'
import { ProgramPdfDocument } from '@/components/pdf/ProgramPdfDocument'
import { getPdfFontScale } from '@/lib/pdf-font-scale'
import type { Member, WeeklyProgram } from '@/types'

export async function downloadProgramPdf(
  program: WeeklyProgram,
  churchName: string,
  members: Member[],
  fontScale = getPdfFontScale(),
): Promise<void> {
  const blob = await pdf(
    <ProgramPdfDocument
      program={program}
      churchName={churchName}
      members={members}
      fontScale={fontScale}
    />,
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `programa-${program.weekStartDate}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
