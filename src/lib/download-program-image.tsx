import { createRoot, type Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import {
  PROGRAM_SHARE_IMAGE_PIXEL_RATIO,
  PROGRAM_SHARE_IMAGE_WIDTH,
  ProgramShareImage,
} from '@/components/share/ProgramShareImage'
import { getPdfFontScale } from '@/lib/pdf-font-scale'
import type { Member, WeeklyProgram } from '@/types'

const CANVAS_MAX_DIMENSION = 16384
const FONTS_READY_TIMEOUT_MS = 8000

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

async function waitForFonts(): Promise<void> {
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, FONTS_READY_TIMEOUT_MS)
      }),
    ])
  } catch {
    // Seguimos aunque las fuentes no hayan cargado del todo.
  }
}

function getSafePixelRatio(width: number, height: number): number {
  let ratio = PROGRAM_SHARE_IMAGE_PIXEL_RATIO
  while (ratio > 1 && Math.max(width * ratio, height * ratio) > CANVAS_MAX_DIMENSION) {
    ratio -= 0.5
  }
  return Math.max(1, ratio)
}

async function savePng(dataUrl: string, filename: string): Promise<void> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const file = new File([blob], filename, { type: 'image/png' })

  if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
    }
  }

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

function createExportContainer(): HTMLDivElement {
  const container = document.createElement('div')
  container.setAttribute('aria-hidden', 'true')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = `${PROGRAM_SHARE_IMAGE_WIDTH}px`
  container.style.minWidth = `${PROGRAM_SHARE_IMAGE_WIDTH}px`
  container.style.maxWidth = 'none'
  container.style.pointerEvents = 'none'
  container.style.overflow = 'visible'
  document.body.appendChild(container)
  return container
}

export async function downloadProgramImage(
  program: WeeklyProgram,
  churchName: string,
  members: Member[],
  fontScale = getPdfFontScale(),
): Promise<void> {
  const container = createExportContainer()
  const root: Root = createRoot(container)

  try {
    flushSync(() => {
      root.render(
        <ProgramShareImage
          program={program}
          churchName={churchName}
          members={members}
          fontScale={fontScale}
        />,
      )
    })

    await waitForLayout()
    await waitForFonts()

    const node = container.querySelector('[data-program-share-image]')
    if (!node || !(node instanceof HTMLElement)) {
      throw new Error('No se pudo generar la imagen del programa')
    }

    const width = PROGRAM_SHARE_IMAGE_WIDTH
    const height = Math.ceil(node.scrollHeight)

    if (height < 1) {
      throw new Error('El programa no tiene contenido para exportar')
    }

    const pixelRatio = getSafePixelRatio(width, height)

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio,
      width,
      height,
      backgroundColor: '#ffffff',
    })

    await savePng(dataUrl, `programa-${program.weekStartDate}-whatsapp.png`)
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}
