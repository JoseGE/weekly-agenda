import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import { ChurchCardShareImage } from '@/components/share/ChurchCardShareImage'
import type { ChurchCard } from '@/types'

export async function downloadCardImage(card: ChurchCard, churchName: string): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    flushSync(() => {
      root.render(<ChurchCardShareImage card={card} churchName={churchName} />)
    })

    const node = container.querySelector('[data-church-card-share]')
    if (!node || !(node instanceof HTMLElement)) {
      throw new Error('No se pudo generar la imagen de la carta')
    }

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#faf6ef',
    })

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `carta-${card.template}-${card.id.slice(0, 8)}.png`
    link.click()
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}
