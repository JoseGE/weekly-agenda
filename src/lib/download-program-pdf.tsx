import { pdf } from '@react-pdf/renderer'
import { ProgramPdfDocument } from '@/components/pdf/ProgramPdfDocument'
import type { Member, WeeklyProgram } from '@/types'

export async function downloadProgramPdf(
  program: WeeklyProgram,
  churchName: string,
  members: Member[],
): Promise<void> {
  const blob = await pdf(
    <ProgramPdfDocument program={program} churchName={churchName} members={members} />,
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `programa-${program.weekStartDate}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
