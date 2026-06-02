import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import { ProgramShareImage } from '@/components/share/ProgramShareImage'
import type { Member, WeeklyProgram } from '@/types'

export async function downloadProgramImage(
  program: WeeklyProgram,
  churchName: string,
  members: Member[],
): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    flushSync(() => {
      root.render(
        <ProgramShareImage program={program} churchName={churchName} members={members} />,
      )
    })

    const node = container.querySelector('[data-program-share-image]')
    if (!node || !(node instanceof HTMLElement)) {
      throw new Error('No se pudo generar la imagen del programa')
    }

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    })

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `programa-${program.weekStartDate}-whatsapp.png`
    link.click()
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}
